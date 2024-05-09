'use client'

import FlashCard from "@/components/wordCard";
import { WordCard } from "@/types/WordCard"
import React, { useState, useEffect } from "react";
import { getCardsFromLocal } from "@/app/lib/indexDB";
import Loading from "@/components/ui/loading";
import { PlusIcon } from '@radix-ui/react-icons'
import { Button } from "@/components/ui/button";
import { EditWordCard } from "@/components/editCard";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { SlidersVertical } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import AvatarMenu from "@/components/ui/nav/avatar-menu";


export default function CardContainer({
    userId,
    avatar,
    userName
}: {
    avatar: string | undefined | null
    userId: string | undefined
    userName: string | undefined | null
}) {
    const t = useTranslations('Index')

    const [words, setWords] = useState<WordCard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [reLoad, setReload] = useState(false)
    const [interval, setInterval] = useState(10000)
    const [hardMode, setHardMode] = useState<boolean>(false)
    const [autoSync, setAutoSync] = useState<boolean>(false)
    const [loggedOutUse, setLoggedOutUse] = useState<boolean>(false)


    useEffect(() => {
        const fetchCards = async () => {
            const fetchedCards: WordCard[] = await getCardsFromLocal(userId).then();
            setWords(fetchedCards.sort((a, b) => parseInt(b.created_at.toString()) - parseInt(a.created_at.toString())))
            setIsLoading(false)
            setCurrentIndex(0)
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
        localStorage.setItem("interval", Math.max(value[0] * 1000, 500).toString())
    }

    return (
        <>
            {userId &&
                <AvatarMenu userId={userId} url={avatar} userName={userName} parentReload={setReload}>
                    <div className={"h-8 flex w-full justify-between items-center gap-6 mb-3"}>
                        <h4 className="font-medium leading-none">{("Blind Mode")}</h4>
                        <Switch
                            checked={hardMode}
                            onClick={() => setHardMode(prev => !prev)}
                        />
                    </div>
                    <div className={"h-8 flex w-full justify-between items-center gap-6 mb-3"}>
                        <h4 className="font-medium leading-none">{("Auto Sync")}</h4>
                        <Switch
                            checked={autoSync}
                            onClick={() => setAutoSync(prev => !prev)}
                        />
                    </div>
                    <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                        <h4 className="font-medium leading-none">{("Logged out use")}</h4>
                        <Switch
                            checked={loggedOutUse}
                            onClick={() => setLoggedOutUse(prev => !prev)}
                        />
                    </div>
                </AvatarMenu>}
            {words.length > 0 &&
                <Button
                    className={"fixed right-12 bottom-20 sm:bottom-14 w-16 h-16 z-10 rounded-full"}
                    onClick={() => {
                        setIsAdding(true)
                        setIsEditing(true)
                    }}>
                    <PlusIcon className={""} width={32} height={32}/>
                </Button>}
            {isLoading ? <Loading className={"flex h-svh"}/> :
                <>
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <FlashCard wordInfo={words[currentIndex]}>
                            {words.length <= 0 &&
                                <h1 className={"text-5xl font-bold text-center leading-normal mb-12"}>
                                    {t('description').split('\n').map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br/>
                                        </React.Fragment>
                                    ))}
                                </h1>}
                        </FlashCard>
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button
                                    className={cn(words.length > 0 ? "text-base" : "rounded-full text-lg hover:shadow-xl hover:shadow-primary/20 transition")}
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

                    {words.length > 0 && <div className={"fixed left-[calc(50%-11em)] sm:left-[calc(50%-14rem)] bottom-5 sm:bottom-8 h-16 flex w-[22rem] sm:w-[28rem]  justify-center gap-4 pr-16"}>
                        <Popover>
                            <PopoverTrigger className={""}>
                                <Button className={"rounded-full h-14 hover:bg-primary/10"} type={"button"} variant={"ghost"}>
                                    <SlidersVertical className={"text-primary"}/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className={"w-full rounded-xl px-8 py-6 gap-6"}>
                                <div className={"h-8 flex w-full justify-between items-center gap-6 mb-4"}>
                                    <h4 className="font-medium leading-none">{("Blind Mode")}</h4>
                                    <Switch
                                        checked={hardMode}
                                        onClick={() => setHardMode(prev => !prev)}
                                    />
                                </div>
                                <div className={"h-8 flex w-full justify-between items-center gap-6 mb-4"}>
                                    <h4 className="font-medium leading-none">{("Auto Sync")}</h4>
                                    <Switch
                                        checked={autoSync}
                                        onClick={() => setAutoSync(prev => !prev)}
                                    />
                                </div>
                                <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                                    <h4 className="font-medium leading-none">{("Logged out use")}</h4>
                                    <Switch
                                        checked={loggedOutUse}
                                        onClick={() => setLoggedOutUse(prev => !prev)}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
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
