import React, { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useTranslations } from "next-intl";
import EditWordBtn from "@/components/home/EditBtn";
import { Button } from "@/components/ui/button";
import AddWordBtn from "@/components/home/AddBtn";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Separator } from "@/components/ui/separator";
import { CircleX, CircleCheck } from 'lucide-react';
import { animateElement } from "@/app/lib/utils";
import { saveRecordToLocal } from "@/app/lib/indexDB/saveToLocal";
import { createId } from "@paralleldrive/cuid2";

export default function FlashCard() {

    console.log("FlashCardがレンダリングされたようだ")

    const t = useTranslations()

    const flashcard = useRef<HTMLDivElement>(null)
    const forgotBtn = useRef<HTMLButtonElement>(null)
    const forgotBtnBG = useRef<HTMLDivElement>(null)
    const rememberedBtn = useRef<HTMLButtonElement>(null)
    const rememberedBtnBG = useRef<HTMLDivElement>(null)
    const countDownBar = useRef<HTMLDivElement>(null)
    const editBtn = useRef<HTMLButtonElement>(null)
    const btnArea = useRef<HTMLDivElement>(null)

    const words = useWordbookStore((state) => state.words).filter(word => !word.is_learned)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const currentIndex = useWordbookStore((state) => state.currentIndex)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)
    const userInterval = useWordbookStore((state) => state.userInterval)

    if (currentIndex >= words.length) {
        setCurrentIndex(0)
    }

    const [isPaused, setIsPaused] = useState(false)
    const [isRemembered, setIsRemembered] = useState(false)
    const [reviewedAt, setReviewedAt] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState<number>(0)

    const isSmallDevice = useMediaQuery('(max-width:640px)')

    const switchAnimation = useCallback(switchAnimator,[])

    useEffect(() => {
        console.log("(1) ＊＊＊＊＊FlashCardのuseEffectが実行された＊＊＊＊")

        const flashcardRef = flashcard.current
        const forgotBtnRef = forgotBtn.current
        const forgotBtnBGRef = forgotBtnBG.current
        const rememberedBtnRef = rememberedBtn.current
        const rememberedBtnBGRef = rememberedBtnBG.current
        const countDownBarRef = countDownBar.current
        const editBtnRef = editBtn.current
        const btnAreaRef = btnArea.current

        if (words.length > 0 && flashcardRef) {
            setReviewedAt(new Date())

            // fill(CSSではanimation-fill-mode)はアニメーション後の状態を定義する
            // forwardsにすると終了時の状態が保持される
            const promiseArray = []
            if (forgotBtnBGRef && rememberedBtnBGRef && blindMode) {
                promiseArray.push(
                    animateElement(forgotBtnBGRef, [
                        { width: '200%' }, { width: '0' }
                    ], {
                        duration: userInterval,
                        fill: "forwards"
                    })
                )
                promiseArray.push(
                    animateElement(rememberedBtnBGRef, [
                        { width: '200%' }, { width: '0' }
                    ], {
                        duration: userInterval,
                        fill: "forwards"
                    })
                )
            }
            if (countDownBarRef && !blindMode) {
                promiseArray.push(
                    animateElement(countDownBarRef,[
                        { width: '100%' }, { width: '0' }
                    ],{
                        duration: userInterval,
                        fill: "forwards"
                    })
                )
            }

            Promise.all(promiseArray).then((results) => {
                let allFinished = true
                results.forEach(res => {
                    allFinished = (res.finish && allFinished && !!flashcard.current)
                    // flashcard.currentの存在を判定しないと、他のページに行ってもTrueになってしまう
                })

                if (allFinished) {
                    switchAnimation(
                        currentIndex,
                        setCurrentIndex,
                        words.length,
                        flashcardRef,
                        btnAreaRef,
                        forgotBtnRef,
                        rememberedBtnRef,
                        editBtnRef
                    )
                }
            })
            // アニメーションが終わったら次のwordへ
            // アニメーションの持続時間がuserInterval
            return () => {
                if (forgotBtnBGRef) {
                    forgotBtnBGRef.getAnimations().map(a => {
                        a.cancel()
                    })
                }
                if (rememberedBtnBGRef) {
                    rememberedBtnBGRef.getAnimations().map(a => {
                        a.cancel()
                    })
                }
                if (countDownBarRef) {
                    countDownBarRef.getAnimations().map(a => {
                        a.cancel()
                    })
                }
            }
        }

        // 理解を深めるために書いておく
        // useEffectはコンポーネントの一部に見えて、実はコンポーネントと切り離されて、バックグラウンドで実行されている
        // useEffectはコンポーネントの再レンダリングを監視している
        // 再レンダリングが終わると、依存配列の内容に変更があったかチェックする
        // 変更があればuseEffectの中身を再実行する
        // （ただし、クリーンアップ関数がある場合、再実行される前にまずクリーンアップ関数を実行する

    }, [currentIndex, setCurrentIndex, words.length, userInterval, switchAnimation, blindMode])


    const handleForgot = () => {
        if (forgotBtnBG.current) forgotBtnBG.current.getAnimations().map(a => a.cancel())
        if (rememberedBtnBG.current) rememberedBtnBG.current.getAnimations().map(a => a.cancel())

        if (flashcard.current && btnArea.current) {
            flipAnimator(
                flashcard.current,
                btnArea.current,
                setIsPaused
            ).then(res => {
                if (res.finish) {
                    if (reviewedAt) {
                        saveRecordToLocal({
                            id: createId(),
                            word_id: words[currentIndex].id,
                            is_correct: false,
                            reviewed_at: reviewedAt,
                            time: (new Date().getTime() - reviewedAt.getTime()) / 1000,
                            synced_at: undefined
                        }).catch(err => console.error(err))
                    }
                }
            })
        }
    }

    const handleForgotToNext = () => {
        switchAnimation(
            currentIndex,
            setCurrentIndex,
            words.length,
            flashcard.current,
            btnArea.current,
            forgotBtn.current,
            rememberedBtn.current,
            editBtn.current,
            setIsPaused
        )
    }

    const handleRemembered = () => {
        if (forgotBtnBG.current) forgotBtnBG.current.getAnimations().map(a => a.cancel())
        if (rememberedBtnBG.current) rememberedBtnBG.current.getAnimations().map(a => a.cancel())

        if (flashcard.current && btnArea.current) {
            flipAnimator(
                flashcard.current,
                btnArea.current,
                setIsPaused,
                setIsRemembered
            ).then(res => {
                if (res.finish) {
                    reviewedAt && setTime((new Date().getTime() - reviewedAt.getTime()) / 1000)
                }
            })
        }
    }

    const handleCorrect = () => {
        // setIsPaused(false)
        // setIsRemembered(false)

        if (reviewedAt) {
            saveRecordToLocal({
                id: createId(),
                word_id: words[currentIndex].id,
                is_correct: true,
                reviewed_at: reviewedAt,
                time: time,
                synced_at: undefined
            }).then(res => {
                if (res.isSuccess) {
                    switchAnimation(
                        currentIndex,
                        setCurrentIndex,
                        words.length,
                        flashcard.current,
                        btnArea.current,
                        forgotBtn.current,
                        rememberedBtn.current,
                        editBtn.current,
                        setIsPaused,
                        setIsRemembered
                    )
                }
            }).catch(err => {
                console.error(err)
            })
        }
    }

    const handleIncorrect = () => {
        // setIsPaused(false)
        // setIsRemembered(false)

        if (reviewedAt) {
            saveRecordToLocal({
                id: createId(),
                word_id: words[currentIndex].id,
                is_correct: false,
                reviewed_at: reviewedAt,
                time: time,
                synced_at: undefined
            }).then(res => {
                console.log(`finish: ${res.isSuccess}`)
                if (res.isSuccess) {
                    switchAnimation(
                        currentIndex,
                        setCurrentIndex,
                        words.length,
                        flashcard.current,
                        btnArea.current,
                        forgotBtn.current,
                        rememberedBtn.current,
                        editBtn.current,
                        setIsPaused,
                        setIsRemembered
                    )
                }
            }).catch(err => {
                console.error(err)
            })
        }
    }

    return (
        <div className={"flex flex-col items-center justify-center w-full h-full transition-all mt-20"}>
            {words.length > 0 && !!words[currentIndex] ?
                <>
                    <div className={cn("group flex flex-col items-center py-6 px-8 sm:px-12 w-fit max-w-[50rem] min-h-64 sm:min-h-[25rem] bg-background", blindMode && "preventTouch transition-all")}
                         ref={flashcard} id={"flashcard"}>
                        {/*発音記号*/}
                        <p className={"text-foreground/50 text-xs sm:text-sm lg:text-base text-center mb-2"}>
                            {words[currentIndex]?.phonetics || ""}
                        </p>
                        {/*単語*/}
                        <p className={"scroll-m-20 w-fit font-bold text-3xl sm:text-4xl lg:text-5xl text-center mb-3 sm:mb-5"}>
                            {words[currentIndex]?.word}
                        </p>
                        {/*品詞*/}
                        <Badge variant={"coloredSecondary"} className={"mb-3 sm:mb-5"}>
                            {words[currentIndex]?.partOfSpeech?.partOfSpeech && words[currentIndex]?.partOfSpeech?.partOfSpeech || ""}
                        </Badge>
                        {/*定義*/}
                        <p className={cn(blindMode && !isPaused ?
                            "text-transparent bg-foreground/10 active:text-foreground/50 hover:text-foreground/50 active:scale-105 hover:scale-105 active:bg-transparent hover:bg-transparent" :
                            "text-foreground/50",
                            "sm:text-lg lg:text-xl font-semibold text-center rounded-4 transition-all line-clamp-1 sm:line-clamp-2") }>
                            {words[currentIndex]?.definition}
                        </p>
                        {/*カウントダウン*/}
                        <div className={"relative w-full my-6"}>
                            <div ref={countDownBar}
                                 className={cn(
                                     "absolute left-0 top-0 w-full h-[1px]",
                                     blindMode ? "hidden" : "bg-foreground/30")} />
                            <Separator />
                        </div>
                        {/*例文*/}
                        <p className={"text-foreground/80 sm:text-xl lg:text-2xl text-center font-medium leading-tight mb-3"}>
                            {words[currentIndex]?.example}
                        </p>
                        {/*ノート*/}
                        <p className={cn(blindMode && !isPaused ?
                            "text-transparent bg-foreground/10 active:text-foreground/50 hover:text-foreground/50 active:scale-105 hover:scale-105 active:bg-transparent hover:bg-transparent" :
                            "text-foreground/50",
                            "text-sm sm:text-base text-center rounded-4 transition-all")}>
                            {words[currentIndex]?.notes || ""}
                        </p>
                    </div>

                    <div ref={btnArea} id={"btnArea"}>
                        <div className={cn("flex scale-90 sm:scale-100", (!blindMode || isPaused) && "hidden")}>
                            <Button ref={forgotBtn}
                                    className={`relative rounded-l-full p-0 text-destructive pr-6 pl-4 h-12 w-40 sm:w-48 diagonal-box-left justify-between ring-destructive hover:ring-destructive hover:text-destructive hover:bg-transparent active:text-destructive active:bg-destructive/10 overflow-hidden`}
                                    size={"lg"} variant={"coloredOutline"} onClick={handleForgot}>
                                <CircleX size={20}/>
                                {t("Index.forgot")}
                                <div ref={forgotBtnBG} className={"absolute left-0 top-0 h-12 w-full bg-destructive/15"}></div>
                            </Button>

                            <Button ref={rememberedBtn}
                                    className={"relative rounded-r-full p-0 text-green-600 pl-6 pr-4 h-12 w-40 sm:w-48 diagonal-box-right justify-between ring-green-600 hover:ring-green-600 hover:text-green-600 hover:bg-transparent active:ring-green-600 active:text-green-600 active:bg-green-600/10 overflow-hidden"}
                                    size={"lg"} variant={"coloredOutline"} onClick={handleRemembered}>
                                {t("Index.remembered")}
                                <CircleCheck size={20}/>
                                <div ref={rememberedBtnBG} className={"absolute left-[-100%] top-0 h-12 w-full bg-green-600/15"}></div>
                            </Button>
                        </div>

                        {isRemembered &&
                            <div className={"flex relative scale-90 sm:scale-100"}>
                                <Button
                                    className={`peer/forgot rounded-l-full bg-destructive hover:bg-destructive active:bg-destructive p-0 pr-6 pl-4 h-12 w-40 sm:w-48 diagonal-box-left justify-between overflow-hidden`}
                                    size={"lg"} onClick={handleIncorrect}>
                                    <CircleX size={20}/>
                                    {t("Index.i_was_wrong")}
                                </Button>

                                <Button
                                    className={"peer/remembered rounded-r-full bg-green-600 hover:bg-green-600 active:bg-green-600 p-0 pl-6 pr-4 h-12 w-40 sm:w-48 diagonal-box-right justify-between overflow-hidden"}
                                    size={"lg"} onClick={handleCorrect}>
                                    {t("Index.next")}
                                    <CircleCheck size={20}/>
                                </Button>

                                <div className={"absolute rounded-full left-0 top-0 w-40 sm:w-48 h-12 peer-hover/forgot:shadow-xl peer-hover/forgot:shadow-destructive/30 transition-shadow bg-transparent -z-10"}/>
                                <div className={"absolute rounded-full right-0 top-0 w-40 sm:w-48 h-12 peer-hover/remembered:shadow-xl peer-hover/remembered:shadow-green-600/30 transition-shadow bg-transparent -z-10"}/>
                            </div>
                        }

                        {isPaused && !isRemembered &&
                            <Button className={"h-12 min-w-36 rounded-full"}
                                    variant={"coloredOutline"}
                                    onClick={handleForgotToNext}>
                                {t("Index.next")}
                            </Button>
                        }

                        {!blindMode && !isSmallDevice &&
                            <EditWordBtn ref={editBtn} wordData={words[currentIndex]} />
                        }
                    </div>
                </> :
                <>
                    <p className={"text-3xl sm:text-4xl lg:text-5xl font-bold text-center my-2 lg:my-2.5 whitespace-pre-wrap leading-snug sm:leading-snug lg:leading-snug"}>
                        {t('Index.description')}
                    </p>
                    <AddWordBtn>
                        <Button className={cn("mt-4 z-30 rounded-full")} size={"lg"}>
                            {t("Index.createBtn")}
                        </Button>
                    </AddWordBtn>
                </>
            }
        </div>
    )
}


