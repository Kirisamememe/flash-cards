'use client'

import Card from "@/components/wordCard";
import { WordCard } from "@/types/WordCard"
import React, { useState, useEffect } from "react";
import { getCards } from "@/app/lib/indexDB";
import Loading from "@/components/ui/loading";
import { PlusIcon } from '@radix-ui/react-icons'
import {Button} from "@/components/ui/button";
import { EditWordCard } from "@/components/editCard";
import { Slider } from "@/components/ui/slider";
import {cn} from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    // DialogDescription,
    // DialogHeader,
    // DialogTitle,
    // DialogFooter
} from "@/components/ui/dialog"
import {useTranslations} from "next-intl";


export default function CardContainer({userId}: {userId: string | undefined}) {
    const t = useTranslations('Index')

    const [words, setWords] = useState<WordCard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [reLoad, setReload] = useState(false)
    const [interval, setInterval] = useState(10000)


    useEffect(() => {
        console.log('userID:')
        console.log(userId)

        const fetchCards = async () => {
            const fetchedCards: WordCard[] = await getCards().then();
            setWords(fetchedCards.sort((a, b) => parseInt(b.created_at.toString()) - parseInt(a.created_at.toString())))
            setIsLoading(false)
        }

        fetchCards()
            .then(() => {
                setIsAdding(false)

                const userInterval = localStorage.getItem("interval")
                if (userInterval){
                    setInterval(Math.max(parseInt(userInterval), 500))
                }else {
                    localStorage.setItem("interval", "2000")
                    setInterval(2000)
                }
            })
            .catch(err => console.log(err))

    },[reLoad, userId])

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % words.length;
            setCurrentIndex(nextIndex)
        }, interval)

        return () => clearTimeout(timer)
    }, [currentIndex, words, interval])

    useEffect(() => {
        if (!isEditing) {
            const userInterval = localStorage.getItem("interval")
            if (userInterval) setInterval(parseInt(userInterval))
        }
    }, [isEditing]);

    const handleSlider = (value: number[]) => {
        setInterval(Math.max(value[0] * 1000, 500))
        localStorage.setItem("interval", (value[0] * 1000).toString())
    }

    return (
        <>
            {words.length > 0 && <Button
                className={"fixed right-10 bottom-10 w-16 h-16 z-10 rounded-full"}
                onClick={() => {
                    setIsAdding(true)
                    setIsEditing(true)
                }}>
                <PlusIcon className={""} width={32} height={32}/>
            </Button>}
            {isLoading ? <Loading className={"flex h-svh"}/> :
                <>
                    <div className="flex flex-col items-center justify-center h-full pb-6">
                        <Card wordInfo={words[currentIndex]}>
                            {words.length <= 0 &&
                                <h1 className={"text-5xl font-bold text-center leading-normal mb-12"}>
                                    {t('description').split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br/>
                                        </React.Fragment>
                                    ))}
                                </h1>}
                        </Card>
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button
                                    className={cn(words.length > 0 ? "text-base" : "rounded-full text-lg hover:shadow-xl hover:shadow-primary/20 hover:scale-110 active:scale-100 transition")}
                                    variant={words.length > 0 ? "coloredOutline" : "default"}
                                    size={words.length > 0 ? "default" : "lg"}
                                    onClick={() => {
                                        if (words.length === 0) setIsAdding(true)
                                        setInterval(999999999)
                                    }}
                                >
                                    {words.length > 0 ? t('editBtn') : t('createBtn')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-6 bg-background dark:shadow-primary/10 dark:ring-primary/20 shadow-2xl ring-1 ring-foreground/[0.05] rounded-6 sm:max-w-md">
                                <EditWordCard
                                    userId={userId}
                                    setIsEditing={setIsEditing}
                                    setReload={setReload}
                                    setInterval={setInterval}
                                    setCurrentIndex={setCurrentIndex}
                                    wordData={isAdding ? null : words[currentIndex]}
                                >
                                    <DialogClose asChild>
                                        <Button
                                            variant={"ghost"}
                                            size={"lg"}
                                            onClick={() => { setIsAdding(false) }}
                                            type={"button"}>
                                            {t('cancel')}
                                        </Button>
                                    </DialogClose>
                                </EditWordCard>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {words.length > 0 && <div className={"fixed bottom-0 h-32 flex w-full justify-center"}>
                        <Slider
                            defaultValue={[interval >= 1000 ? interval / 1000 : 0]}
                            max={10}
                            min={0}
                            step={1}
                            onValueChange={handleSlider}
                            className={"w-80"}>
                            {`${interval / 1000}秒`}
                        </Slider>
                    </div>}
                </>
            }
        </>
    );
}
