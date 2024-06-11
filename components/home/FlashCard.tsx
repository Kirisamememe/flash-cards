import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { animateElement, disappearAnimation } from "@/app/lib/utils";
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

    const onAnimationEnd = useCallback(() => {
        const nextIndex = (currentIndex + 1) % words.length;
        setCurrentIndex(nextIndex)
    },[currentIndex, setCurrentIndex, words.length])

    useEffect(() => {
        console.log("(1) ＊＊＊＊＊FlashCardのuseEffectが実行された＊＊＊＊")

        const flashcardRef = flashcard.current
        const forgotBtnRef = forgotBtn.current
        const forgotBtnBGRef = forgotBtnBG.current
        const rememberedBtnRef = rememberedBtn.current
        const rememberedBtnBGRef = rememberedBtnBG.current
        const countDownBarRef = countDownBar.current
        const editBtnRef = editBtn.current

        if (words.length > 0 && flashcardRef) {
            // wordが存在する場合はアニメーションを実行

            animateElement(flashcardRef, [
                { opacity: '0', transform: 'translateX(20%)' },
                { opacity: '100%', transform: 'translateX(0)' }
            ],{
                duration: 300,
                easing: 'ease-in-out'
            }).then((res) => {
                if (res.finish) {
                    setReviewedAt(new Date())
                }
            })

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

            if (forgotBtnRef) forgotBtnRef.disabled = false
            if (rememberedBtnRef) rememberedBtnRef.disabled = false
            if (editBtnRef) editBtnRef.disabled = false

            Promise.all(promiseArray).then((results) => {
                let allFinished = true
                results.forEach(res => {
                    // console.log("res.finish: ")
                    // console.log(res.finish)
                    allFinished = (res.finish && allFinished && !!flashcard.current)
                    // flashcard.currentの存在を判定しないと、他のページに行ってもTrueになってしまう
                })
                // console.log(`allFinished: ${allFinished}`)

                if (allFinished) {
                    disappearAnimation(flashcardRef, forgotBtnRef, rememberedBtnRef, editBtnRef)
                        .then(res => {
                            if (res.finish) onAnimationEnd()
                        })
                }
            })
            // アニメーションが終わったら次のwordへ
            // アニメーションの持続時間がuserInterval
            return () => {
                if (forgotBtnBGRef) {
                    forgotBtnBGRef.getAnimations().map(a => {
                        a.cancel()
                        // console.log("(2) forgotBtnBGRefのアニメーションをキャンセルしようとしたぞ")
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

    }, [currentIndex, setCurrentIndex, words.length, userInterval, blindMode, onAnimationEnd])


    const handleForgot = () => {
        // console.log("Forgotがクリックされました")
        if (forgotBtnBG.current) forgotBtnBG.current.getAnimations().map(a => a.cancel())
        if (rememberedBtnBG.current) rememberedBtnBG.current.getAnimations().map(a => a.cancel())

        setIsPaused(true)

        if (reviewedAt) {
            saveRecordToLocal({
                id: createId(),
                word_id: words[currentIndex].id,
                is_correct: false,
                reviewed_at: reviewedAt,
                time: (new Date().getTime() - reviewedAt.getTime()) / 1000,
                synced_at: undefined
            }).then(res => {
                if (res.isSuccess) {
                    // console.log(res.data)
                }
            })
        }
    }

    const handleForgotToNext = () => {
        setIsPaused(false)
        disappearAnimation(flashcard.current, forgotBtn.current, rememberedBtn.current, editBtn.current)
            .then(res => {
                if (res.finish) onAnimationEnd()
            })
    }

    const handleRemembered = () => {
        // console.log("Rememberedがクリックされました")
        if (forgotBtnBG.current) forgotBtnBG.current.getAnimations().map(a => a.cancel())
        if (rememberedBtnBG.current) rememberedBtnBG.current.getAnimations().map(a => a.cancel())

        setIsPaused(true)
        setIsRemembered(true)

        reviewedAt && setTime((new Date().getTime() - reviewedAt.getTime()) / 1000)
    }

    const handleCorrect = () => {
        setIsPaused(false)
        setIsRemembered(false)

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
                    disappearAnimation(flashcard.current, forgotBtn.current, rememberedBtn.current, editBtn.current)
                        .then(res => {
                            if (res.finish) onAnimationEnd()
                        })
                }
            }).catch(err => {
                console.error(err)
            })
        }
    }

    const handleIncorrect = () => {
        setIsPaused(false)
        setIsRemembered(false)

        if (reviewedAt) {
            saveRecordToLocal({
                id: createId(),
                word_id: words[currentIndex].id,
                is_correct: false,
                reviewed_at: reviewedAt,
                time: time,
                synced_at: undefined
            }).then(res => {
                if (res.isSuccess) {
                    disappearAnimation(flashcard.current, forgotBtn.current, rememberedBtn.current, editBtn.current)
                        .then(res => {
                            if (res.finish) onAnimationEnd()
                        })
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
                    <div className={cn("group flex flex-col items-center py-6 px-8 sm:px-12 w-fit max-w-[50rem] min-h-64 sm:min-h-[25rem]", blindMode && "preventTouch transition-all")}
                         ref={flashcard}>
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
                                     !blindMode && "bg-foreground/10")} />
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
                </> :
                <>
                    {t('Index.description').split('\n').map((line, index) => (
                        <h1 className={"text-4xl lg:text-5xl font-bold text-center leading-normal my-2 lg:my-2.5"}
                            key={index}>
                            {line}
                        </h1>
                    ))}
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