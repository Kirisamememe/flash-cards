'use client'

import FlashCard from "@/components/home/FlashCard";
import { Button } from "@/components/ui/button";
import AddWordBtn from "@/components/home/AddBtn";
import { PlusIcon } from "@radix-ui/react-icons";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import Setting from "@/components/home/Setting";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";


export default function CardContainer() {

    console.log("CardContainerがレンダリングされたようだ")

    const isSmallDevice = useMediaQuery('(max-width:640px)')
    const words = useWordbookStore((state) => state.words)


    return (
        <div id={"animation-container"} className={"appear flex flex-col h-full min-h-[32rem] items-center"}>
            {!isSmallDevice &&
                <AddWordBtn>
                    <Button
                        className={"fixed sm:right-12 lg:right-20 bottom-14 w-16 h-16 z-50 rounded-full shadow-xl dark:shadow-none shadow-primary/40"}>
                        <PlusIcon className={""} width={32} height={32}/>
                    </Button>
                </AddWordBtn>
            }

            <FlashCard/>

            {words.length > 0 && <Setting/>}
        </div>
    )
}
