import React from "react";
import { WordCard } from "@/types/WordCard"

export default function FlashCard({
    wordInfo, children
}: {
    wordInfo: WordCard,
    children?: React.ReactNode,
}) {

    // TODO 定義とnotesを隠す機能

    return (
        <div className={"flex flex-col p-5"}>
            {children}
            {wordInfo && <>
                <p className={"text-foreground/50 text-sm text-center mb-2"}>{wordInfo.phonetics || ""}</p>
                <h1 className={"scroll-m-20 text-5xl font-bold tracking-tight lg:text-5xl text-center mb-2"}>{wordInfo.word}</h1>
                <p className={"text-foreground/20 text-sm text-center leading-normal mb-6"}>{wordInfo.definition}</p>
                <p className={"text-foreground/80 text-xl text-center font-medium leading-tight mb-1"}>{wordInfo.example}</p>
                <p className={"text-foreground/20 text-sm text-center mb-8"}>{wordInfo.notes || ""}</p>
            </>}
        </div>
    )
}