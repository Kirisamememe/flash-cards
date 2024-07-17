import { Separator } from "@/components/ui/separator";
import { useLocale, useTranslations } from "next-intl";
import DestructiveDialog from "@/components/dialog/DestructiveDialog";
import { EN2ENItem, AnswerRecord, WordData } from "@/types/WordIndexDB";
import { Button } from "@/components/ui/button";
import { CloudDownload } from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import WordDisplay from "@/components/wordbook/WordDisplay";
import { WordFormContainer } from "@/components/form/WordFormContainer";
import { useEffect, useRef, useState } from "react";
import { getEN2ENItemFromLocal, getRecordsFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { cn, isEnglish } from "@/app/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast"
import { fetchFromWordsAPI } from "@/app/lib/fetcher";
import OnlineDic from "@/components/wordbook/OnlineDic";
import Loading from "@/components/ui/loading";
import { useSession } from "next-auth/react";
import { indexDB } from "@/stores/wordbook-store";

export default function WordDetail({ wordData }: { wordData: WordData }) {

    const t = useTranslations()
    const locale = useLocale();
    const { toast } = useToast()

    const { data: session } = useSession()

    const correctDiv = useRef<HTMLDivElement>(null)
    const incorrectDiv = useRef<HTMLDivElement>(null)

    const isEditing = useWordbookStore((state) => state.isEditing)
    const setIsEditing = useWordbookStore((state) => state.setIsEditing)
    const setWordToINDB = useWordbookStore((state) => state.setWordToINDB)
    const userInfo = useWordbookStore((state) => state.userInfo)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

    const [correctRecords, setCorrectRecords] = useState<AnswerRecord[]>([])
    const [incorrectRecords, setIncorrectRecords] = useState<AnswerRecord[]>([])
    const [dicData, setDicData] = useState<EN2ENItem | null>(null)
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        if (!wordData?.id) return

        indexDB.getAllRecordsOfWord(wordData.id).then((res) => {
            if (res.isSuccess && res.data[0]) {
                setCorrectRecords(res.data[0].records.filter(record => record.is_correct))
                setIncorrectRecords(res.data[0].records.filter(record => !record.is_correct))
            } else {
                setCorrectRecords([])
                setIncorrectRecords([])
            }
        })

        getEN2ENItemFromLocal(wordData.word).then((res) => {
            if (res.isSuccess && res.data) {
                setDicData(res.data)
            }
            else {
                setDicData(null)
            }
        })

        if (correctDiv.current) {
            correctDiv.current.style.width = `${(correctRecords.length / (correctRecords.length + incorrectRecords.length)) * 100}%`
        }
        if (incorrectDiv.current) {
            incorrectDiv.current.style.width = `${(incorrectRecords.length / (correctRecords.length + incorrectRecords.length)) * 100}%`
        }

    }, [correctRecords.length, incorrectRecords.length, wordData]);



    const handleLearned = () => {
        if (!wordData.learned_at) {
            // TODO ここのi18n
            toast({
                title: ("Marked as Mastered"),
                description: ("The word has been marked as Mastered. Click the button again to undo."),
                action:
                    <ToastAction onClick={() => {
                        setWordToINDB({ ...wordData, learned_at: undefined })
                            .catch(err => console.error(err))
                    }} altText={("Undo")}>
                    {"Undo"}
                    </ToastAction>,
                duration: 3000
            })
        }

        setWordToINDB({...wordData, learned_at: wordData.learned_at ? undefined : new Date()})
            .then((res) => {
                if (res.isSuccess && wordData.learned_at) {
                    setCurrentIndex(res.data)
                }
            })
            .catch(err => console.error(err))
    }

    const handleOnlineDic = async () => {
        if (!dicData) {
            setIsFetching(true)
            fetchFromWordsAPI(wordData.word)
                .then(res => {
                    console.log(res)
                    setDicData(res)
                    indexDB.saveEN2ENItem(res).catch((error) => {
                        console.error(error)
                    })
                })
                .finally(() => {
                    setIsFetching(false)
                })
        }
    }

    if (!wordData) return null

    const time = (new Date().getTime() - wordData.created_at?.getTime())  / (24 * 60 * 60 * 1000)
    const timeStr = time > 1 ? `${Math.floor(time)} ${t( time >= 2 ? "WordsBook.days" : "WordsBook.day")}` : `${Math.floor(time * 24)} ${t(time * 24 >= 2 ? 'WordsBook.hours' : 'WordsBook.hour')}`


    return (
        <div className={"flex flex-col justify-start items-start px-4 sm:px-6 lg:px-9 pt-6 pb-12"}>
            <div className={"pl-1.5 flex w-full items-center justify-between mb-2"}>
                <p className={"text-sm text-foreground/20"}>
                    {t("WordsBook.days_ago", { date: timeStr })}
                </p>
                {isEditing ?
                    <div>
                        <Button className={"mr-3"} variant={"ghost"} type={"button"} onClick={() => setIsEditing(false)}>
                            {t("WordSubmitForm.cancel")}
                        </Button>
                        <Button variant={"outline"}
                                onClick={() => {
                                    const submitBtn = document.getElementById("submitFormBtn")
                                    submitBtn?.click()
                                    setIsEditing(false)
                                }}
                        >
                            {t("WordSubmitForm.save")}
                        </Button>
                    </div> :
                    <Button className={""} variant={"ghost"} size={"icon"} onClick={() => setIsEditing(true)}>
                        <SquarePen/>
                    </Button>
                }
            </div>

            {isEditing ?
                <WordFormContainer className={"relative flex flex-col w-full mt-4 p-0.5 sm:p-0.5 gap-5"} wordData={wordData} setIsEditing={setIsEditing} half={false}>
                    <Button className={"px-6"} type={"button"} variant={"ghost"} size={"lg"} onClick={() => setIsEditing(false)}>
                        {t("WordSubmitForm.cancel")}
                    </Button>
                </WordFormContainer> :
                // 単語情報
                <WordDisplay wordData={wordData}/>
            }

            <Separator className={"my-6"}/>

            {/*定着度*/}
            <div className={"flex flex-col w-full"}>
                <div className={"pl-1.5 flex justify-between items-center mb-4"}>
                    <h1 className={"text-lg sm:text-xl lg:text-2xl font-bold"}>{t("WordsBook.retention_rate")}</h1>
                    <Button className={cn("group gap-2 h-9 sm:h-10 px-3 sm:px-4",
                            wordData.learned_at &&
                                "text-primary hover:bg-destructive shadow-primary hover:shadow-destructive hover:text-destructive-foreground")
                            }
                            variant={"outline"} type={"button"}
                            onClick={handleLearned}>
                        <CircleCheckBig size={16}/>
                        <span className={cn(wordData.learned_at && "group-hover:hidden")}>
                            {wordData.learned_at ? t("WordsBook.word_mastered") : t("WordsBook.word_mark_as_mastered")}
                        </span>
                        <span className={cn("hidden", wordData.learned_at && "group-hover:block text-destructive-foreground")}>
                            {wordData.learned_at && t('WordsBook.word_unmastered')}
                        </span>
                    </Button>
                </div>
                <div className={"bg-foreground/[0.03] p-5 rounded-lg"}>
                    <div className={"flex justify-between px-0.5"}>
                        <p className={"text-foreground text-base font-bold"}>{`${correctRecords.length} ${t('WordsBook.counter_suffix')}`}</p>
                        <p className={"text-foreground text-base font-bold"}>{`${incorrectRecords.length} ${t('WordsBook.counter_suffix')}`}</p>
                    </div>
                    <div className={cn("flex my-4 gap-1 justify-between h-3 rounded-4 overflow-hidden", correctRecords.length + incorrectRecords.length === 0 && "bg-foreground/5")}>
                        {correctRecords.length > 0 && <div ref={correctDiv} className={cn("bg-primary")}/>}
                        {incorrectRecords.length > 0 && <div ref={incorrectDiv} className={cn("bg-primary/30")}/>}
                    </div>
                    <div className={"flex justify-between px-0.5"}>
                        <p className={"text-muted-foreground text-sm"}>{t("WordsBook.correct_count")}</p>
                        <p className={"text-muted-foreground text-sm"}>{t("WordsBook.incorrect_count")}</p>
                    </div>
                </div>
            </div>

            {/*Web辞書*/}
            {isEnglish(wordData.word) && session?.user.role === "ADMIN" &&
                <>
                    <Separator className={"my-6"}/>
                    <div className={"flex flex-col w-full"}>
                        <div className={"pl-1.5 flex w-full justify-between items-center mb-3"}>
                            <h1 className={"text-lg sm:text-xl sm:leading-[2.25rem] lg:text-2xl lg:leading-[2.75rem] font-bold"}>{t("WordsBook.online_dic")}</h1>
                            {!dicData && <Button className={"size-9 p-1.5 lg:size-11 lg:p-2"} variant={"ghost"}
                                                 size={"icon"}
                                                 onClick={handleOnlineDic}>
                                <CloudDownload size={28}/>
                            </Button>}
                        </div>
                        <div className={"flex flex-col w-full bg-foreground/[0.03] p-4 rounded-lg"}>
                            {dicData ?
                                <OnlineDic en2enItem={dicData}/> :
                                isFetching ?
                                    <Loading /> :
                                    <p className={"text-muted-foreground"}>
                                        {t("WordsBook.online_dic_description")}
                                    </p>
                            }
                        </div>
                    </div>
                </>
            }

            <Separator className={"my-6"}/>

            {/*エキストラ情報*/}
            <div className={"flex w-full items-center justify-between pl-1.5"}>
                <div className={"flex items-center gap-5 sm:gap-6 lg:gap-8"}>
                    <div className={""}>
                        <p className={"mb-1 text-xs"}>{t("WordsBook.mastered_at")}</p>
                        <p className={"text-xs text-muted-foreground"}>{`${wordData.learned_at ? wordData.learned_at?.toLocaleString(locale, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) + "に習得" : t("WordsBook.not_yet_mastered")}`}</p>
                    </div>
                    <Separator className={"py-4"} orientation={"vertical"}/>
                    <div className={""}>
                        <p className={"mb-1 text-xs"}>{t("WordsBook.final_edit")}</p>
                        <p className={"text-xs text-muted-foreground"}>{`${wordData.updated_at.toLocaleString(locale, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}`}</p>
                    </div>
                </div>
                <DestructiveDialog className={""}/>
            </div>
        </div>
    )
}