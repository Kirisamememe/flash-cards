import { Badge } from "@/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { WordDataMerged } from "@/types/WordIndexDB";
import { Separator } from "@/components/ui/separator";
import { Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function WordDisplay({ wordData }: { wordData: WordDataMerged }) {

    const t = useTranslations()

    const handleSpeechExample = () => {
        const speechExample = new SpeechSynthesisUtterance(wordData.example)
        const voices = speechSynthesis.getVoices()

        speechExample.voice = voices[156]
        speechSynthesis.speak(speechExample)
    }

    return (
        <>
            <div className={"inline-flex gap-1 lg:gap-2 items-center mb-2 sm:mb-3 lg:mb-5"}>
                <p className={"px-1.5 scroll-m-20 font-bold text-3xl sm:text-4xl lg:text-5xl select-all"}>
                    {wordData?.word}
                </p>
                <Button disabled className={"mt-1.5 lg:mt-2 p-1.5 sm:size-10 lg:size-11"} variant={"ghost"} size={"icon"}>
                    <Volume2 className={""} size={32}/>
                </Button>
            </div>

            {wordData?.phonetics && wordData?.phonetics?.length > 0 &&
                <p className={"px-1.5 text-foreground/50 text-lg mb-4 select-all"}>
                    {wordData?.phonetics || ""}
                </p>
            }

            {wordData?.partOfSpeech?.partOfSpeech &&
                <Badge variant={"coloredSecondary"}
                       className={"mb-5 lg:text-sm"}>{wordData?.partOfSpeech?.partOfSpeech || ""}
                </Badge>
            }

            <p className={cn("px-1.5 text-lg lg:text-xl text-muted-foreground font-semibold rounded-4 transition-all")}>
                {wordData?.definition}
            </p>

            <Separator className={"my-6"}/>

            {wordData?.example && wordData?.example?.length > 0 &&
                <p className={"px-1.5 mb-4 text-foreground text-lg sm:text-xl lg:text-2xl font-medium sm:leading-normal lg:leading-normal"}>
                    {wordData?.example || ""}
                    <Button disabled className={"size-7 p-0 ml-2 align-middle"} variant={"coloredOutline"}
                            size={"icon"}
                            onClick={handleSpeechExample}>
                        <Volume2 className={""} size={20}/>
                    </Button>
                </p>
            }

            <div className={"flex flex-col w-full bg-foreground/[0.03] p-4 rounded-lg"}>
                <p className={cn("text-base text-muted-foreground rounded-4 transition-all leading-relaxed")}>
                    {wordData?.notes || t("WordsBook.note_null")}
                </p>
            </div>
        </>
    )
}