import { useWordbookStore } from "@/providers/wordbook-store-provider";
import React from "react";
import { Archive } from "@/components/ai-booster/Archive";



export function History() {
    const materialHistory = useWordbookStore((state) => state.materialHistory)

    return (
        <Archive materials={materialHistory}/>
    )
}