export function flipAnimator(
    containerRef: HTMLDivElement | HTMLElement | null,
    container2Ref: HTMLDivElement | HTMLElement | null,
    stateSetter1?: React.Dispatch<SetStateAction<boolean>> | null,
    stateSetter2?: React.Dispatch<SetStateAction<boolean>> | null,
    stateSetter3?: (value: boolean) => void,
    state?: boolean
) {
    return new Promise<{ finish: boolean }>((resolve, reject) => {
        if (containerRef && container2Ref) {
            Promise.all([
                animateElement(containerRef, [
                    { transform: 'rotateY(0deg) translateZ(100px)', offset: 0 },
                    { transform: 'rotateY(30deg) translateZ(100px)', offset: 0.4 },
                    { transform: 'rotateY(-90deg) translateZ(100px)', offset: 1 },
                ], {
                    duration: 300,
                    easing: 'ease-in',
                    fill: "forwards"
                }),
                animateElement(container2Ref, [
                    { opacity: '1.0', scale: '1.0' },
                    { opacity: '0', scale: '0.8' },
                ], {
                    duration: 200,
                    easing: 'ease-in',
                    fill: "forwards"
                })
            ]).then(results => {
                let allFinished = true
                results.forEach(res => allFinished = res && allFinished)

                if (allFinished) {
                    if (stateSetter1) stateSetter1(true)
                    if (stateSetter2) stateSetter2(true)
                    if (!!stateSetter3 && state !== undefined) stateSetter3(state)

                    Promise.all([
                        animateElement(containerRef, [
                            { transform: 'rotateY(90deg) translateZ(100px) translateX(50px)', offset: 0 },
                            { transform: 'rotateY(-15deg) translateZ(100px)', offset: 0.5 },
                            { transform: 'rotateY(10deg) translateZ(100px)', offset: 0.75 },
                            { transform: 'rotateY(0deg) translateZ(100px) translateX(0)', offset: 1 },
                        ], {
                            duration: 800,
                            easing: "ease-out",
                            fill: "forwards"
                        }),
                        animateElement(container2Ref, [
                            { opacity: '0', scale: '0.8', offset: 0 },
                            { opacity: '0.9', scale: '1.05', offset: 0.5 },
                            { opacity: '0.9', scale: '0.95', offset: 0.75 },
                            { opacity: '1.0', scale: '1.0', offset: 1 },
                        ], {
                            duration: 300,
                            easing: 'ease-out',
                            fill: "forwards"
                        })
                    ]).then(results2 => {
                        let allFinished = true
                        results2.forEach(res => allFinished = res && allFinished)

                        resolve({ finish: allFinished })
                    }).catch(() => {
                        reject({ finish: false })
                    })
                }
            })
        }
        else {
            reject({ finish: false })
        }
    })
}

