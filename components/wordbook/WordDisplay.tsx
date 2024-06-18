import { Badge } from "@/components/ui/badge";
import { animateElement, cn } from "@/app/lib/utils";
import { WordDataMerged } from "@/types/WordIndexDB";
import { Separator } from "@/components/ui/separator";
import { Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { saveTTStoLocal } from "@/app/lib/indexDB/saveToLocal";
import { getTTSFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { useToast } from "@/components/ui/use-toast";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { synthesizeSpeech } from "@/app/lib/azureTSS";

export default function WordDisplay({ wordData }: { wordData: WordDataMerged }) {

    const t = useTranslations()
    const { toast } = useToast()
    const setWord = useWordbookStore((state) => state.setWord)
    const [loading, setLoading] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const progressCircle = useRef<SVGCircleElement>(null)

    const handleSpeechExample = async () => {
        if (isPlaying){
            setIsPlaying(false)

            if (progressCircle.current && audioRef.current) {
                progressCircle.current.getAnimations().map(a => a.cancel())
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
        }
        else {
            if (wordData?.ttsUrl && progressCircle.current && audioRef.current) {
                setIsPlaying(true)
                console.log(`Duration: ${duration}`)

                Promise.all([
                    animateElement(progressCircle.current,[
                        { strokeDashoffset: 100.53 },
                        { strokeDashoffset: 0 }
                    ],{
                        duration: duration * 1000 + 500,
                        fill: "forwards"
                    }),
                    await audioRef.current.play()
                ]).finally(() => setIsPlaying(false))

                console.log("[TTS] Clicked")
                // await audioRef.current.play().finally(() => setIsPlaying(false))
                return
            }

            if (wordData.example && wordData.example.length > 5) {
                setLoading(true)

                let blob, url
                const request = await getTTSFromLocal(wordData.id, "example")

                if (request.isSuccess && request.data) {
                    blob = new Blob([request.data.binary], { type: 'audio/mp3' })
                }
                else {
                    await synthesizeSpeech(wordData.example).then((res) => {
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
                                id: `example_${wordData.id}`,
                                binary: byteArray
                            })
                            // console.log(byteArray)
                            blob = new Blob([byteArray], { type: 'audio/mp3' })
                        }
                    })
                }

                if (!blob) {
                    toast({
                        title: "Synthesize Error",
                        description: "Synthesize Error",
                        variant: "destructive"
                    })

                    setLoading(false)
                    return
                }

                url = URL.createObjectURL(blob)

                setLoading(false)
                if (audioRef.current && progressCircle.current) {
                    audioRef.current.src = url

                    setIsPlaying(true)
                    // console.log(`Duration: ${audioRef.current.duration}`)

                    Promise.all([
                        await audioRef.current.play(),
                        animateElement(progressCircle.current,[
                            { strokeDashoffset: 100.53 },
                            { strokeDashoffset: 0 }
                        ],{
                            duration: audioRef.current.duration * 1000 + 500,
                            fill: "forwards"
                        })
                    ]).finally(() => {
                        setIsPlaying(false)
                        setWord({...wordData, ttsUrl: url})
                    })
                }
            }
        }
        // const speechExample = new SpeechSynthesisUtterance(wordData.example)
        // const voices = speechSynthesis.getVoices()
        //
        // speechExample.voice = voices[156]
        // speechSynthesis.speak(speechExample)
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration)
    }

    useEffect(() => {
        const audioElement = audioRef.current

        if (audioElement) {
            audioElement.addEventListener("loadedmetadata", handleLoadedMetadata)
        }

        if (wordData?.ttsUrl && audioElement) {
            audioElement.src = wordData.ttsUrl
        }

        return () => {
            if (audioElement) audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [wordData?.ttsUrl]);

    return (
        <>
            <div className={"inline-flex gap-1 lg:gap-2 items-center mb-2 sm:mb-3 lg:mb-5"}>
                <p className={"px-1.5 scroll-m-20 font-bold text-3xl sm:text-4xl lg:text-5xl select-all"}>
                    {wordData?.word}
                </p>
                <Button disabled className={"mt-1.5 lg:mt-2 p-1.5 sm:size-10 lg:size-11"} variant={"ghost"}
                        size={"icon"}>
                    <Volume2 className={""} size={32}/>
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
                    <Button disabled={loading}
                            className={cn(
                                "rounded-full size-8 p-0 ml-2 align-middle text-primary hover:text-primary active:text-primary hover:bg-primary/10 active:bg-primary/10 overflow-clip",
                                isPlaying ? "shadow-primary/30 dark:shadow-primary/30" : "shadow-primary dark:shadow-primary")}
                            variant={"outline"}
                            size={"icon"}
                            onClick={handleSpeechExample}>
                        {loading ?
                            <div className={"circle-spin-8"}/> :
                            <Volume2 className={cn(isPlaying && "hidden")} size={20}/>
                        }
                        <svg className={cn(!isPlaying && "hidden")} width="32" height="32">
                            <rect x={11} y={11} width={10} height={10} className={"fill-primary"}/>
                            <circle ref={progressCircle} className={"progress-circle"} cx="16" cy="16" r="16" />
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