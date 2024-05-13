import React from "react";
import { WordDataMerged } from "@/types/WordIndexDB"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function FlashCard({
    wordInfo,
    blindMode,
    children
}: {
    wordInfo: WordDataMerged,
    blindMode: boolean,
    children?: React.ReactNode,
}) {

    // TODO 定義とnotesを隠す機能

    return (
        <div className={"group flex flex-col p-5"}>
            {children}
            {wordInfo && <div className={"flex flex-col items-center min-h-[18rem] sm:min-h-[22rem]"}>
                <p className={"text-foreground/50 text-md text-center mb-2"}>{wordInfo.phonetics || ""}</p>
                <p className={"scroll-m-20 w-fit text-3xl font-bold sm:text-5xl lg:text-6xl text-center mb-5"}>{wordInfo.word}</p>
                <Badge variant={"coloredSecondary"} className={"mb-5"}>{wordInfo.partOfSpeech && wordInfo.partOfSpeech.partOfSpeech}</Badge>
                <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-hover:text-foreground/50 text-base group-hover:text-lg sm:group-hover:text-xl group-hover:bg-transparent" : "text-foreground/50 text-lg sm:text-xl font-bold", "h-8 text-center rounded-4 transition-all mb-8 sm:mb-6")}>{wordInfo.definition}</p>
                <p className={"text-foreground/80 text-xl sm:text-3xl text-center font-medium leading-tight mb-3"}>{wordInfo.example}</p>
                <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-hover:text-foreground/50 text-xs group-hover:text-base group-hover:bg-transparent" : "text-foreground/50 text-xs sm:text-base", "h-6 text-center rounded-4 transition-all")}>{wordInfo.notes || ""}</p>
            </div>}
        </div>
    )
}