function switchAnimator(
    currentIndex: number,
    setCurrentIndex: (num: number) => void,
    wordsLength: number,
    flashcardRef: HTMLDivElement | HTMLElement | null,
    btnAreaRef: HTMLDivElement | HTMLElement | null,
    forgotBtnRef: HTMLButtonElement | null,
    rememberedBtnRef: HTMLButtonElement | null,
    editBtnRef: HTMLButtonElement | null,
    setIsPaused?: React.Dispatch<SetStateAction<boolean>>,
    setIsRemembered?: React.Dispatch<SetStateAction<boolean>>,
) {

    if (forgotBtnRef) forgotBtnRef.disabled = true
    if (rememberedBtnRef) rememberedBtnRef.disabled = true
    if (editBtnRef) editBtnRef.disabled = true

    if (flashcardRef && btnAreaRef) {
        Promise.all([
            animateElement(flashcardRef, [
                { opacity: '100%', transform: 'translateX(0)' },
                { opacity: '0', transform: 'translateX(-200px)' }
            ], {
                duration: 300,
                easing: 'ease-in-out'
            }),
            animateElement(btnAreaRef, [
                { opacity: '1.0', scale: '1.0' },
                { opacity: '0', scale: '0.8' },
            ], {
                duration: 200,
                easing: 'ease-in',
                fill: "forwards"
            })
        ]).then(results => {
            let allFinished = true
            results.forEach(res => allFinished = res && allFinished)

            if (allFinished) {
                const nextIndex = (currentIndex + 1) % wordsLength;
                setCurrentIndex(nextIndex)
                if (setIsPaused) setIsPaused(false)
                if (setIsRemembered) setIsRemembered(false)

                if (flashcardRef && btnAreaRef) {
                    Promise.all([
                        animateElement(flashcardRef, [
                            { opacity: '0', transform: 'translateX(200px)' },
                            { opacity: '100%', transform: 'translateX(0)' }
                        ],{
                            duration: 300,
                            easing: 'ease-in-out'
                        }),
                        animateElement(btnAreaRef, [
                            { opacity: '0', scale: '0.8', offset: 0 },
                            { opacity: '0.9', scale: '1.05', offset: 0.5 },
                            { opacity: '0.9', scale: '0.95', offset: 0.75 },
                            { opacity: '1.0', scale: '1.0', offset: 1 },
                        ], {
                            duration: 300,
                            easing: 'ease-out',
                            fill: "forwards"
                        })
                    ]).then((results2) => {
                        let allFinished = true
                        results2.forEach(res => allFinished = res && allFinished)

                        if (allFinished) {
                            if (forgotBtnRef) forgotBtnRef.disabled = false
                            if (rememberedBtnRef) rememberedBtnRef.disabled = false
                            if (editBtnRef) editBtnRef.disabled = false
                        }
                    })
                }
            }
        })
    }
}