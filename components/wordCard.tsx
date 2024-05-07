import React, {SetStateAction} from "react";
import { WordCard } from "@/types/WordCard"

export default function Card({
    wordInfo, children
}: {
    wordInfo: WordCard,
    children?: React.ReactNode,
}) {

    return (
        <div className={"flex flex-col items-center justify-center"}>
            <p className={"text-foreground/50 text-sm text-center mb-2"}>{wordInfo?.phonetics || ""}</p>
            <h1 className={"scroll-m-20 text-5xl font-bold tracking-tight lg:text-5xl text-center mb-2"}>{wordInfo?.word}</h1>
            <p className={"text-foreground/20 text-sm text-center leading-normal mb-6"}>{wordInfo?.definition}</p>
            <p className={"text-foreground/80 text-xl text-center font-medium leading-tight mb-1"}>{wordInfo?.example}</p>
            <p className={"text-foreground/20 text-sm text-center mb-8"}>{wordInfo?.notes || ""}</p>
            {children}
        </div>
    )
}