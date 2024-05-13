'use client'

import FlashCard from "@/components/wordCard";
import { WordDataMerged } from "@/types/WordIndexDB"
import React, { useState, useEffect } from "react";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { SlidersVertical } from 'lucide-react';
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import AvatarMenu from "@/components/ui/nav/avatar-menu";
import { getCardsFromLocal, getUserInfoFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";
import AddWordBtn from "@/components/ui/AddBtn";
import EditWordBtn from "@/components/ui/EditBtn";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@radix-ui/react-icons";


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
    const t2 = useTranslations('User')

    const [words, setWords] = useState<WordDataMerged[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [reLoad, setReload] = useState(false)
    const [interval, setInterval] = useState(10000)
    const [blindMode, setBlindMode] = useState<boolean>(false)
    const [autoSync, setAutoSync] = useState<boolean>(false)
    const [loggedOutUse, setLoggedOutUse] = useState<boolean>(false)



    useEffect(() => {
        const loggedOutUseFromLocalStorage = localStorage.getItem("loggedOutUse")
        setLoggedOutUse(loggedOutUseFromLocalStorage !== null && loggedOutUseFromLocalStorage === "1")

        const fetchCards = async (userId: string | undefined, loggedOutUse: boolean) => {
            const fetchedCards = await getCardsFromLocal(userId, loggedOutUse);
            if (fetchedCards.isSuccess) {
                setWords(fetchedCards.data.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()))
                setIsLoading(false)
                setCurrentIndex(0)
            }
            else {
                setIsLoading(false)
                console.error(fetchedCards.error.detail)
            }
        }

        const fetchUserInfo = async (userId: string) => {
            const fetchedUserInfo = await getUserInfoFromLocal(userId)
            if (fetchedUserInfo.isSuccess) {
                setLoggedOutUse(fetchedUserInfo.data.use_when_loggedout)
                setBlindMode(fetchedUserInfo.data.blind_mode)
                setAutoSync(fetchedUserInfo.data.auto_sync)

                localStorage.setItem("loggedOutUse", fetchedUserInfo.data.use_when_loggedout ? "1" : "2")
                localStorage.setItem("blindMode", fetchedUserInfo.data.blind_mode ? "1" : "2")
                localStorage.setItem("autoSync", fetchedUserInfo.data.auto_sync ? "1" : "2")
            }
        }

        fetchCards(userId, loggedOutUse).catch(err => console.error(err))

        if (userId) {
            fetchUserInfo(userId).catch(err => console.error(err))
        }

        const userInterval = localStorage.getItem("interval")
        if (userInterval){
            setInterval(Math.max(parseInt(userInterval), 500))
        }else {
            localStorage.setItem("interval", "2000")
            setInterval(2000)
        }

    },[loggedOutUse, reLoad, userId])

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % words.length;
            setCurrentIndex(nextIndex)
        }, interval)

        return () => clearTimeout(timer)
    }, [currentIndex, words, interval])


    const handleSlider = (value: number[]) => {
        setInterval(Math.max(value[0] * 1000, 500))
        localStorage.setItem("interval", Math.max(value[0] * 1000, 500).toString())
    }

    const handleLoggedOutUseSwitchChange = async (value: boolean) => {
        setLoggedOutUse(value)

        if (userId) {
            localStorage.setItem("loggedOutUse", value ? "1" : "0")
            const result = await getUserInfoFromLocal(userId).catch()
            if (result.isSuccess) {
                const data: UserInfo = { ...result.data, use_when_loggedout: value, updated_at: new Date() }
                await saveUserInfoToLocal(data)
            }
        }
        else {
            localStorage.setItem("loggedOutUse", value ? "1" : "0")
        }
    }

    const handleBlindModeSwitchChange = async (value: boolean) => {
        setBlindMode(value)

        if (userId) {
            localStorage.setItem("blindMode", value ? "1" : "0")
            const result = await getUserInfoFromLocal(userId)
            if (result.isSuccess) {
                const data: UserInfo = { ...result.data, blind_mode: value, updated_at: new Date() }
                await saveUserInfoToLocal(data)
            }
        }
        else {
            localStorage.setItem("blindMode", value ? "1" : "0")
        }
    }

    const handleAutoSyncSwitchChange = async (value: boolean) => {
        setAutoSync(value)

        if (userId) {
            localStorage.setItem("autoSync", value ? "1" : "0")
            const result = await getUserInfoFromLocal(userId).catch()
            if (result.isSuccess) {
                const data: UserInfo = { ...result.data, auto_sync: value, updated_at: new Date() }
                console.log(data)
                await saveUserInfoToLocal(data)
            }
        }
        else {
            localStorage.setItem("autoSync", value ? "1" : "0")
        }
    }


    return (
        <>
            {userId &&
                <AvatarMenu userId={userId} url={avatar} userName={userName} autoSync={autoSync} parentReload={setReload}>
                    <div className={"h-8 flex w-full justify-between items-center gap-6 mb-3"}>
                        <h4 className="font-medium leading-none">{t2("auto_sync")}</h4>
                        <Switch
                            checked={autoSync}
                            onClick={() => setAutoSync(prev => !prev)}
                        />
                    </div>
                    <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                        <h4 className="font-medium leading-none">{t2("blind_mode")}</h4>
                        <Switch
                            checked={blindMode}
                            onClick={() => setBlindMode(prev => !prev)}
                        />
                    </div>
                </AvatarMenu>}
            <AddWordBtn
                userId={userId || ""}
                setReload={setReload}
                setCurrentIndex={setCurrentIndex}
            >
                <Button
                    className={cn(words.length <= 0 && "sm:hidden", "fixed right-[50%] translate-x-[50%] sm:right-20 bottom-3 sm:bottom-14 sm:size-16 z-30 rounded-full")} >
                    <PlusIcon className={""} width={32} height={32}/>
                </Button>
            </AddWordBtn>
            {isLoading ? <Loading className={"flex h-svh"}/> :
                <>
                    <div className={"fixed top-[46%] sm:top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center w-full sm:max-w-[60rem]"}>
                        <FlashCard blindMode={blindMode} wordInfo={words[currentIndex]}>
                            {words.length <= 0 &&
                                <>
                                    {t('description').split('\n').map((line, index) => (
                                        <h1 className={"text-3xl sm:text-4xl lg:text-5xl font-bold text-center leading-normal my-1 sm:my-2 lg:my-2.5"} key={index}>
                                            {line}
                                        </h1>
                                    ))}
                                </>}
                        </FlashCard>

                        {words.length > 0 ? <EditWordBtn
                                userId={userId}
                                wordData={words[currentIndex]}
                                setInterval={setInterval}
                                setReload={setReload}
                            /> :
                            <AddWordBtn
                                userId={userId || ""}
                                setReload={setReload}
                                setCurrentIndex={setCurrentIndex}
                            >
                                <Button
                                    className={cn("mt-4 z-30 rounded-full")}
                                    size={"lg"}>
                                    {t("createBtn")}
                                </Button>
                            </AddWordBtn>
                        }
                    </div>

                    {words.length > 0 && <div className={"fixed left-[50%] translate-x-[-50%] bottom-20 sm:bottom-8 h-16 flex w-[20rem] sm:w-[28rem]  justify-center gap-2 sm:gap-4 pr-6 sm:pr-16"}>
                        <Popover>
                            <PopoverTrigger className={""}>
                                <Button className={"rounded-full h-14 hover:bg-primary/10"} type={"button"} variant={"ghost"}>
                                    <SlidersVertical className={"text-primary"}/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className={"w-full rounded-xl px-8 py-6 gap-6"}>
                                {userId ?
                                    <div className={"h-8 flex w-full justify-between items-center gap-6 mb-4"}>
                                        <h4 className="font-medium leading-none">{t2("auto_sync")}</h4>
                                        <Switch
                                            checked={autoSync}
                                            defaultChecked={autoSync}
                                            onCheckedChange={handleAutoSyncSwitchChange}
                                        />
                                    </div> :
                                    <div className={"h-8 flex w-full justify-between items-center gap-6 mb-4"}>
                                        <h4 className="font-medium leading-none">{t2("use_when_logged_out")}</h4>
                                        <Switch
                                            checked={loggedOutUse}
                                            defaultChecked={loggedOutUse}
                                            onCheckedChange={handleLoggedOutUseSwitchChange}
                                        />
                                    </div>
                                }

                                <div className={"h-8 flex w-full justify-between items-center gap-6"}>
                                    <h4 className="font-medium leading-none">{t2("blind_mode")}</h4>
                                    <Switch
                                        checked={blindMode}
                                        defaultChecked={blindMode}
                                        onCheckedChange={handleBlindModeSwitchChange}
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
