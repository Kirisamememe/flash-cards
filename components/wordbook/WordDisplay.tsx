import { Badge } from "@/components/ui/badge";
import { animateElement, cn } from "@/app/lib/utils";
import { TTSObj, WordDataMerged } from "@/types/WordIndexDB";
import { Separator } from "@/components/ui/separator";
import { Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import React, { SetStateAction, useRef, useState } from "react";
import { saveTTStoLocal } from "@/app/lib/indexDB/saveToLocal";
import { getTTSFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { useToast } from "@/components/ui/use-toast";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Result, synthesizeSpeech } from "@/app/lib/azureTSS";
import { useSession } from "next-auth/react";
import { UpdatePromiseCommonResult } from "@/types/ActionsResult";

export default function WordDisplay({ wordData }: { wordData: WordDataMerged }) {

    const { data: session } = useSession()
    const t = useTranslations()
    const { toast } = useToast()
    const setWord = useWordbookStore((state) => state.setWord)
    const [loadingWord, setLoadingWord] = useState(false)
    const [loadingExample, setLoadingExample] = useState(false)
    const [isPlayingWord, setIsPlayingWord] = useState(false)
    const [isPlayingExample, setIsPlayingExample] = useState(false)

    const audioRef = useRef<HTMLAudioElement>(null)
    const progressCircle = useRef<SVGCircleElement>(null)

    const handleSpeechWord = async () => {
        if (wordData?.ttsUrl?.word && audioRef.current) {
            await playAudioWithAnimation(wordData?.ttsUrl.word, setIsPlayingWord)
        }
        else if (audioRef.current) {
            await fetchAndPlayAudio(
                wordData.word,
                wordData,
                "word",
                audioRef.current,
                undefined,
                playAudioWithAnimation,
                setWord,
                setLoadingWord,
                setIsPlayingWord,
                toast
            )
        }
        else {
            toast({
                title: "Synthesize Error",
                description: "不明なエラー",
                variant: "destructive"
            })
        }
    }

    const handleSpeechExample = async () => {
        if (isPlayingExample){
            pauseExample()
        }
        else {
            await playOrFetchExample()
        }
    }

    const pauseExample = () => {
        setIsPlayingExample(false);
        if (progressCircle.current && audioRef.current) {
            progressCircle.current.getAnimations().map(a => a.cancel())
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }

    const playOrFetchExample = async () => {
        if (wordData?.ttsUrl?.example && progressCircle.current && audioRef.current) {
            await playAudioWithAnimation(wordData?.ttsUrl.example, setIsPlayingExample)
        }
        else if (wordData.example && wordData.example.length > 5 && audioRef.current) {
            await fetchAndPlayAudio(
                wordData.example,
                wordData,
                "example",
                audioRef.current,
                undefined,
                playAudioWithAnimation,
                setWord,
                setLoadingExample,
                setIsPlayingExample,
                toast
            )
        }
        else {
            toast({
                title: "Synthesize Error",
                description: "不明なエラー",
                variant: "destructive"
            })
        }
    }

    const playAudioWithAnimation = async (url: string, setPlay: React.Dispatch<SetStateAction<boolean>>) => {
        if (!progressCircle.current || !audioRef.current) return

        audioRef.current.src = url
        setPlay(true)

        try {
            await audioRef.current.play()
            await animateElement(progressCircle.current, [
                { strokeDashoffset: 100.53 },
                { strokeDashoffset: 0 }
            ], {
                duration: audioRef.current.duration * 1000,
                fill: "forwards"
            })
        } finally {
            setPlay(false)
        }
    }

    // このコンポーネントにおいてuseEffectはいらない。

    return (
        <>
            <div className={"inline-flex gap-1 lg:gap-2 items-center mb-2 sm:mb-3 lg:mb-5"}>
                <p className={"px-1.5 scroll-m-20 font-bold text-3xl sm:text-4xl lg:text-5xl select-all"}>
                    {wordData?.word}
                </p>
                <Button disabled={loadingWord || session?.user.role !== "ADMIN"}
                        className={"mt-1.5 lg:mt-2 p-1.5 sm:size-10 lg:size-11 text-primary hover:text-primary hover:bg-primary/10 active:text-primary active:bg-primary/10"}
                        variant={"ghost"}
                        size={"icon"}
                        onClick={handleSpeechWord}>
                    {isPlayingWord ? <div className={"line-2-vertical"}></div> :
                        loadingWord ? <div className={"circle-spin-8-24"}/> : <Volume2 size={32}/>
                    }
                </Button>
            </div>

            {wordData?.phonetics && wordData?.phonetics?.length > 0 &&
                <p className={"px-1.5 text-foreground/50 text-lg mb-4 select-all"}>
                    {wordData?.phonetics || ""}
                </p>
            }

            {wordData?.partOfSpeech?.partOfSpeech &&
                <Badge variant={"coloredSecondary"}
                       className={"mb-5 lg:text-sm"}>{wordData?.partOfSpeech?.partOfSpeech || ""}
                </Badge>
            }

            <p className={cn("px-1.5 text-lg lg:text-xl text-muted-foreground font-semibold rounded-4 transition-all")}>
                {wordData?.definition}
            </p>

            <Separator className={"my-6"}/>

            {wordData?.example && wordData?.example?.length > 0 &&
                <p className={"px-1.5 mb-4 text-foreground text-lg sm:text-xl lg:text-2xl font-medium sm:leading-normal lg:leading-normal"}>
                    {wordData?.example || ""}
                    <Button disabled={loadingExample || session?.user.role !== "ADMIN"}
                            className={cn(
                                "rounded-full size-8 p-0 ml-2 align-middle text-primary hover:text-primary active:text-primary hover:bg-primary/10 active:bg-primary/10 overflow-clip",
                                isPlayingExample ? "shadow-primary/30 dark:shadow-primary/30" : "shadow-primary dark:shadow-primary")}
                            variant={"outline"}
                            size={"icon"}
                            onClick={handleSpeechExample}>
                        {loadingExample ?
                            <div className={"circle-spin-8-20"}/> :
                            <Volume2 className={cn(isPlayingExample && "hidden")} size={20}/>
                        }
                        <svg className={cn(!isPlayingExample && "hidden")} width="32" height="32">
                            <rect x={11} y={11} width={10} height={10} className={"fill-primary"}/>
                            <circle ref={progressCircle} className={"progress-circle"} cx="16" cy="16" r="16"/>
                        </svg>
                    </Button>
                </p>
            }

            <div className={"flex flex-col w-full bg-foreground/[0.03] p-4 rounded-lg"}>
                <p className={cn("text-base text-muted-foreground rounded-4 transition-all leading-relaxed")}>
                    {wordData?.notes || t("WordsBook.note_null")}
                </p>
            </div>
            <audio ref={audioRef}/>
        </>
    )
}

function synthesizeSpeechAndSaveToLocal(
    text: string,
    wordId: string,
    type: "word" | "example",
    synthesizeSpeech: (text: string) => Promise<Result>,
    saveTTStoLocal: (ttsObj: TTSObj) => Promise<UpdatePromiseCommonResult<IDBValidKey>>,
): Promise<{ isSuccess: true, data: Blob } | { isSuccess: false }> {
    return new Promise(async (resolve, reject) => {
        await synthesizeSpeech(text).then((res) => {
            if (res.isSuccess && res.data) {
                // console.log(`res.data: ${res.data}`)
                const byteCharacters = atob(res.data)
                // console.log(byteCharacters)
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                // console.log(byteNumbers)
                const byteArray = new Uint8Array(byteNumbers)

                saveTTStoLocal({
                    id: `${type}_${wordId}`,
                    binary: byteArray
                })
                // console.log(byteArray)
                resolve({
                    isSuccess: true,
                    data: new Blob([byteArray], { type: 'audio/mp3' })
                })
            } else {
                reject({ isSuccess: false })
            }
        }).catch(() => {
            reject({ isSuccess: false })
        })
    })
}

export async function fetchAndPlayAudio(
    text: string,
    wordData: WordDataMerged,
    type: "word" | "example",
    audioRef: HTMLAudioElement,
    playAudio?: (element: HTMLAudioElement, url: string) => Promise<{ finish: boolean }>,
    playAudioWithAnimation?: (url: string, setPlaying: React.Dispatch<SetStateAction<boolean>>) => Promise<any>,
    setWord?: (word: WordDataMerged) => void,
    setLoading?: React.Dispatch<SetStateAction<boolean>>,
    setPlaying?: React.Dispatch<SetStateAction<boolean>>,
    toast?: any
) {
    if (setLoading) setLoading(true)

    try {
        const res = await getTTSFromLocal(wordData.id, type)
        let url

        if (res.isSuccess && res.data && audioRef) {
            url = URL.createObjectURL(new Blob([res.data.binary], { type: 'audio/mp3' }))
        } else {
            const request = await synthesizeSpeechAndSaveToLocal(text, wordData.id, type, synthesizeSpeech, saveTTStoLocal)
            if (request.isSuccess && audioRef) {
                const newUrl = URL.createObjectURL(request.data)
                audioRef.src = newUrl
                url = newUrl
            } else {
                throw new Error("Synthesize Error")
            }
        }

        if (url) {
            if (setLoading) setLoading(false)
            if (playAudio) await playAudio(audioRef, url)
            if (playAudioWithAnimation && setPlaying) await playAudioWithAnimation(url, setPlaying)
            if (setWord) {
                setWord({ ...wordData, ttsUrl: { [type]: url } })
            }
            else {
                URL.revokeObjectURL(url)
            }
        }
    } catch (error: any) {
        if (setLoading) setLoading(false)
        toast({
            title: error?.message || "Synthesize Error",
            description: "データを取得できませんでした",
            variant: "destructive"
        })
    }　
}