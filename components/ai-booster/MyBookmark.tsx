import React from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Archive } from "@/components/ai-booster/Archive";


export function MyBookmark() {
    const bookmarkedMaterials = useWordbookStore((state) => state.materialHistory).filter((material) => material.bookmarked_at)

    return (
        <Archive materials={bookmarkedMaterials}/>
    )
}

