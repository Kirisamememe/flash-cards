import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { WordData } from "@/types/WordIndexDB";
import { Result, synthesizeSpeech } from "./azureTTS";
import { SetStateAction } from "react";
import { indexDB } from "@/stores/wordbook-store";
import { Toast, ToasterToast } from "@/components/ui/use-toast";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
    console.error(error);
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
}

export function animateElement(
    element: HTMLElement | SVGElement,
    keyframes: PropertyIndexedKeyframes | Keyframe[] | null,
    options?: number | KeyframeAnimationOptions | undefined
) {
    return new Promise<{ finish: boolean }>( (resolve, reject) => {
        if (!element) {
            reject({ finish: false })
        }
        const animation = element.animate(keyframes, options)

        animation.onfinish = () => {
            resolve({ finish: true })
        }
        animation.oncancel = () => {
            resolve({ finish: false })
        }
        animation.onremove = () => {
            resolve({ finish: false })
        }
    })
}

export function playAudio(element: HTMLAudioElement, url: string) {
    return new Promise<{ finish: boolean }>((resolve, reject) => {
        if (!element) reject({ finish: false })

        element.src = url
        element.play().then().catch(() => {})

        element.onended = () => {
            resolve({ finish: true })
        }

        element.onpause = () => {
            resolve({ finish: true })
        }

        // element.oncancel = () => {
        //     resolve({ finish: true })
        // }

        element.onerror = () => {
            resolve({ finish: true })
        }
    })
}

export function playSEAudio(url: string = "/button.mp3") {
    const playSE = localStorage.getItem("playSE")
    if (playSE === "1" && url) {
        const audioElement = document.getElementById("sound-effect") as HTMLAudioElement
        if (!audioElement) return

        audioElement.autoplay = true

        if (url === "/button.mp3") audioElement.volume = 0.3
        audioElement.src = url
        // audioElement.play().then()
    }
}

export function sortWords(words: WordData[]) {
    return words.sort((a, b) => {
        if (!!a.learned_at !== !!b.learned_at) {
            return Number(!!a.learned_at) - Number(!!b.learned_at)
        }

        return b.created_at.getTime() - a.created_at.getTime()
    })
}


export function isEnglish(word: string) {
    return /^[A-Za-z]+$/.test(word)
}

export function maybeJapanese(word: string) {
    return /^[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u2605-\u2606\u2190-\u2195\u203B]+$/.test(word)
}

function synthesizeSpeechAndSaveToLocal(
    text: string,
    id: string,
    synthesizeSpeech: (text: string) => Promise<Result>,
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

                indexDB.saveTTS({
                    id: id,
                    binary: byteArray
                })

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
    id: string,
    audioRef: HTMLAudioElement,
    playAudio?: (element: HTMLAudioElement, url: string) => Promise<{ finish: boolean }>,
    playAudioWithAnimation?: (url: string, setPlaying: React.Dispatch<SetStateAction<boolean>>) => Promise<any>,
    setLoading?: React.Dispatch<SetStateAction<boolean>>,
    setPlaying?: React.Dispatch<SetStateAction<boolean>>,
    toast?: any
) {
    if (setLoading) setLoading(true)
    let url

    try {
        const res = await indexDB.getTTS(id)

        if (res.isSuccess && res.data[0] && audioRef) {
            url = URL.createObjectURL(new Blob([res.data[0].binary], { type: 'audio/mp3' }))
        } else {
            const request = await synthesizeSpeechAndSaveToLocal(text, id, synthesizeSpeech)
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
            // URL.revokeObjectURL(url)
        }
    } catch (error: any) {
        console.log(`エラーが発生したよ。id: ${id}`)
        if (setLoading) setLoading(false)
        if (toast)
        toast({
            title: error?.message || "Synthesize Error",
            description: "データを取得できませんでした",
            variant: "destructive"
        })
    } finally {
        if (url) URL.revokeObjectURL(url)
    }
}


export function syncFailed(
    toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void },
    t: any,
    error: string
) {
    toast({
        variant: "destructive",
        title: t('sync_error'),
        description: t(error)
    })
}