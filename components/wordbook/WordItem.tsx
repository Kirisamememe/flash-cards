import { WordDataMerged } from "@/types/WordIndexDB";
import { cn } from "@/app/lib/utils";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area";
import WordDetail from "@/components/wordbook/WordDetail";
import { Button } from "@/components/ui/button";


export default function WordItem({ wordData, index }: { wordData: WordDataMerged, index: number }) {

    const isSmallDevice = useMediaQuery('(max-width:640px)')

    const currentIndex = useWordbookStore((state) => state.currentIndex)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)
    const setOverlayIsOpen = useWordbookStore((state) => state.setOverlayIsOpen)
    const isEditing = useWordbookStore((state) => state.isEditing)
    const setIsEditing = useWordbookStore((state) => state.setIsEditing)

    // const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
    const [open, setOpen] = useState(false)
    const [isScrolling, setIsScrolling] = useState(false)

    // const handleTouchStart = (e: React.TouchEvent) => {
    //     const touch = e.touches[0];
    //     setTouchStart({ x: touch.clientX, y: touch.clientY });
    //     setIsScrolling(false);
    // }

    const handleTouchMove = () => {
        setIsScrolling(true);
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (!isScrolling) {
            event.preventDefault()
            event.currentTarget.click()
        }
        // setTouchStart(null);
        setIsScrolling(false);
    }

    if (isSmallDevice) {
        return (
            <li className={"flex flex-col mb-2.5"}>
                <Drawer noBodyStyles open={open} onOpenChange={(value) => {
                    setOpen(value)
                    setOverlayIsOpen(value)
                    if (!value) setIsEditing(false)
                }}>
                    <DrawerTrigger asChild>
                        <div className={cn("flex gap-2 w-full h-12 items-center px-4 rounded-lg transition-all text-base bg-foreground/5 active:bg-foreground/15 justify-start")}
                             onClick={() => setCurrentIndex(index)}
                             onTouchMove={handleTouchMove}
                             onTouchEnd={handleTouchEnd}
                             autoFocus={false}
                        >
                            <p className={""}>{wordData.word}</p>
                            <Badge variant={"secondary"}
                                   className={"text-xs text-foreground/60 font-normal bg-foreground/5 hover:bg-foreground/10"}>{wordData.partOfSpeech && wordData.partOfSpeech.partOfSpeech}
                            </Badge>
                        </div>
                    </DrawerTrigger>
                    <DrawerContent className={"focus-visible:outline-none"} autoFocus={false}>
                        <ScrollArea className={""}>
                            <WordDetail wordData={wordData}/>
                        </ScrollArea>
                    </DrawerContent>
                </Drawer>
            </li>
        )
    }

    return (
        <li className={cn("relative h-14 flex flex-col border-b hover:border-transparent last:border-transparent", index === currentIndex && "border-transparent")}>
            <div
                className={cn("flex gap-2 w-[calc(100%+1rem)] -translate-x-2.5 -translate-y-[1px] h-14 items-center px-4 rounded-lg hover:scale-[103%] hover:bg-border active:scale-100 cursor-pointer transition-all text-sm hover:text-base", index === currentIndex && "scale-100 hover:scale-100 bg-primary/5 text-primary font-semibold ring-1 ring-primary hover:bg-primary/15 text-xl hover:text-xl")}
                onClick={() => {
                    if (currentIndex !== index) setCurrentIndex(index)
                    if (isEditing) setIsEditing(false)
                    console.log("Clicked")
                }}
                // onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                // onClickだけだと、なぜかiPadでのタッチ操作がワンテンポ遅い
            >
                <p className={""}>{wordData.word}</p>
                <Badge variant={"secondary"}
                       className={cn("text-xs text-foreground/60 font-normal bg-foreground/5 hover:bg-foreground/10", index === currentIndex && "bg-primary/10 text-primary hover:bg-primary/15")}>{wordData.partOfSpeech && wordData.partOfSpeech.partOfSpeech}
                </Badge>
            </div>
        </li>
    )
}