import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SetStateAction, useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent,
    SheetTitle,
    // SheetFooter,
    // SheetHeader,
    // SheetClose,
    // SheetDescription,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    // CardFooter,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl";
import {
    getCardCountFromLocal,
    getCardsFromLocal,
    getPartOfSpeechesFromLocal,
    saveCardsToLocal,
    savePartOfSpeechToLocal,
    getUserInfoFromLocal, saveUserInfoToLocal
} from "@/app/lib/indexDB";
import {
    getCardsFromRemote,
    getPartOfSpeechesFromRemote, getUserInfoFromRemote,
    updateRemoteUserInfo, updateUserInfoToRemote,
    upsertCardToRemote,
    upsertPartOfSpeechToRemote
} from "@/app/lib/remoteDB";
import { PartOfSpeechLocal, WordCard, WordCardToRemote } from "@/types/WordCard";
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useLocale } from 'next-intl';
import {User, Word} from "@prisma/client";
import {
    GetCardsResult,
    GetPartOfSpeechesResult,
    GetUserInfoFromLocalResult,
    GetUserInfoFromRemoteResult, UpdatePromiseCommonResult, UpsertPartOfSpeechResult
} from "@/types/ActionsResult";
import {cn} from "@/lib/utils";
import {SignOut} from "@/components/ui/auth/signOut";

// このコンポーネントの主な機能：
// 1、プロフィールの編集
// 2、データの同期

