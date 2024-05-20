import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import React from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslations } from "next-intl";

export default function FindWord() {

    const filterText = useWordbookStore((state) => state.filterText)
    const setFilterText = useWordbookStore((state) => state.setFilterText)
    const setFilteredWords = useWordbookStore((state) => state.setFilteredWords)

    const t = useTranslations()

    const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.currentTarget.value)
        setFilteredWords()
    }

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    if (isSmallDevice) {
        return (
            <div className={"relative flex flex-col w-full z-10 my-4"}>
                <Search className={"absolute top-4 left-3"} size={16}/>
                <Input
                    className={"h-12 rounded-lg pl-10 bg-background/50 border-foreground/10 hover:bg-muted/50 focus-visible:bg-background/50"}
                    value={filterText}
                    onChange={handleFilterTextChange}
                    placeholder={t('WordsBook.filter_words')}/>
            </div>
        )
    }

    return (
        <div
            className={"absolute top-0 flex flex-col w-full p-4 border-b border-foreground/[0.07] bg-foreground/[0.02] backdrop-blur-2xl z-10"}>
            <Search className={"absolute top-7 left-7"} size={16}/>
            <Input
                className={"pl-10 bg-background/50 border-foreground/10 hover:bg-muted/50 focus-visible:bg-background/50"}
                value={filterText}
                onChange={handleFilterTextChange}
                placeholder={t('WordsBook.filter_words')}/>
        </div>
    )
}