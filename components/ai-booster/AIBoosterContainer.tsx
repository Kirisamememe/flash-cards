'use client'

import { Carousel, CarouselContent, CarouselItem, type CarouselApi, } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogTrigger, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { X, Languages, MessageSquareCode, Volume2, Copy, Bookmark, BookmarkCheck } from 'lucide-react';
import useMediaQuery from "@mui/material/useMediaQuery";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { animateElement, cn } from "@/app/lib/utils";
import ReactDOM from "react-dom";
import { EmblaCarouselType } from "embla-carousel";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import {
    ModelList,
    MaterialIndexDB,
    modelListTuple,
    onlyProUserModelListTuple,
    prompts,
    selectWords,
    tabValues,
    Material
} from "@/types/AIBooster";
import { generateMaterial } from "@/app/lib/GenerativeAI";
import { readStreamableValue } from "ai/rsc";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { getMaterialsFromLocal, getPromptWords } from "@/app/lib/indexDB/getFromLocal";
import { saveMaterialToLocal } from "@/app/lib/indexDB/saveToLocal";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/ui/loading";


function MobileNav({ api }: { api: EmblaCarouselType | undefined }) {
    const header = document.getElementById("header")

    if (!header) return null
    if (!api) return null

    return ReactDOM.createPortal(
        <div className={"lg:px-48 flex items-center justify-center border-t-[0.03125rem] border-foreground/15"}>
            <div
                className={"pl-5 sm:pl-7 lg:pl-0 lg:min-w-[46rem] flex gap-4 sm:gap-8 2xl:gap-12 items-center 2xl:justify-center w-full h-14"}>
                {tabValues.map((val, index) => (
                    <button key={val.title} className={"group relative flex items-center h-full"}
                            onClick={() => api?.scrollTo(index)}>
                        <h2 className={cn("text-muted-foreground font-medium transition-all leading-[0] pt-1 sm:pt-0 duration-200 group-hover:text-foreground group-hover:scale-105", api.selectedScrollSnap() === index && "text-xl sm:text-base text-foreground font-bold pt-0 leading-[0]",)}>
                            {/*leading-[0]は現時点（2024.06.25）でのSafari対策です。*/}
                            {val.title}
                        </h2>
                        <div
                            className={cn("transition-all duration-200", api.selectedScrollSnap() === index ? "absolute h-0.5 w-full bg-primary bottom-0 -z-10" : "bg-transparent")}/>
                    </button>
                ))}
            </div>
        </div>,
        header
    )
}

function PromptPopover() {
    const container = document.getElementById("animation-container")
    if (!container) return

    return ReactDOM.createPortal(
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}
                        className={"flex bottom-24 right-[calc(3%+(8.8125%-28px))] p-3 size-14 rounded-full fixed bg-primary backdrop-blur-xl shadow-primary/30 shadow-lg z-20 text-primary-foreground"}>
                    <MessageSquareCode/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"p-0 w-[calc(100vw-2rem)] rounded-xl"}>
                <SendPrompt/>
            </DialogContent>
        </Dialog>,
        container
    )
}

