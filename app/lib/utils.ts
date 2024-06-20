import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { WordDataMerged } from "@/types/WordIndexDB";

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
        element.play().catch(() => {
            resolve({ finish: true })
        })

        element.onended = () => {
            resolve({ finish: true })
        }

        element.onpause = () => {
            resolve({ finish: true })
        }

        element.oncancel = () => {
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

export function sortWords(words: WordDataMerged[]) {
    return words.sort((a, b) => {
        if (a.is_learned !== b.is_learned) {
            return Number(a.is_learned) - Number(b.is_learned)
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