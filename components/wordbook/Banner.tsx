import { Separator } from "@/components/ui/separator";
import AddWordBtn from "@/components/home/AddBtn";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useTranslations } from "next-intl";

export default function Banner() {

    const words = useWordbookStore((state) => state.words)
    const t = useTranslations('WordsBook')

    return (
        <div className={"relative flex-none flex h-[4.5rem] sm:h-20 max-w-[72rem] w-full border sm:pr-8 dark:bg-gradient-to-r from-foreground/5 to-foreground/[0] items-center justify-between rounded-xl"}>
            <div
                className={"flex items-center w-full sm:w-full sm:max-w-[24rem] justify-between sm:justify-self-stretch"}>
                <div className={"flex flex-col w-full items-center gap-1"}>
                    <h1 className={"text-2xl font-bold text-center"}>{words.length}</h1>
                    <p className={"text-xs text-foreground/50 text-center"}>{t("word_total")}</p>
                </div>
                <Separator orientation={"vertical"} className={"h-12 bg-foreground/10"}/>
                <div className={"flex flex-col w-full items-center gap-1"}>
                    <h1 className={"text-2xl font-bold text-center"}>{words.filter(word => !word.learned_at).length}</h1>
                    <p className={"text-xs text-foreground/50 text-center"}>{t("word_learning")}</p>
                </div>
                <Separator orientation={"vertical"} className={"h-12 bg-foreground/10"}/>
                <div className={"flex flex-col w-full items-center gap-1"}>
                    <h1 className={"text-2xl font-bold text-center"}>{words.filter(word => !!word.learned_at).length}</h1>
                    <p className={"text-xs text-foreground/50 text-center"}>{t("word_mastered")}</p>
                </div>
            </div>
            <AddWordBtn>
                <Button className={"hidden sm:flex text-base rounded-full shadow-lg shadow-primary/30"}
                        size={"lg"}>{t("add_a_word")}</Button>
            </AddWordBtn>

            <div className={"absolute left-0 w-full h-full -z-10 opacity-70 dark:invert dark:opacity-30"}>
                <Image priority={true} src={"https://s2.loli.net/2024/05/15/fEtaG7YSNcdlnrT.webp"} alt={"image"}
                       className={"object-cover"} fill quality={100}/>
            </div>
        </div>
    )
}