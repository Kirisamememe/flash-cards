import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SetStateAction, useEffect, useState, useTransition, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl";
import { PartOfSpeechLocal, WordCardToRemote } from "@/types/WordCard";
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useLocale } from 'next-intl';
import { cn } from "@/lib/utils";
import { CircleUser } from 'lucide-react';
import { SignOut } from "@/components/ui/auth/signOut";
import { getCardCountFromLocal, getCardsFromLocal, getPartOfSpeechesFromLocal, getUserInfoFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { saveCardsToLocal, savePartOfSpeechToLocal, saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";
import { getCardsFromRemote, getPartOfSpeechesFromRemote, getUserInfoFromRemote } from "@/app/lib/remoteDB/getFromRemote";
import { updateUserInfoToRemote, upsertCardToRemote, upsertPartOfSpeechToRemote } from "@/app/lib/remoteDB/saveToRemote";
import useMediaQuery from '@mui/material/useMediaQuery';


export default function AvatarMenu({
    userId,
    url,
    userName,
    className = "fixed bottom-[11px] sm:top-7 right-[11.25%] translate-x-[50%] sm:right-[52px]",
    autoSync,
    parentReload,
    children,
}: {
    userId:string | undefined,
    url: string | undefined | null,
    userName: string | undefined | null,
    className?: string
    autoSync: boolean
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

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const t = useTranslations('User')

    const handleSync = useCallback( () => {
        if (userId) {
            startTransition(async () => {
                // 同期開始 ========================================================================================
                let progress = 0;
                setProgressMessage(t('sync_partOfSpeech'))

                // フェーズ 1-1
                // ローカルから品詞を取得
                const partOfSpeeches: PartOfSpeechLocal[] = await getPartOfSpeechesFromLocal().then()
                const partOfSpeechesToRemote: PartOfSpeechLocal[] = [...partOfSpeeches.map(value => {
                    value.author = userId
                    return value
                })]

                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                // フェーズ 1-2
                // ローカルにデータがある場合、「Synced_atがリモートよりも新しいデータ」だけをリモートにプッシュ
                if (partOfSpeeches.length > 0) {
                    await Promise.all(partOfSpeechesToRemote.map(async (value, index) => {
                        const result = await upsertPartOfSpeechToRemote(value)

                        if (!result?.isSuccess) {
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

                // フェーズ 1-3
                // リモートデータベースから品詞を取得
                const parOfSpeechFromRemote = await getPartOfSpeechesFromRemote(userId)
                if (!parOfSpeechFromRemote.isSuccess) {
                    //取得が失敗した場合、同期を中断
                    console.error(parOfSpeechFromRemote.error.detail)
                    return
                }

                // フェーズ 1-4
                // 取得した品詞を一個ずつローカルに保存
                parOfSpeechFromRemote.data.map(async (value) => {
                    const data: PartOfSpeechLocal = {
                        ...value,
                        partOfSpeech: value.part_of_speech,
                        author: value.authorId
                    }
                    await savePartOfSpeechToLocal(data, true)
                })

                progress += 10;
                setProgressVal(progress)
                setProgressMessage(t('sync_words'))
                // フェーズ 1 終了
                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                // フェーズ 2-1
                // ローカルから単語データを取得
                const fetchedWords = await getCardsFromLocal(userId, true).then()
                if (!fetchedWords.isSuccess) {
                    console.error(fetchedWords.error.detail)
                    return
                }
                const words: WordCardToRemote[] = fetchedWords.data.map(word => {
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

                // フェーズ 2-2
                // ローカルに単語データがある場合、それをリモートにプッシュ
                if (fetchedWords.data.length > 0){
                    await Promise.all(words.map(async (word, index) => {
                        //Promise.allを使うことによって、words.mapの処理が全部終わってから次へ進むことを約束(Promise)してくれる
                        const result = await upsertCardToRemote(word)

                        if (!result.isSuccess) {
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

                // フェーズ 2-3
                // リモートデータベースから単語を取得
                const cardsFromRemote = await getCardsFromRemote(userId)
                if (!cardsFromRemote.isSuccess) {
                    //取得が失敗した場合、同期を中断
                    console.error(cardsFromRemote.error.detail)
                    return
                }
                progress += 20
                setProgressVal(progress)

                // フェーズ 2-4
                // 取得したデータをローカルに保存
                const results = await saveCardsToLocal(userId, cardsFromRemote.data)

                if (!results.isSuccess) {
                    console.error(results.message)
                    return
                }

                progress += 20
                setProgressVal(progress)
                // フェーズ 2 終了
                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                // フェーズ 3-1
                // ローカルからユーザー設定などの情報を取得
                // このコンポーネントにアクセスできている時点で、userIdは必ず存在する。
                // ユーザーの設定情報に関しては、ログイン済みのユーザーであれば、IndexDBに存在すべきである
                const userInfo = await getUserInfoFromLocal(userId)

                // フェーズ 3-2
                //ローカルにユーザーデータが存在する場合それをリモートにプッシュ
                // ！！！！！！！！！！！！！
                // 注意！！！ データベースの仕様上、何も帰ってこなくてもSuccessになるので、dataも一緒にチェックしないといけない
                // ！！！！！！！！！！！！！
                if (userInfo.isSuccess && userInfo.data) {
                    console.log("ユーザーの情報ゲットしたぜ")
                    const userInfoToRemote: UserInfoToRemote = {
                        ...userInfo.data,
                        updatedAt: userInfo.data.updated_at,
                        synced_at: userInfo.data.synced_at || new Date()
                    }

                    const result =　await updateUserInfoToRemote(userInfoToRemote)
                    //リモートへの同期が失敗した場合、同期を中断
                    if (!result.isSuccess) {
                        console.error(result.error.detail)
                        return
                    }
                }

                // フェーズ 3-3
                // リモートからユーザー情報を取得
                const userInfoFromRemote = await getUserInfoFromRemote(userId)
                if (userInfoFromRemote.isSuccess && userInfoFromRemote.data) {
                    const userInfoToLocal: UserInfo = {
                        ...userInfoFromRemote.data,
                        updated_at: userInfoFromRemote.data.updatedAt,
                        synced_at: new Date()
                    }

                    // フェーズ 3-4
                    // リモートから取得したユーザー情報をローカルに保存
                    const result = await saveUserInfoToLocal(userInfoToLocal)

                    if (!result.isSuccess) {
                        console.error(result.error.detail)
                    }
                }
                progress += 10
                setProgressVal(progress)
                // フェーズ 3 終了
                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


                // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                // フェーズ 4
                // 結果をチェック
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
                parentReload(prev => !prev)

                toast({
                    title: t('sync_success'),
                    description: t('sync_success')
                })
            })
        }
    },[parentReload, t, toast, userId])

    useEffect(() => {
        const fetchSyncedAt = async (userId: string) => {
            if (userId){
                const result = await getUserInfoFromLocal(userId)
                if (result.isSuccess){
                    setSyncedAt(result.data?.synced_at)
                }
                else {
                    console.error(result.error)
                }
            }
        }

        const fetchCardsCount = async () => {
            if (userId) {
                const result = await getCardCountFromLocal(userId)
                setWordsCount(result)
            }
        }

        if (userId) {
            fetchSyncedAt(userId).catch(e => console.error(e))
        }

        fetchCardsCount().catch()

    }, [userId, reLoad]);

    useEffect(() => {
        // 自動同期
        if (userId && autoSync && syncedAt) {
            if (new Date().getTime() - syncedAt.getTime() > 24 * 60 * 60 * 1000) {
                handleSync()
            }
        }

    }, [userId, autoSync, syncedAt, handleSync]);

    return (
        <div className={cn("flex z-40", className)}>
            <Sheet >
                <SheetTrigger
                    asChild>
                    <Button className={"rounded-none sm:rounded-full w-16 sm:w-10 sm:h-10 hover:bg-transparent sm:hover:scale-105 sm:hover:ring-2 sm:hover:ring-primary sm:hover:ring-offset-4 transition-all duration-200"} size={"icon"} variant={"ghost"}>
                        <CircleUser className={"sm:hidden text-foreground"} size={24}/>
                        <Avatar className={"hidden sm:flex"}>
                            <AvatarImage className={"hover:opacity-90"} width={40} height={40} src={url || ""}/>
                            <AvatarFallback>{userName && userName[0] || "A"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </SheetTrigger>
                <SheetContent className={"flex flex-col max-w-[25rem] min-w-80 justify-between"} side={isSmallDevice ? "left" : "right"}>
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
                                    <Button className={"w-full"} onClick={handleSync} type={"button"} disabled={isPending}>
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
                </SheetContent>
            </Sheet>
        </div>
    )
}