export default function AIBoosterContainer() {

    const [api, setApi] = useState<CarouselApi>()
    const [_, setTabValue] = useState(false)

    const setCarouselIndex = useWordbookStore((state) => state.setCarouselIndex)
    const setHideHeader = useWordbookStore((state) => state.setHideHeader)

    useEffect(() => {
        if (!api) return

        api.on("select", () => {
            setTabValue(prev => !prev)
            setHideHeader(false)
            setCarouselIndex(api.selectedScrollSnap())
        })
    }, [api, setCarouselIndex, setHideHeader])


    const handleDrag = (_: EmblaCarouselType, event: MouseEvent | TouchEvent) => {
        return !(event instanceof MouseEvent) // macOSのSafariではTouchEventは存在しない。
    }

    return (
        <motion.div
            id={"animation-container"}
            className={"w-screen h-dvh"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.2 }}
        >
            <MobileNav api={api}/>

            <Carousel opts={{ align: "center", duration: 20, watchDrag: handleDrag }} orientation="horizontal"
                      setApi={setApi} className={"f"}>
                <CarouselContent className={"relative ml-0 h-dvh"}>
                    {/*ジェネレート*/}
                    <CarouselItem id={"carousel-0"}
                                  className={"flex h-dvh justify-center pl-0 pr-0 sm:pl-2 sm:pr-3 overflow-scroll"}>
                        <Generate/>
                    </CarouselItem>

                    {/*生成履歴*/}
                    <CarouselItem id={"carousel-1"}
                                  className={"flex h-dvh justify-center pl-0 pr-0 sm:pl-2 sm:pr-6 overflow-scroll"}>
                        <History/>
                    </CarouselItem>

                    {/*お気に入り*/}
                    <CarouselItem id={"carousel-2"}
                                  className={"flex h-dvh justify-center pl-0 pr-0 sm:pl-2 sm:pr-6 overflow-scroll"}>
                        {/*<History />*/}
                        <MyBookmark/>
                    </CarouselItem>
                </CarouselContent>
            </Carousel>

        </motion.div>
    )
}

