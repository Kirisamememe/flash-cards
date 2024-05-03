import React, {SetStateAction} from "react";
import {RawWordInfo} from "@/app/lib/indexDB";

export interface WordCard {
    id: number
    word: string
    phonetics?: string
    definition: string
    example: string
    notes?: string
}

export default function Card({wordInfo, children, setWord}: {wordInfo: WordCard, children?: React.ReactNode, setWord?: React.Dispatch<SetStateAction<RawWordInfo>>}) {

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