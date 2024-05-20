'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Separator } from "@/components/ui/separator";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import WordDetail from "@/components/wordbook/WordDetail";
import WordItem from "@/components/wordbook/WordItem";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { cn } from "@/app/lib/utils";
import React from "react";
import Banner from "@/components/wordbook/Banner";
import FindWord from "@/components/wordbook/FindWord";
import { motion } from "framer-motion";
import AddWordBtn from "@/components/home/AddBtn";
import { useTranslations } from "next-intl";

export default function WordsBookContainer() {

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const words = useWordbookStore((state) => state.words)
    const filterText = useWordbookStore((state) => state.filterText)
    const filteredWords = useWordbookStore((state) => state.filteredWords)
    const currentIndex = useWordbookStore((state) => state.currentIndex)

    const t = useTranslations('WordsBook')

    if (!words) return <p className={"fixed left-1/2 top-1/2 -translate-x-1/2"}>{"データを取得できませんでした"}</p>

    if (isSmallDevice) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
            >
                <div className={"flex flex-col w-full h-full px-4 pt-20 pb-20 items-center"}>
                    <Banner/>
                    <FindWord/>
                    <ul role={"list"}
                        className={"list-none w-full flex flex-col justify-stretch"}>
                        {filterText ?
                            filteredWords.map((word, index) => (
                                <WordItem key={word.id} wordData={word} index={index}/>
                            )) :
                            words.map((word, index) => (
                                <WordItem key={word.id} wordData={word} index={index}/>
                            ))
                        }
                    </ul>
                </div>
            </motion.div>

        )
    }


    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className={"h-full"}
        >
            <div className={"flex flex-col w-full h-full min-h-[48rem] sm:px-4 sm:pt-20 sm:pb-4 lg:px-8 lg:pt-24 lg:pb-6 items-center"}>
                <div className={"flex flex-col gap-4 w-full max-w-[72rem] h-full"}>
                    <Banner/>

                    <ResizablePanelGroup
                        direction="horizontal"
                        className={"w-full border rounded-xl max-h-dvh"}
                    >
                        <ResizablePanel className={"relative min-w-72 sm:max-w-96 sm:bg-foreground/[0.02]"}
                                        defaultSize={isSmallDevice ? 100 : 32} minSize={20} order={1}
                                        id={"resizablePanel-1"}>
                            <FindWord/>
                            <ScrollArea className={"h-full"}>
                                <ul role={"list"}
                                    className={"list-none p-4 flex flex-col justify-stretch gap-[1px] sm:p-7 first:mt-[4.5rem] sm:first:mt-[3.5rem]"}>
                                    <div>
                                        <AddWordBtn>
                                            <Button
                                                className={"text-base w-full h-14 justify-start pl-1.5 sm:pl-2 gap-2 rounded-lg sm:hover:bg-border"}
                                                variant={"ghost"} size={"lg"}>
                                                <Plus size={20}/>
                                                {t("add_a_word")}
                                            </Button>
                                        </AddWordBtn>

                                        <Separator
                                            className={cn("w-full group-hover:bg-transparent")}/>
                                    </div>
                                    {filterText ?
                                        filteredWords.map((word, index) => (
                                            <WordItem key={word.id} wordData={word} index={index}/>
                                        )) :
                                        words.map((word, index) => (
                                            <WordItem key={word.id} wordData={word} index={index}/>
                                        ))
                                    }
                                </ul>
                                <ScrollBar className={"pt-20"}/>
                            </ScrollArea>
                        </ResizablePanel>
                        <ResizableHandle className={""} withHandle/>
                        <ResizablePanel className={""} defaultSize={68} order={2} id={"resizablePanel-2"}>
                            <ScrollArea className={"relative h-full"}>
                                {words.length > 0 ?
                                    <WordDetail
                                        wordData={
                                            filterText ?
                                                filteredWords[currentIndex] : words[currentIndex]}
                                    /> :
                                    <p className={"absolute top-1/2 left-1/2 -translate-x-1/2 text-xl text-muted"}>{t('no_word')}</p>
                                }
                                <ScrollBar/>
                            </ScrollArea>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </motion.div>

    )
}