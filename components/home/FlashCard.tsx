import React, { useEffect, useState } from "react";
import { cn } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useTranslations } from "next-intl";
import EditWordBtn from "@/components/home/EditBtn";
import { Button } from "@/components/ui/button";
import AddWordBtn from "@/components/home/AddBtn";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Separator } from "@/components/ui/separator";

export default function FlashCard() {

    console.log("FlashCardがレンダリングされたようだ")

    const t = useTranslations('Index')

    const words = useWordbookStore((state) => state.words)
    const blindMode = useWordbookStore((state) => state.blindMode)
    const currentIndex = useWordbookStore((state) => state.currentIndex)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)
    const userInterval = useWordbookStore((state) => state.userInterval)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)


    const isSmallDevice = useMediaQuery('(max-width:640px)')


    useEffect(() => {
        console.log("Flashcardの初期化用useEffectが実行されたようだ")

        const localInterval = localStorage.getItem("interval")
        if (localInterval){
            setUserInterval(Math.max(parseInt(localInterval), 500))
        }else {
            localStorage.setItem("interval", "2000")
            setUserInterval(2000)
        }
    },[setUserInterval])

    useEffect(() => {
        if (words.length > 0) {
            const timer = setTimeout(() => {
                const nextIndex = (currentIndex + 1) % words.length;
                setCurrentIndex(nextIndex)
            }, userInterval)

            return () => clearInterval(timer)
        }

        // 理解を深めるために書いておく
        // useEffectはコンポーネントの一部に見えて、実はコンポーネントと切り離されて、バックグラウンドで実行されている
        // useEffectはコンポーネントの再レンダリングを監視している
        // 再レンダリングが終わると、依存配列の内容に変更があったかチェックする
        // 変更があればuseEffectの中身を再実行する
        // （ただし、クリーンアップ関数がある場合、再実行される前にまずクリーンアップ関数を実行する

    }, [currentIndex, setCurrentIndex, userInterval, words.length])


    if (isSmallDevice) {
        return (
            <div
                className={"fixed top-[45%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center w-full px-4"}>
                {words.length > 0 && !!words[currentIndex] ?
                    <>
                        <div className={cn("group flex flex-col p-5 w-full", blindMode && "select-none preventTouch active:scale-105 transition-all")}>
                            <div className={"flex flex-col items-center min-h-[20rem]"}>
                                <p className={"text-foreground/50 text-md text-center mb-2"}>{words[currentIndex]?.phonetics || ""}</p>
                                <p className={"scroll-m-20 w-fit text-3xl font-bold text-center mb-5"}>{words[currentIndex]?.word}</p>
                                <Badge variant={"coloredSecondary"}
                                       className={"mb-5"}>{words[currentIndex]?.partOfSpeech?.partOfSpeech && words[currentIndex]?.partOfSpeech?.partOfSpeech || ""}</Badge>
                                <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-active:text-foreground/50 text-lg group-active:bg-transparent" : "text-foreground/50 text-lg font-bold", "text-center rounded-4 transition-all select-none")}>{words[currentIndex]?.definition}</p>

                                <Separator className={"my-6"}/>

                                <p className={"text-foreground/80 text-xl text-center font-medium leading-normal mb-4"}>{words[currentIndex]?.example}</p>
                                <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-active:text-foreground/50 text-xs group-active:bg-transparent" : "text-foreground/50 text-xs", "h-6 text-center rounded-4 transition-all select-none leading-relaxed")}>{words[currentIndex]?.notes || ""}</p>
                            </div>
                        </div>
                    </> :
                    <>
                        {t('description').split('\n').map((line, index) => (
                            <h1 className={"text-3xl font-bold text-center leading-normal my-1"}
                                key={index}>
                                {line}
                            </h1>
                        ))}
                        <AddWordBtn>
                            <Button className={cn("mt-4 z-30 rounded-full")} size={"lg"}>
                                {t("createBtn")}
                            </Button>
                        </AddWordBtn>
                    </>
                }
            </div>
        )
    }


    return (
        <div className={"fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex flex-col items-center w-full max-w-[64rem] px-14 transition-all"}>
            {words.length > 0 && !!words[currentIndex] ?
                <>
                    <div className={cn("group flex flex-col items-center p-5 w-full mb-2", blindMode && "preventTouch active:scale-110 transition-all")}>
                        <div className={"flex flex-col w-fit items-center min-h-[20rem]"}>
                            <p className={"text-foreground/50 text-md text-center mb-2"}>{words[currentIndex]?.phonetics || ""}</p>
                            <p className={"scroll-m-20 w-fit font-bold sm:text-5xl text-center mb-5"}>{words[currentIndex]?.word}</p>
                            <Badge variant={"coloredSecondary"}
                                   className={"mb-5"}>{words[currentIndex]?.partOfSpeech?.partOfSpeech && words[currentIndex]?.partOfSpeech?.partOfSpeech || ""}</Badge>
                            <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-active:text-foreground/50 group-hover:text-foreground/50 text-lg group-active:scale-[115%] group-hover:scale-[115%] group-active:bg-transparent group-hover:bg-transparent" : "text-foreground/50 text-xl font-bold", "text-center rounded-4 transition-all")}>{words[currentIndex]?.definition}</p>

                            <Separator className={"my-6"}/>

                            <p className={"text-foreground/80 text-xl lg:text-2xl text-center font-medium leading-tight mb-3"}>{words[currentIndex]?.example}</p>
                            <p className={cn(blindMode ? "text-transparent bg-foreground/10 group-active:text-foreground/50 group-hover:text-foreground/50 text-sm group-active:scale-[115%] group-hover:scale-[115%] group-active:bg-transparent group-hover:bg-transparent" : "text-foreground/50 text-base", "text-center rounded-4 transition-all")}>{words[currentIndex]?.notes || ""}</p>
                        </div>
                    </div>

                    {/*{testStart &&*/}
                    {/*    <div className={"flex gap-8 mb-8"}>*/}
                    {/*        <Button*/}
                    {/*            className={"rounded-full p-0 text-destructive size-14 ring-destructive hover:ring-destructive hover:bg-destructive/10 hover:text-destructive active:text-destructive active:bg-destructive/10"}*/}
                    {/*            size={"lg"} variant={"coloredOutline"}>*/}
                    {/*            <X size={28}/>*/}
                    {/*        </Button>*/}
                    {/*        <Button*/}
                    {/*            className={"rounded-full p-0 text-foreground/60 size-14 ring-foreground/60 hover:ring-foreground hover:text-foreground hover:bg-foreground/5 active:text-foreground active:bg-foreground/5"}*/}
                    {/*            size={"lg"} variant={"coloredOutline"}>*/}
                    {/*            <Triangle className={"pb-0.5"} size={24}/>*/}
                    {/*        </Button>*/}
                    {/*        <Button*/}
                    {/*            className={"rounded-full p-0 text-green-600 text-3xl size-14 ring-green-600 hover:ring-green-600 hover:text-green-600 hover:bg-green-600/10 active:ring-green-600 active:text-green-600 active:bg-green-600/10"}*/}
                    {/*            size={"lg"} variant={"coloredOutline"}>*/}
                    {/*            <CircleCheckBig/>*/}
                    {/*        </Button>*/}
                    {/*    </div>*/}
                    {/*}*/}

                    {/*{blindMode ?*/}
                    {/*    <Button variant={"coloredOutline"} onClick={() => setTestStart(prev => !prev)}>*/}
                    {/*        {"Start Test"}*/}
                    {/*    </Button> :*/}
                    {/*    <EditWordBtn wordData={words[currentIndex]}/>*/}
                    {/*}*/}

                    <EditWordBtn wordData={words[currentIndex]}/>

                </> :
                <>
                    {t('description').split('\n').map((line, index) => (
                        <h1 className={"text-4xl lg:text-5xl font-bold text-center leading-normal my-2 lg:my-2.5"}
                            key={index}>
                            {line}
                        </h1>
                    ))}
                    <AddWordBtn>
                        <Button className={cn("mt-4 z-30 rounded-full")} size={"lg"}>
                            {t("createBtn")}
                        </Button>
                    </AddWordBtn>
                </>
            }
        </div>
    )
}