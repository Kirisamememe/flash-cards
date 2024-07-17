'use client'

import { Carousel, type CarouselApi, CarouselContent, CarouselItem, } from "@/components/ui/carousel";
import React, { useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";
import ReactDOM from "react-dom";
import { EmblaCarouselType } from "embla-carousel";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useSession } from "next-auth/react";
import { exampleMaterial, tabValues } from "@/types/static";
import { Generate } from "@/components/ai-booster/Generate";
import { History } from "@/components/ai-booster/History";
import { MyBookmark } from "@/components/ai-booster/MyBookmark";
import { ScrollArea } from "../ui/scroll-area";
import { indexDB } from "@/stores/wordbook-store";
import { Skeleton } from "../ui/skeleton";

function MobileNav({ api }: { api: EmblaCarouselType | undefined }) {
    const header = document.getElementById("header")

    if (!header) return null
    if (!api) return null

    return ReactDOM.createPortal(
        <div className={"lg:px-48 flex items-center justify-center border-t-[0.03125rem] border-foreground/15"}>
            <div
                className={"pl-5 sm:pl-7 lg:pl-0 lg:min-w-[46rem] flex gap-4 sm:gap-8 2xl:gap-12 items-center 2xl:justify-center w-full h-14"}>
                {tabValues.map((val, index) => (
                    <button key={val.title} className={"group relative flex items-center h-full"}
                            onClick={() => api?.scrollTo(index)}>
                        <h2 className={cn("text-muted-foreground font-medium transition-all leading-[0] pt-1 sm:pt-0 duration-200 group-hover:text-foreground group-hover:scale-105", api.selectedScrollSnap() === index && "text-xl sm:text-base text-foreground font-bold pt-0 leading-[0]",)}>
                            {/*leading-[0]は現時点（2024.06.25）でのSafari対策です。*/}
                            {val.title}
                        </h2>
                        <div
                            className={cn("transition-all duration-200", api.selectedScrollSnap() === index ? "absolute h-0.5 w-full bg-primary bottom-0 -z-10" : "bg-transparent")}/>
                    </button>
                ))}
            </div>
        </div>,
        header
    )
}

export default function AIBoosterContainer() {

    const [api, setApi] = useState<CarouselApi>()
    const [_, setTabValue] = useState(false)

    const setCarouselIndex = useWordbookStore((state) => state.setCarouselIndex)
    const setHideHeader = useWordbookStore((state) => state.setHideHeader)
    
    const setGeneratedMaterial = useWordbookStore((state) => state.setGeneratedMaterial)
    const materialHistory = useWordbookStore((state) => state.materialHistory)
    const setMaterialHistory = useWordbookStore((state) => state.setMaterialHistory)
    const setAIBoosterAudio = useWordbookStore((state) => state.setAIBoosterAudio)
    const setLoadingMaterial = useWordbookStore((state) => state.setLoadingMaterial)

    const { data: session } = useSession()
    const userId = session?.user?.id

    useEffect(() => {
        setAIBoosterAudio(document.getElementById("ai-booster-audio") as HTMLAudioElement)
        if (!userId) {
            setGeneratedMaterial(exampleMaterial)
            return
        }

        if (!materialHistory.length && userId) {
            // ログインしているがmaterialHistoryがあるかどうかわからない場合
            indexDB.getAllMaterials(userId)
                .then((res) => {
                    if (res.isSuccess && res.data.length) {
                        setMaterialHistory(res.data)
                        setGeneratedMaterial(res.data[0])
                    } else {
                        setGeneratedMaterial(exampleMaterial)
                    }
                })
        }

    }, [materialHistory.length, setAIBoosterAudio, setGeneratedMaterial, setLoadingMaterial, setMaterialHistory, userId])

    useEffect(() => {
        if (!api) return

        api.on("select", () => {
            setTabValue(prev => !prev)
            setHideHeader(false)
            setCarouselIndex(api.selectedScrollSnap())
        })

    }, [api, setCarouselIndex, setHideHeader])


    const handleDrag = (_: EmblaCarouselType, event: MouseEvent | TouchEvent) => {
        return !(event instanceof MouseEvent) // macOSのSafariではTouchEventは存在しない。
    }

    return (
        <div id={"animation-container"} className={"w-screen h-dvh"}>
            <MobileNav api={api}/>

            <Carousel opts={{ align: "center", duration: 20, watchDrag: handleDrag }} orientation="horizontal"
                      setApi={setApi} className={""}>
                <CarouselContent className={"relative ml-0 h-dvh"}>
                    {/*ジェネレート*/}
                    <CarouselItem className={"flex h-dvh justify-center pl-0 pr-0"}>
                        <ScrollArea 
                            id={"carousel-0"} 
                            type="scroll"
                            className="w-full sm:pl-2 sm:pr-3 min-h-[40rem]" 
                            barClass="pt-36 pb-20 sm:pb-1 px-0.5">
                            <Generate/>
                        </ScrollArea>
                    </CarouselItem>
                    
                    {/*生成履歴*/}
                    <CarouselItem className={"flex h-dvh justify-center pl-0 pr-0"}>
                        <ScrollArea 
                            id={"carousel-1"} 
                            type="scroll"
                            className="w-full sm:pl-2 sm:pr-6" 
                            barClass="pt-36 pb-20 sm:pb-1 px-0.5">
                            <History/>
                        </ScrollArea>
                    </CarouselItem>

                    {/*お気に入り*/}
                    <CarouselItem className={"flex h-dvh justify-center pl-0 pr-0"}>
                        <ScrollArea 
                            id={"carousel-2"} 
                            type="scroll"
                            className="w-full sm:pl-2 sm:pr-6" 
                            barClass="pt-36 pb-20 sm:pb-1 px-0.5">
                            <MyBookmark/>
                        </ScrollArea>
                    </CarouselItem>
                </CarouselContent>
            </Carousel>
            <audio id="ai-booster-audio" autoPlay/>
        </div>
    )
}

