'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import * as React from "react";
import {useEffect, useState, useTransition} from "react";
import { signOutHandler } from "@/app/lib/sign-out";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
    // SheetHeader,
    // SheetClose,
    // SheetDescription,
    // SheetFooter
} from "@/components/ui/sheet";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    // CardFooter,
} from "@/components/ui/card"
import { useTranslations } from "next-intl";
import { getCardCount, getCards, getPartOfSpeeches, saveCards, savePartOfSpeech } from "@/app/lib/indexDB";
import { getSyncAt, updateSyncAt, upsertCard, upsertPartOfSpeech } from "@/app/lib/remoteDB";
import { PartOfSpeech, WordCard, WordCardToRemote } from "@/types/WordCard";
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useLocale } from 'next-intl';
import {Word} from "@prisma/client";


export default function AvatarMenu({
    userId, url, userName
}: {
    userId:string | undefined,
    url: string,
    userName: string
}){
    const [menuOpen, setMenuOpen] = useState(false)
    const [sheetOpen, setSheetOpen] = useState(false)
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
                const result = await getSyncAt(userId)
                setSyncedAt(result?.synced_at)
            }
        }

        const fetchCardsCount = async () => {
            if (userId) {
                const result = await getCardCount(userId)
                setWordsCount(result)
            }
        }
        fetchSyncedAt().catch()
        fetchCardsCount().catch()

    }, [userId, reLoad]);

    const handleSync = () => {
        if (userId) {
            startTransition(async () => {
                const partOfSpeeches: PartOfSpeech[] = await getPartOfSpeeches().then()
                const partOfSpeechesToRemote: PartOfSpeech[] = [...partOfSpeeches.map(value => {
                    value.author = userId
                    return value
                })]
                const wordData: WordCard[] = await getCards().then()
                const words: WordCardToRemote[] = wordData.map(word => {
                    // WordCardのpartOfSpeechに対応するPartOfSpeechオブジェクトを取得
                    word.author = userId
                    const correspondingPartOfSpeech = partOfSpeechesToRemote.find(pos => pos.id === word.partOfSpeech)

                    // マージ後のデータを作成
                    const mergedData: WordCardToRemote = {
                        ...word,
                        partOfSpeech: correspondingPartOfSpeech || { id: '', partOfSpeech: '', author: "", is_deleted: false }
                    }

                    return mergedData;
                })

                let progress = 0;
                setProgressMessage(t('sync_parOfSpeech'))

                await Promise.all(partOfSpeechesToRemote.map( async (value, index) => {
                    const result = await upsertPartOfSpeech(value)

                    if (result.error) {
                        toast({
                            variant: "destructive",
                            title: t('sync_error_occurred'),
                            description: result.detail
                        });

                        return value
                    } else {
                        progress = Math.floor((index + 1) / words.length * 10)
                        setProgressVal(progress);

                        console.log(result)
                        return result
                    }
                }))

                progress = 10;
                setProgressMessage(t('sync_words'))

                await Promise.all(words.map(async (word, index) => {
                    //Promise.allを使うことによって、words.mapの処理が全部終わってから次へ進むことを約束(Promise)してくれる
                    const result = await upsertCard(word)

                    if (result.error) {
                        toast({
                            variant: "destructive",
                            title: t('sync_error_occurred'),
                            description: result.detail
                        });

                        console.error(result.detail);
                        return word;
                    } else {
                        progress = Math.floor((index + 1) / words.length * 90) + 10;
                        setProgressVal(progress);

                        console.log(result);
                        return result;
                    }
                }))

                await updateSyncAt(userId)

                if (progress < 100) {
                    toast({
                        variant: "destructive",
                        title: t('sync_error'),
                        description: t('sync_error')
                    });

                    return
                }

                console.log("======================================================");

                const values: Word[] = [...words.map(word => {
                    return {
                        id: word.id,
                        phonetics: word.phonetics || null,
                        word: word.word,
                        partOfSpeechId: word.partOfSpeech?.id || null,
                        definition: word.definition,
                        example: word.example || null,
                        notes: word.notes || null,
                        is_learned: word.is_learned,
                        created_at: word.created_at,
                        updated_at: word.updated_at,
                        synced_at: word.synced_at || null,
                        learned_at: word.learned_at || null,
                        retention_rate: word.retention_rate,
                        authorId: word.author || "",
                        is_deleted: word.is_deleted
                    }
                })]

                const results = await saveCards(values)
                partOfSpeechesToRemote.map(async (value) => {
                    await savePartOfSpeech(value)
                })

                if (!results.isSuccess) {
                    console.error(results.message)

                    toast({
                        variant: "destructive",
                        title: t('sync_local_error'),
                        description: t('sync_local_error')
                    });

                    return
                }

                setProgressVal(0)
                setReload(prev => !prev)

                toast({
                    title: t('sync_success'),
                    description: t('sync_success')
                });
            })
        }
    }

    return (
        <div className={"flex"}>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger
                    onMouseEnter={() => setTimeout(() => setMenuOpen(true), 100)}
                    asChild>
                    <Button className={"rounded-full"} size={"icon"} variant={"ghost"}>
                        <Avatar>
                            <AvatarImage width={40} height={40} src={url}/>
                            <AvatarFallback>{userName[0]}</AvatarFallback>
                        </Avatar>
                    </Button>
                </SheetTrigger>
                <SheetContent className={"max-w-[25rem] "} side={"right"}>
                    <Card className={"mt-8 mb-3"}>
                        <CardHeader className={"items-center gap-2"}>
                            <Avatar className={"w-20 h-20"}>
                                <AvatarImage src={url}/>
                                <AvatarFallback>{userName[0]}</AvatarFallback>
                            </Avatar>
                            <SheetTitle className={"text-xl text-center"}>{userName}</SheetTitle>
                            <div className={"flex flex-col w-full p-6 gap-2 items-center justify-center"}>
                                <h1 className={"text-5xl font-bold"}>{wordsCount}</h1>
                                <p>{"学習中"}</p>
                            </div>
                            {syncedAt ?
                                <div className={"flex flex-col gap-1 text-muted-foreground text-xs text-center"}>
                                    <p>{t('synced_at')}</p>
                                    <p>{syncedAt.toLocaleString(locale, {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})}</p>
                                </div> : <p className={"text-muted-foreground text-xs text-center"}>{t('sync_at_null')}</p>}
                        </CardHeader>
                        <CardContent className={"flex flex-col"}>
                            <Button
                                onClick={handleSync}
                                type={"button"}
                                disabled={isPending}
                            >
                                {t("sync")}
                            </Button>
                        </CardContent>
                    </Card>
                    {isPending && <Card>
                        <CardHeader className={"gap-3"}>
                            <CardTitle className={"text-center"}>{t('syncing')}</CardTitle>
                            <CardDescription className={"text-center"}>{progressMessage}</CardDescription>
                            <Progress
                                className={"h-2 w-full"}
                                value={progressVal}/>
                        </CardHeader>
                    </Card>}
                </SheetContent>
            </Sheet>

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                    asChild>
                    <button className={"h-10"}/>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className={"w-36 mt-2"}
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                    align="end">
                    <DropdownMenuItem onClick={() => setSheetOpen(true)}>
                        {t("profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {}}>
                        {t("wordlist")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <form action={signOutHandler}>
                            <button type={"submit"}>{t("signOut")}</button>
                        </form>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}