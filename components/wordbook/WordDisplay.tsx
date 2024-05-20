import { Badge } from "@/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { WordDataMerged } from "@/types/WordIndexDB";
import { Separator } from "@/components/ui/separator";
import { Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function WordDisplay({ wordData }: { wordData: WordDataMerged }) {

    return (
        <>
            <div className={"inline-flex gap-1 lg:gap-2 items-center mb-5"}>
                <p className={"px-1.5 scroll-m-20 font-bold text-3xl sm:text-4xl lg:text-5xl  select-all"}>{wordData.word}</p>
                <Button disabled className={"mt-1.5 lg:mt-2 p-1.5 sm:size-10 lg:size-11"} variant={"ghost"} size={"icon"}>
                    <Volume2 className={""} size={32}/>
                </Button>
            </div>

            <p className={"px-1.5 text-foreground/50 text-lg mb-4 select-all"}>{wordData.phonetics || ""}</p>

            {wordData.partOfSpeech?.partOfSpeech &&
                <Badge variant={"coloredSecondary"}
                       className={"mb-5 lg:text-sm"}>{wordData.partOfSpeech?.partOfSpeech || ""}
                </Badge>
            }

            <p className={cn("px-1.5 text-lg lg:text-xl text-muted-foreground font-semibold rounded-4 transition-all")}>{wordData.definition}</p>

            <Separator className={"my-6"}/>

            <p className={"px-1.5 text-foreground text-lg sm:text-xl lg:text-2xl font-medium sm:leading-normal lg:leading-normal"}>{wordData.example || ""}</p>

            <div className={"flex flex-col w-full bg-foreground/[0.03] p-4 rounded-lg mt-4"}>
                <p className={cn("text-base text-muted-foreground rounded-4 transition-all leading-relaxed")}>{wordData.notes || ""}</p>
            </div>
        </>
    )
}