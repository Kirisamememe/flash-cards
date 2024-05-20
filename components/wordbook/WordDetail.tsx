import { Separator } from "@/components/ui/separator";
import { useLocale, useTranslations } from "next-intl";
import DestructiveDialog from "@/components/dialog/DestructiveDialog";
import { WordDataMerged } from "@/types/WordIndexDB";
import { Button } from "@/components/ui/button";
import { CloudDownload } from 'lucide-react';
import { CircleCheckBig } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import WordDisplay from "@/components/wordbook/WordDisplay";
import { EditWordCard } from "@/components/form/EditCard";

export default function WordDetail({ wordData }: { wordData: WordDataMerged }) {

    const t = useTranslations()
    const locale = useLocale();

    const isEditing = useWordbookStore((state) => state.isEditing)
    const setIsEditing = useWordbookStore((state) => state.setIsEditing)

    if (!wordData) return null

    const time = (new Date().getTime() - wordData.created_at?.getTime())  / (24 * 60 * 60 * 1000)
    const timeStr = time > 1 ? `${Math.floor(time)} ${t( time >= 2 ? "WordsBook.days" : "WordsBook.day")}` : `${Math.floor(time * 24)} ${t(time * 24 >= 2 ? 'WordsBook.hours' : 'WordsBook.hour')}`


    return (
        <div className={"flex flex-col justify-start items-start px-5 sm:px-6 lg:px-9 pt-6 pb-12"}>
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
                <EditWordCard className={"flex flex-col w-full px-0 lg:gap-6"} wordData={wordData} setIsEditing={setIsEditing}>
                    <Button className={"px-6"} type={"button"} variant={"ghost"} size={"lg"} onClick={() => setIsEditing(false)}>
                        {t("WordSubmitForm.cancel")}
                    </Button>
                </EditWordCard> :
                <WordDisplay wordData={wordData}/>
            }

            <Separator className={"my-6"}/>

            <div className={"flex flex-col w-full"}>
                <div className={"pl-1.5 flex justify-between items-center mb-4"}>
                    <h1 className={"text-lg sm:text-xl lg:text-2xl font-bold"}>{t("WordsBook.retention_rate")}</h1>
                    <Button disabled className={"gap-2 h-9 sm:h-10 px-3 sm:px-4"}
                            variant={"outline"} type={"button"}>
                        <CircleCheckBig size={16}/>
                        {t("WordsBook.word_mastered")}
                    </Button>
                </div>
                <div className={"bg-foreground/[0.03] p-5 rounded-lg"}>
                    <div className={"flex justify-between px-0.5"}>
                        <p className={"text-foreground text-base font-bold"}>{`0 ${t('WordsBook.counter_suffix')}`}</p>
                        <p className={"text-foreground text-base font-bold"}>{`0 ${t('WordsBook.counter_suffix')}`}</p>
                    </div>
                    <div className={"flex my-4 gap-1 justify-between"}>
                        <div className={"bg-primary h-3 w-[50%] rounded-l-4"}></div>
                        <div className={"bg-primary/30 h-3 w-[50%] rounded-r-4"}></div>
                    </div>
                    <div className={"flex justify-between px-0.5"}>
                        <p className={"text-muted-foreground text-sm"}>{t("WordsBook.correct_count")}</p>
                        <p className={"text-muted-foreground text-sm"}>{t("WordsBook.incorrect_count")}</p>
                    </div>
                </div>
            </div>

            <Separator className={"my-6"}/>

            <div className={"flex flex-col w-full"}>
                <div className={"pl-1.5 flex w-full justify-between items-center mb-4"}>
                    <h1 className={"text-lg sm:text-xl lg:text-2xl font-bold"}>{t("WordsBook.online_dic")}</h1>
                    <Button disabled className={"size-9 p-1.5 lg:size-11 lg:p-2"} variant={"ghost"}
                            size={"icon"}><CloudDownload size={28}/></Button>
                </div>
                <div className={"flex flex-col w-full bg-foreground/[0.03] p-4 rounded-lg"}>
                    <p className={"text-muted-foreground"}>
                        {"coming soon..."}
                        {/*{"「英語」のWeb辞書が利用可能です。右側のボタンでデータが取得できます。"}*/}
                    </p>
                </div>
            </div>

            <Separator className={"my-6"}/>


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