type TextPopoverProps = {
    selection: string
    popoverPosition: { top: number, left: number }
    setPopoverOpen: React.Dispatch<SetStateAction<boolean>>
    popoverRef: HTMLDivElement | null
    closePopover: (popoverRef: HTMLDivElement | null, setPopoverOpen: React.Dispatch<SetStateAction<boolean>>) => void
}
const TextPopover = React.forwardRef<HTMLDivElement, TextPopoverProps>(
    ({ selection, popoverPosition, closePopover, setPopoverOpen, popoverRef,  ...props
}, ref) => {
        const innerRef = useRef<HTMLDivElement | null>();

        const handleClose = () => {
            if (innerRef.current) {
                closePopover(innerRef.current, setPopoverOpen)
            }
        }

    return ReactDOM.createPortal(
        <div
            ref={(node) => {
                innerRef.current = node
                if (typeof ref === 'function') { // 別に親から関数型で渡してるわけではないが、今後のために残しとく
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
            }}
            className={cn("popover rounded-lg fixed p-4 flex flex-col min-h-40 w-72 z-50 bg-muted/80 backdrop-blur-lg border-none ring-1 ring-foreground/20 shadow-2xl shadow-foreground/50 dark:shadow-none transition-all")}
            style={{
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`
            }} {...props}>
            <Button className={"absolute right-3 top-3 p-0 size-7"} variant={"ghost"}
                    onClick={handleClose}>
                <X size={20}/>
            </Button>
            <p>{selection}</p>
        </div>,
        document.body
    )})
TextPopover.displayName = "TextPopover"

function closePopover(
    popoverRef: HTMLDivElement | null,
    setPopoverOpen: React.Dispatch<SetStateAction<boolean>>
) {
    if (!popoverRef) return

    animateElement(popoverRef, [
        {
            transform: 'scale(1) translateY(0)',
            opacity: 1
        },
        {
            transform: 'scale(1.03) translateY(-2px)',
            opacity: 1,
            offset: 0.2
        },
        {
            transform: 'scale(0.9) translateY(3px)',
            opacity: 0.9,
            offset: 0.4
        },
        {
            transform: 'scale(1.1) translateY(-5px)',
            opacity: 0.7,
            offset: 0.6
        },
        {
            transform: 'scale(0.5) translateY(20px)',
            opacity: 0
        }
    ], {
        duration: 300, // アニメーションの総時間（ミリ秒）
        easing: 'ease-in-out', // イージング関数
        fill: 'forwards' // アニメーション終了後の状態を維持
    }).then((res) => {
        if (res.finish) setPopoverOpen(false)
    })
}

function MaterialContainer({ material }: { material: Material }) {

    const selection = useRef("")
    const popover = useRef<HTMLDivElement>(null)
    const container = useRef<HTMLDivElement>(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })

    const isValidSelection = (text: string) => {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);

        // 改行、句読点などをチェック
        const invalidChars = /[\n\r,.!?;:"]/;

        return words.length >= 1 && words.length <= 4 && !invalidChars.test(text);
    }

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
        const viewportWidth = window.visualViewport?.width
        const viewportHeight = window.visualViewport?.height
        if (!viewportWidth || !viewportHeight) return
        if (!e.currentTarget.textContent) return

        if (e.currentTarget.textContent === selection.current) {
            closePopover(popover.current, setPopoverOpen)
        }

        const rect = e.currentTarget.getBoundingClientRect()
        const left = rect.left
        const top = rect.top

        selection.current = e.currentTarget.textContent
        setPopoverOpen(true)
        setPopoverPosition({
            top: Math.max(top - 164, 24),
            left: Math.min(Math.max((left - 144 + rect.width / 2), 12), viewportWidth - 300),
        })
    }

    useEffect(() => {
        const handleSelection = (e: MouseEvent | TouchEvent) => {
            const viewportWidth = window.visualViewport?.width
            const viewportHeight = window.visualViewport?.height
            if (!viewportWidth || !viewportHeight) return
            if (popoverOpen || !container.current) return
            if (!container.current.contains(e.target as Node)) return

            const selectedText = window.getSelection()?.toString()
            if (selectedText && isValidSelection(selectedText) && selectedText !== selection.current) { // selectedText !== selection.currentを追加しないと、選択された文字をクリックするとpopoverが消えてからまたポップしてしまう
                const range = window.getSelection()?.getRangeAt(0)
                if (!range) return

                const rect = range.getBoundingClientRect()
                selection.current = selectedText
                setPopoverOpen(true)

                setPopoverPosition({
                    top: (e instanceof MouseEvent) ? Math.max(rect.top - 164, 24) : Math.min(rect.top + 30, viewportHeight - 200),
                    left: Math.min(Math.max((rect.left - 144 + rect.width / 2), 12), viewportWidth - 300),
                })
            } else {
                selection.current = ""
            }
        }

        const handlePointerDown = (e: PointerEvent) => {
            // ポップオーバーが開いていて、クリックされた要素がポップオーバー外の場合
            if (!e.target) return
            if (popover.current && popover.current.contains(e.target as Node)) return
            if (e.target instanceof HTMLSpanElement) return

            if (popoverOpen) {
                closePopover(popover.current, setPopoverOpen)
                // setPopoverOpen(false)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('mouseup', handleSelection)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('mouseup', handleSelection)
        }
    }, [popoverOpen])

    return (
        <div ref={container} className={"pb-16 sm:pb-6 flex flex-col gap-7"}>
            {popoverOpen && <TextPopover ref={popover} selection={selection.current} popoverPosition={popoverPosition} setPopoverOpen={setPopoverOpen} closePopover={closePopover} popoverRef={popover.current}/>}
            <div className={"flex flex-col gap-4 px-5"}>
                <h4 className={"text-2xl lg:text-3xl font-bold line-clamp-2 lg:leading-snug"}>
                    {material?.title ? material.title :
                        <Loading/>
                    }
                </h4>
                <div className={"flex gap-3"}>
                    <Button variant={"coloredOutline"} className={"p-0 size-8 align-middle"}>
                        <Volume2 size={24}/>
                    </Button>
                    <Button variant={"coloredOutline"} className={"p-0 size-8 align-middle"}>
                        <Bookmark size={24}/>
                    </Button>
                </div>
            </div>
            {material.content.length ? material.content.map((p, index) => (
                <p key={index}
                   className={"text-lg leading-[200%] font-light tracking-[0.05rem] px-5 rounded-lg align-middle"}>
                    {p.split(/\b|\s/).map((token, index) => {
                        if (/^\w+$/.test(token)) { // 単語のみにマッチする
                            return (
                                <React.Fragment key={`${index}_${token}`}>
                                    <span onClick={handleClick}
                                        className={"inline-block hover:bg-foreground/10 active:bg-foreground/10 rounded py-0 transition-all hover:scale-105 active:scale-95"}>
                                        {token}
                                    </span>
                                </React.Fragment>
                            )
                        } else if (/[,.!?]/.test(token)) {
                            return token + " "
                        } else {
                            return token
                        }
                    })}
                    <Button variant={"ghost"} className={"p-0 size-8 align-middle ml-4 mb-1 text-muted-foreground"}>
                        <Languages size={22}/>
                    </Button>
                    <Button variant={"ghost"} className={"p-0 size-8 align-middle ml-2 mb-1 text-muted-foreground"}>
                        <Volume2 size={22}/>
                    </Button>
                    <Button variant={"ghost"} className={"p-0 size-8 align-middle ml-2 mb-1 text-muted-foreground"}>
                        <Bookmark size={22}/>
                    </Button>
                </p>
            )) : <Loading/>}
            <Separator className={"my-8"}/>
        </div>
    )
}

function Generate() {
    const generatedMaterial = useWordbookStore((state) => state.generatedMaterial)
    const isSmallDevice = useMediaQuery('(max-width:640px)')

    return (
        <div
            className={"mt-40 lg:mt-48 w-full h-fit flex gap-4 lg:gap-8 xl:gap-14 lg:px-[10.125rem] justify-center items-start max-w-[95rem]"}>
            <div className={"flex-grow min-h-[calc(100vh-20rem)] lg:min-w-[26.75rem]"}>
                <MaterialContainer material={generatedMaterial}/>
            </div>
            {isSmallDevice ? <PromptPopover/> : <SendPrompt/>}
        </div>
    )
}

function SendPrompt() {

    const [currentPrompt, setCurrentPrompt] = useState<string>("-1")
    const [currentWordValue, setCurrentWordValue] = useState<string>("-1")
    const [promptWords, setPromptWords] = useState<string[]>([])
    const [requestPrompt, setRequestPrompt] = useState("")

    const [promptSelectOpen, setPromptSelectOpen] = useState(false)
    const [wordsSelectOpen, setWordsSelectOpen] = useState(false)

    const AIModel = useWordbookStore((state) => state.AIModel)
    const setAIModel = useWordbookStore((state) => state.setAIModel)
    const setGeneratedMaterial = useWordbookStore((state) => state.setGeneratedMaterial)


    const { data: session } = useSession()
    const { toast } = useToast()

    const userId = session?.user?.id
    const role = session?.user?.role
    if (!userId || !role) return

    const handleSend = async () => {
        if (!requestPrompt) {
            // ダイアログ
            return
        }

        const { data } = await generateMaterial(requestPrompt, AIModel)

        try {
            const material: Material = {
                title: "",
                content: [],
                author: userId
            }

            for await (const delta of readStreamableValue(data)) {
                if (delta?.done) {
                    console.log("＆＆＆＆＆＆　マテリアルを保存する　＆＆＆＆＆＆＆")
                    saveMaterialToLocal(material).then()
                    break
                }

                material.title = delta.title
                material.content = delta?.content

                setGeneratedMaterial({ ...material }) // オブジェクトの状態を更新する時、新しくオブジェクトを作成する必要がある模様
                // console.log(delta)
            }
        } catch (error) {
            console.error(error)
            const errorMessage = error as { error: string }

            toast({
                title: ("generative_error"),
                description: errorMessage.error,
                variant: "destructive"
            })
        }
    }

    const handlePromptWords = async (value: string) => {
        setCurrentWordValue(value);

        const words: string[] = []

        switch (value) {
            case "0":
                await getPromptWords("random")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
            case "1":
                await getPromptWords("recent")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
            case "2":
                await getPromptWords("mostForgettable")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
        }

        setPromptWords(words)
        setRequestPrompt(prev => prev.split("\n")[0] + "\n" + words.join(", "))
    }

    const handlePromptChange = (value: string) => {
        setCurrentPrompt(value)
        const prompt = requestPrompt.split("\n")

        setRequestPrompt(prompts[Number(value)].prompt + (prompt.length > 1 ? ("\n" + prompt[1]) : ""))
    }

    return (
        <div className={cn(
            "sticky top-28 flex flex-col gap-6 p-4 sm:p-3 sm:pt-1 overflow-auto overflow-x-visible max-h-[calc(100vh-7rem)] h-fit sm:basis-[17rem] lg:basis-80 2xl:basis-[22.5rem] shrink-0 lg:max-w-[40rem] transition-all duration-200"
        )}>
            <h4 className={"text-xl text-foreground font-bold ml-1 my-1"}>{"Input Your Prompts"}</h4>

            <div className={"space-y-3"}>
                <label
                    className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                    <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                    {"Models"}
                </label>
                <Select value={AIModel} onValueChange={(value) => setAIModel(value as ModelList)}>
                    <SelectTrigger
                        className={"h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg lg:text-base [&>span]:line-clamp-none text-start"}>
                        <SelectValue placeholder={"Select a model"}/>
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {modelListTuple.map((model, index) => {
                            const disable = onlyProUserModelListTuple.includes(model as any) && role !== "ADMIN"

                            if (disable) {
                                return (
                                    <TooltipProvider key={`${index}_${model}`}>
                                        <Tooltip>
                                            <TooltipTrigger className={"block w-full"}>
                                                <SelectItem value={"null"}
                                                            disabled={disable}
                                                            className={"py-3 lg:text-base"}>
                                                    {model}
                                                </SelectItem>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{"For paid users only."}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            }
                            return (
                                <SelectItem value={model} key={`${index}_${model}`}
                                            className={"py-3 lg:text-base"}>
                                    {model}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className={"space-y-3"}>
                <label
                    className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                    <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                    {"Quick Prompt"}
                </label>
                <Select defaultValue={"-1"} open={promptSelectOpen} onOpenChange={setPromptSelectOpen}
                        value={currentPrompt} onValueChange={handlePromptChange}>
                    <SelectTrigger
                        onPointerDown={(e) => {
                            e.preventDefault()
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setPromptSelectOpen(p => !p)
                        }}
                        className={"h-auto min-h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg lg:text-base [&>span]:line-clamp-none text-start"}>
                        {currentPrompt === "-1" ? <p>{"Select a Prompt"}</p> :
                            <SelectValue placeholder={"Select a Prompt"}/>}
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {prompts.map((prompt, index) => (
                            <SelectItem value={index.toString()} key={`${index}_${prompt}`}
                                        className={"py-3 lg:text-base max-w-[calc(100vw-2rem)] sm:max-w-[37.5rem]"}>
                                {prompt.description}
                            </SelectItem>
                        ))}

                        {currentPrompt !== "-1" &&
                            <>
                                <SelectSeparator/>
                                <Button variant={"ghost"}
                                        className={"w-full justify-start lg:text-base font-normal gap-2 pl-2 h-12"}
                                        animation={false}
                                        onClick={() => {
                                            setCurrentPrompt("-1")
                                            const promptArr = requestPrompt.split("\n")
                                            const prompt = promptArr.length > 1 ? promptArr[1] : ""
                                            setRequestPrompt("\n" + prompt)
                                            setPromptSelectOpen(false)
                                        }}>
                                    <X size={20}/>
                                    {"選択をクリアする"}
                                </Button>
                            </>
                        }
                    </SelectContent>
                </Select>

                <Select defaultValue={"-1"} open={wordsSelectOpen} onOpenChange={setWordsSelectOpen}
                        value={currentWordValue} onValueChange={handlePromptWords}>
                    <SelectTrigger
                        onPointerDown={(e) => {
                            e.preventDefault()
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setWordsSelectOpen(p => !p)
                        }}
                        className={"h-auto min-h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg bg-transparent lg:text-base [&>span]:line-clamp-none text-start"}>
                        {currentWordValue === "-1" ? <p>{"Select words"}</p> :
                            <SelectValue asChild placeholder="Select words"
                                         className={"text-sm text-muted-foreground font-semibold"}>
                                <div className={""}>
                                    {promptWords.length ? promptWords.map((word, index) => (
                                        <Badge key={`${index}_${word}`} variant={"coloredSecondary"}
                                               className={"mr-1 sm:mr-1.5 my-0.5 sm:my-[0.1875rem] px-1 py-1 sm:px-1.5 sm:py-1 rounded font-medium text-[0.625rem] sm:text-xs leading-[100%] sm:leading-[100%]"}>{word}</Badge>
                                    )) : <p>{"単語を取得できませんでした"}</p>}
                                </div>
                            </SelectValue>}
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {selectWords.map((val, index) => (
                            <SelectItem value={index.toString()} key={`${index}_${val.value}`}
                                        className={"py-3 lg:text-base max-w-[calc(100vw-2rem)] sm:max-w-[37.5rem]"}>
                                {val.description}
                            </SelectItem>
                        ))}
                        {currentWordValue !== "-1" &&
                            <>
                                <SelectSeparator/>
                                <Button variant={"ghost"}
                                        className={"w-full justify-start lg:text-base font-normal gap-2 pl-2 h-12"}
                                        animation={false}
                                        onClick={() => {
                                            setCurrentWordValue("-1")
                                            const promptArr = requestPrompt.split("\n")
                                            const prompt = promptArr.length > 0 ? promptArr[0] : ""
                                            setRequestPrompt(prompt)
                                            setWordsSelectOpen(false)
                                        }}>
                                    <X size={20}/>
                                    {"選択をクリアする"}
                                </Button>
                            </>
                        }
                    </SelectContent>
                </Select>
            </div>

            <div className={"space-y-3"}>
                <label
                    className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                    <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                    {"Prompt"}
                </label>
                <Textarea
                    placeholder={"Use \"Quick Prompt\" or input prompt manually. The maximum token limit is 1000, please do not send prompts exceed it."}
                    value={requestPrompt}
                    onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => event.stopPropagation()}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestPrompt(e.currentTarget.value)}
                    rows={6}
                    className={"resize-none px-4 2xl:px-5 py-3 text-base tracking-wide leading-[175%]"}/>
            </div>

            <Button className={"px-6 rounded-lg shrink-0 sticky bottom-3 mt-3"} onClick={handleSend}>
                <span className={""}>{"Generate"}</span>
            </Button>
        </div>
    )
}

function History() {
    const { data: session } = useSession()
    const userId = session?.user?.id

    const [history, setHistory] = useState<MaterialIndexDB[]>([])

    const setGeneratedMaterial = useWordbookStore((state) => state.setGeneratedMaterial)

    useEffect(() => {
        if (!userId) return;

        (async () => {
            await getMaterialsFromLocal(userId)
                .then((res) => {
                    if (res.isSuccess && res.data.length) {
                        setHistory(res.data)
                        setGeneratedMaterial(res.data[0])
                    }
                })
        })()

    }, [setGeneratedMaterial, userId])


    if (!userId) return

    return (
        <div
            className={"mt-36 lg:mt-48 w-full flex gap-12 lg:gap-12 xl:gap-16 lg:px-[10.125rem] justify-center items-start max-w-[95rem]"}>
            <Accordion type="single" collapsible className={"w-full"}>
                {history.map((val, index) => (
                    <AccordionItem key={`${index}_${val.title}`} value={`${index}`} className={"px-2"}>
                        <AccordionTrigger
                            className={"px-2 text-start"}>{val.created_at.toLocaleString('ja', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</AccordionTrigger>
                        <AccordionContent className={"px-2 flex flex-col"}>
                            <MaterialContainer material={val}/>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

function MyBookmark() {
    return (
        <>
            {/*<h3 className={"hidden sm:block text-3xl font-bold mb-6"}>{"Bookmark"}</h3>*/}
        </>
    )
}

// function SidePanel({ tabValue, setMaterialText }: {
//     tabValue: string,
//     setMaterialText: React.Dispatch<SetStateAction<string>>
// }) {
//
//     return (
//         <div
//             className={"hidden sm:block sm:fixed lg:sticky h-fit top-32 lg:top-16 right-0 sm:py-5 sm:px-6 lg:pl-8 lg:pr-0 text-muted-foreground sm:w-80 lg:basis-80 shrink-0 space-y-4 text-sm rounded-lg"}>
//             {tabValue !== "0" &&
//                 <div className={"bg-foreground/5 mx-5 p-5 flex flex-col gap-3 rounded-lg"}>
//                     {wordList.map((val, index) => (
//                         <p key={`${index}_${val}_quickJump`}>{val}</p>
//                     ))}
//                 </div>
//             }
//         </div>
//     )
// }
