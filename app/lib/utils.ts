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
    element: HTMLElement,
    keyframes: PropertyIndexedKeyframes | Keyframe[] | null,
    options?: number | KeyframeAnimationOptions | undefined
) {
    return new Promise<{ finish: boolean }>( (resolve, reject) => {
        if (!element) {
            reject({ finish: false });
            return;
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

export function disappearAnimation(
    containerRef: HTMLDivElement | HTMLElement | null,
    btn1Ref: HTMLButtonElement | null = null,
    btn2Ref: HTMLButtonElement | null = null,
    btn3Ref: HTMLButtonElement | null = null
): Promise<{ finish: boolean }> {
    return new Promise((resolve, reject) => {
        if (containerRef) {
            if (btn1Ref) btn1Ref.disabled = true
            if (btn2Ref) btn2Ref.disabled = true
            if (btn3Ref) btn3Ref.disabled = true

            animateElement(containerRef,[
                { opacity: '100%', transform: 'translateX(0)' },
                { opacity: '0', transform: 'translateX(-20%)' }
            ],{
                duration: 300,
                easing: 'ease-in-out'
            }).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        } else {
            reject({ finish: false })
        }
    })
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