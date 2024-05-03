'use client'

import Card, { WordCard } from "@/components/wordCard";
import React, { useState, useEffect } from "react";
import { getCards } from "@/app/lib/indexDB";
import Loading from "@/components/ui/loading";
import { PlusIcon } from '@radix-ui/react-icons'
import {Button} from "@/components/ui/button";
import Nav from "@/components/ui/nav/nav";
import { EditWordCard } from "@/components/editCard";
import { Slider } from "@/components/ui/slider";


export default function Home() {
    const [words, setWords] = useState<WordCard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [reLoad, setReload] = useState(false)
    const [interval, setInterval] = useState(10000)


    useEffect(() => {
        const fetchCards = async () => {
            const fetchedCards: WordCard[] = await getCards().then();
            setWords(fetchedCards.sort((a, b) => b.id - a.id))
            setIsLoading(false)
        };

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
            .catch(err => console.log(err));

    },[reLoad])

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % words.length;
            setCurrentIndex(nextIndex);
        }, interval)

        return () => clearTimeout(timer)
    }, [currentIndex, words, interval])

    const handleSlider = (value: number[]) => {
        setInterval(Math.max(value[0] * 1000, 500))
        localStorage.setItem("interval", (value[0] * 1000).toString())
    }


    return (
        <>
            <Nav>
                <Button onClick={() => { setIsAdding(true); setIsEditing(true) }}>
                    <PlusIcon className={"mr-1"} width={16} height={16}/>追加
                </Button>
            </Nav>
            {isEditing &&
                <EditWordCard
                    setIsEditing={setIsEditing}
                    setReload={setReload}
                    setInterval={setInterval}
                    setCurrentIndex={setCurrentIndex}
                    wordData={isAdding ? undefined : words[currentIndex]}
                >
                    <Button
                        variant={"ghost"}
                        onClick={() => { setIsEditing(false); setIsAdding(false); setInterval(1000) }}
                        type={"button"}>
                        Cancel
                    </Button>
                </EditWordCard>
            }
            {isLoading ? <Loading className={"flex h-svh"}/> :
                <>
                    <div className="flex flex-col items-center justify-center h-full">
                        <Card wordInfo={words[currentIndex]}>
                            <Button
                                className={"text-base"} variant={"coloredOutline"}
                                onClick={() => {
                                    setIsEditing(true);
                                    setInterval(999999999)
                                }}
                            >
                                Edit
                            </Button>
                        </Card>
                    </div>
                    <div className={"fixed bottom-0 h-32 flex w-full justify-center"}>
                        <Slider
                            defaultValue={[interval >= 1000 ? interval / 1000 : 0]}
                            max={10}
                            min={0}
                            step={1}
                            onValueChange={handleSlider}
                            className={"w-80"}>
                            {`${interval / 1000}秒`}
                        </Slider>
                    </div>
                </>
            }
        </>
    );
}