export default function AvatarMenu({
    userId,
    url,
    userName,
    className = "fixed top-7 right-8",
    parentReload,
    children,
}: {
    userId:string | undefined,
    url: string | undefined | null,
    userName: string | undefined | null,
    className?: string
    parentReload: React.Dispatch<SetStateAction<boolean>>
    children?: React.ReactNode
}){
    const [progressVal, setProgressVal] = useState(0)
    const [progressMessage, setProgressMessage] = useState("")
    const [syncedAt, setSyncedAt] = useState<Date | null>()
    const [wordsCount, setWordsCount] = useState<number | undefined>(undefined)
    const [reLoad, setReload] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()
    const locale = useLocale();

    const t = useTranslations('User')

    useEffect(() => {
        const fetchSyncedAt = async () => {
            if (userId){
                const result = await getUserInfoFromRemote(userId)
                if (result.isSuccess){
                    setSyncedAt(result.data?.synced_at)
                }
                else {
                    console.error(result.error)
                    toast({
                        variant: "destructive",
                        title: t('sync_error_occurred'),
                        description: String(result.error)
                    })
                }
            }
        }

        // TODO 自動同期

        const fetchCardsCount = async () => {
            if (userId) {
                const result = await getCardCountFromLocal(userId)
                setWordsCount(result)
            }
        }
        fetchSyncedAt().catch()
        fetchCardsCount().catch()

        parentReload(prev => !prev)

    }, [userId, reLoad, parentReload, toast, t]);


    const handleSync = () => {
        if (userId) {
            startTransition(async () => {
                // 同期開始 ========================================================================================
                let progress = 0;
                setProgressMessage(t('sync_parOfSpeech'))

                //ローカルから品詞を取得
                const partOfSpeeches: PartOfSpeechLocal[] = await getPartOfSpeechesFromLocal().then()
                const partOfSpeechesToRemote: PartOfSpeechLocal[] = [...partOfSpeeches.map(value => {
                    value.author = userId
                    return value
                })]


                //ローカルにデータがある場合、「Synced_atがリモートよりも新しいデータ」だけをリモートにプッシュ
                if (partOfSpeeches.length > 0) {
                    await Promise.all(partOfSpeechesToRemote.map(async (value, index) => {
                        const result: UpsertPartOfSpeechResult = await upsertPartOfSpeechToRemote(value)

                        if (!result?.isSuccess) {
                            toast({
                                variant: "destructive",
                                title: t('sync_error_occurred'),
                                description: result.error.detail
                            })
                            console.error(result.error.detail);
                            console.error(`同期に失敗：${value}`)
                        } else {
                            progress += Math.floor((index + 1) / partOfSpeechesToRemote.length * 10)
                            setProgressVal(progress);
                        }
                    }))
                } else {
                    progress += 10;
                    setProgressVal(progress)
                }

                // リモートデータベースから品詞を取得
                const parOfSpeechFromRemote: GetPartOfSpeechesResult = await getPartOfSpeechesFromRemote(userId)
                if (!parOfSpeechFromRemote.isSuccess) {
                    //取得が失敗した場合、同期を中断
                    console.error(parOfSpeechFromRemote.detail)
                    toast({
                        variant: "destructive",
                        title: t('sync_local_error'),
                        description: t('sync_local_error')
                    });
                    return
                }

                //取得した品詞を一個ずつローカルに保存
                parOfSpeechFromRemote.data.map(async (value) => {
                    const data: PartOfSpeechLocal = {
                        id: value.id,
                        partOfSpeech: value.part_of_speech,
                        author: value.authorId,
                        is_deleted: value.is_deleted,
                        created_at: value.created_at,
                        updated_at: value.updated_at,
                        synced_at: value.synced_at
                    }
                    await savePartOfSpeechToLocal(data)
                })


                progress += 10;
                setProgressVal(progress)
                setProgressMessage(t('sync_words'))

                //ローカルから単語データを取得
                const wordData: WordCard[] = await getCardsFromLocal(userId, true).then()
                const words: WordCardToRemote[] = wordData.map(word => {
                    // WordCardのpartOfSpeechに対応するPartOfSpeechオブジェクトを取得
                    const correspondingPartOfSpeech = partOfSpeechesToRemote.find(pos => pos.id === word.partOfSpeech)
                    // マージ後のデータを作成
                    const mergedData: WordCardToRemote = {
                        ...word,
                        author: userId,
                        partOfSpeech: correspondingPartOfSpeech || undefined
                    }

                    return mergedData as WordCardToRemote;
                })

                //ローカルに単語データがある場合、それをリモートにプッシュ
                if (wordData.length > 0){
                    await Promise.all(words.map(async (word, index) => {
                        //Promise.allを使うことによって、words.mapの処理が全部終わってから次へ進むことを約束(Promise)してくれる
                        const result = await upsertCardToRemote(word)

                        if (!result.isSuccess) {
                            toast({
                                variant: "destructive",
                                title: t('sync_error_occurred'),
                                description: result.error.detail
                            });

                            console.error(result.error.detail);
                            console.error(`同期に失敗：${word}`)
                        } else {
                            progress += Math.floor((index + 1) / words.length * 30);
                            setProgressVal(progress);
                        }
                    }))
                } else {
                    progress += 30
                    setProgressVal(progress)
                }

                // リモートデータベースから単語を取得
                const cardsFromRemote: GetCardsResult = await getCardsFromRemote(userId)
                if (!cardsFromRemote.isSuccess) {
                    //取得が失敗した場合、同期を中断
                    console.error(cardsFromRemote.detail)
                    toast({
                        variant: "destructive",
                        title: t('sync_local_error'),
                        description: t('sync_local_error')
                    });
                    return
                }
                progress += 20
                setProgressVal(progress)

                //取得した単語データをチェック＆整形
                const cardsToIndexDB: Word[] = cardsFromRemote.data.map(value => {
                    const data: Word = {
                        id: value.id,
                        word: value.word,
                        phonetics: value.phonetics,
                        partOfSpeechId: value.partOfSpeechId,
                        definition: value.definition,
                        example: value.example,
                        notes: value.notes,
                        is_learned: value.is_learned,
                        created_at: value.created_at,
                        updated_at: value.updated_at,
                        synced_at: value.synced_at,
                        learned_at: value.learned_at,
                        retention_rate: value.retention_rate,
                        authorId: value.authorId,
                        is_deleted: value.is_deleted
                    }

                    return data
                })

                //整形したデータをローカルに保存
                const results = await saveCardsToLocal(cardsToIndexDB)

                if (!results.isSuccess) {
                    console.error(results.message)

                    toast({
                        variant: "destructive",
                        title: t('sync_local_error'),
                        description: t('sync_local_error')
                    });

                    return
                }

                progress += 20
                setProgressVal(progress)

                //ローカルからユーザー設定などの情報を取得
                //このコンポーネントにアクセスできている時点で、userIdは必ず存在する。
                //ユーザーの設定情報に関しては、ログイン済みのユーザーであれば、IndexDBに存在すべきである
                const userInfo: GetUserInfoFromLocalResult = await getUserInfoFromLocal(userId)

                //ローカルにユーザーデータが存在する場合それをリモートにプッシュ
                if (userInfo.data) {
                    console.log("ユーザーの情報ゲットしたぜ")
                    const userInfoToRemote: UserInfoToRemote = {
                        id: userId,
                        auto_sync: userInfo.data.auto_sync,
                        use_when_loggedout: userInfo.data.use_when_loggedout,
                        blind_mode: userInfo.data.blindMode,
                        updatedAt: userInfo.data.updated_at,
                        synced_at: userInfo.data.synced_at || new Date()
                    }

                    const result: UpdatePromiseCommonResult =　await updateUserInfoToRemote(userInfoToRemote)
                    //リモートへの同期が失敗した場合、同期を中断
                    if (!result.isSuccess) {
                        console.error(result.error.detail)
                        toast({
                            variant: "destructive",
                            title: t('sync_local_error'),
                            description: String(result.error.detail)
                        });
                        return
                    }
                }

                const userInfoFromRemote = await getUserInfoFromRemote(userId)
                if (userInfoFromRemote.isSuccess && userInfoFromRemote.data) {
                    const userInfoToLocal = await saveUserInfoToLocal(userInfoFromRemote.data)

                    if (!userInfoToLocal.isSuccess) {
                        console.error(userInfoToLocal.error.detail)
                        toast({
                            variant: "destructive",
                            title: t('sync_local_error'),
                            description: String(userInfoToLocal.error.detail)
                        });
                    }
                }

                progress += 10
                setProgressVal(progress)

                if (progress < 100) {
                    toast({
                        variant: "destructive",
                        title: t('sync_error'),
                        description: t('sync_error')
                    });

                    return
                }

                console.log("======================================================");

                setProgressVal(0)
                setReload(prev => !prev)

                toast({
                    title: t('sync_success'),
                    description: t('sync_success')
                })
            })
        }
    }

    return (
        <div className={cn("flex", className)}>
            <Sheet >
                <SheetTrigger
                    asChild>
                    <Button className={"rounded-full hover:scale-105 hover:ring-2 hover:ring-primary hover:ring-offset-4 transition-all duration-200"} size={"icon"} variant={"ghost"}>
                        <Avatar>
                            <AvatarImage className={"hover:opacity-90"} width={40} height={40} src={url || ""}/>
                            <AvatarFallback>{userName && userName[0] || "A"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </SheetTrigger>
                <SheetContent className={"flex flex-col max-w-[25rem] justify-between"} side={"right"}>
                    <div className={"flex flex-col"}>
                        <Card className={"mt-8 mb-3"}>
                            <CardHeader className={"items-center gap-2"}>
                                <Avatar className={"w-20 h-20"}>
                                    <AvatarImage src={url || ""}/>
                                    <AvatarFallback>{userName && userName[0] || "A"}</AvatarFallback>
                                </Avatar>
                                <SheetTitle className={"text-xl text-center"}>{userName}</SheetTitle>
                                <div className={"flex flex-col w-full p-6 gap-2 items-center justify-center"}>
                                    <h1 className={"text-5xl font-bold"}>{wordsCount}</h1>
                                    <p>{t("leaning")}</p>
                                </div>
                                <Separator />

                            </CardHeader>
                            <CardContent className={"flex flex-col px-9 pb-6"}>
                                {children}
                            </CardContent>
                        </Card>
                        <div>
                            <Card>
                                {isPending && <CardHeader className={"gap-3"}>
                                    <CardTitle className={"text-center"}>{t('syncing')}</CardTitle>
                                    <CardDescription className={"text-center"}>{progressMessage}</CardDescription>
                                    <Progress
                                        className={"h-2 w-full"}
                                        value={progressVal}/>
                                </CardHeader>}
                                {!isPending && <CardContent className={"flex flex-col pt-6 gap-4 items-center"}>
                                    <Button
                                        className={"w-full"}
                                        onClick={handleSync}
                                        type={"button"}
                                        disabled={isPending}
                                    >
                                        {t("sync")}
                                    </Button>
                                    {syncedAt ?
                                        <div className={"flex gap-4 text-foreground/50 text-xs text-center"}>
                                            <p>{`${t('synced_at')} : ${syncedAt.toLocaleString(locale, {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})}`}</p>
                                        </div> :
                                        <p className={"text-muted-foreground text-xs text-center"}>{t('sync_at_null')}</p>}
                                </CardContent>}
                            </Card>

                        </div>

                    </div>
                    <SignOut className={"flex flex-col w-full"} text={t('signOut')}/>
                    {/*<Button variant={"outline"}>{t('signOut')}</Button>*/}
                </SheetContent>
            </Sheet>
        </div>
    )
}