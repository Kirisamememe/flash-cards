import { MaterialIndexDB } from "@/types/AIBooster";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Bookmark, Languages, Volume2, X, Trash2, Plus } from "lucide-react";
import { cn, fetchAndPlayAudio, playAudio } from "@/app/lib/utils";
import { Separator } from "@/components/ui/separator";
import nlp from "compromise";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, } from "@/components/ui/dialog"
import { closePopover, TextPopover } from "./Popover";
import { exampleMaterial } from "@/types/static";
  
export const getLemma = (word: string) => {
    const doc = nlp(word)
    return doc.verbs().toInfinitive().out('array')[0] || doc.nouns().toSingular().out('array')[0] || word
}
export const isName = (word: string) => {
    const doc = nlp(word)
    return !!doc.people().out('text')
}

export function MaterialContainer({ material }: { material: MaterialIndexDB}) {
    const selection = useRef("")
    const clickedPosition = useRef({ left: 0, top: 0 })
    const transformOrigin = useRef({ x: 0, y: 0 })
    const popover = useRef<HTMLDivElement>(null)
    const container = useRef<HTMLDivElement>(null)
    const selectedSpan = useRef<HTMLSpanElement>()
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })

    const indexDB = useWordbookStore((state) => state.indexDB)
    const setGeneratedMaterial = useWordbookStore((state) => state.setGeneratedMaterial)
    const masteredWords = useWordbookStore((state) => state.masteredWords)
    const setMasteredWords = useWordbookStore((state) => state.setMasteredWords)
    const upsertMaterialHistory = useWordbookStore((state) => state.upsertMaterialHistory)
    const deleteMaterial = useWordbookStore((state) => state.deleteMaterial)
    const AIBoosterAudio = useWordbookStore((state) => state.AIBoosterAudio)
    const isEditing = useWordbookStore((state) => state.isEditing)
    const isPending = useWordbookStore((state) => state.loadingMaterial)

    const { data: session } = useSession()
    const { toast } = useToast()

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

        const container = e.currentTarget.offsetParent as HTMLElement
        if (!container) return

        const rect = e.currentTarget.getBoundingClientRect() // Viewportにおける座標などを返す  
        const containerRect = container.getBoundingClientRect() // 親要素

        const left = rect.left - containerRect.left // 親要素に対する相対座標
        const top = rect.top - containerRect.top // 親要素に対する相対座標
        const width = rect.width
        const height = rect.height

        clickedPosition.current = { left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 }

        if (e.currentTarget.textContent === selection.current) {
            closePopover(popover.current, setPopoverOpen, transformOrigin.current)
        }

        if (selectedSpan.current && selectedSpan.current.textContent !== e.currentTarget.textContent) {
            selectedSpan.current.style.setProperty('--after-width', "0")
            selectedSpan.current.animate([
                { backgroundColor: "transparent", offset: 1.0 }
            ], {
                duration: 320,
            })
            const span = selectedSpan.current
            setTimeout(() => {
                span?.classList.remove("wordSpan")
            }, 300)
        }

        selectedSpan.current = e.currentTarget
        selectedSpan.current.style.setProperty('--after-width', `${width+4}px`)
        selectedSpan.current.classList.add("wordSpan")
        selectedSpan.current.style

        selection.current = e.currentTarget.textContent
        const popoverMargin = 12
        const popoverWidth = 320
        const popoverHeight = 224
        const topSpace = popoverHeight + popoverMargin * 2

        const popoverTop = (rect.top > topSpace && top > topSpace) ? top - (popoverHeight + popoverMargin) : top + (popoverMargin + height) 
        // クリックされた要素の、Viewportにおけるtopが296px以上かつ、親要素に対するtopが296px以上なら、popoverの（親要素における）topを、クリックされた要素のtopから234px引いた値にする
        // そうでない場合は、クリックされた要素のtopに44px加算する
        const popoverLeft = Math.min(Math.max((left - (popoverWidth / 2) + rect.width / 2), containerRect.left > popoverMargin ? (popoverMargin - (popoverWidth / 2)) : popoverMargin), viewportWidth - (popoverWidth + popoverMargin)) 
        // 最小値はViewportの左端から12px、最大値はViewportの右端から12px

        setPopoverOpen(true)
        setPopoverPosition({
            top: popoverTop,
            left: popoverLeft,
        })
        transformOrigin.current = { x: (clickedPosition.current.left - (popoverLeft + containerRect.left)) / popoverWidth * 100, y: (clickedPosition.current.top - (popoverTop + containerRect.top)) / popoverHeight * 100 }
    }


    useEffect(() => {
        if (!masteredWords.size) {
            indexDB.getMasteredWords(session?.user.id || "-1")
                .then((res) => {
                    if (!res.isSuccess) return
                    setMasteredWords(res.data[0].words)
                })
        }

        if (!popoverOpen && selectedSpan.current) {
            selectedSpan.current.style.setProperty('--after-width', "0")
            selectedSpan.current.animate([
                { backgroundColor: "transparent", offset: 1.0 },
            ], {
                duration: 320,
            })
            setTimeout(() => {
                selectedSpan.current?.classList.remove("wordSpan")
                selectedSpan.current = undefined
            }, 300)
        }

        const handleSelection = (e: MouseEvent | TouchEvent) => {
            const viewportWidth = window.visualViewport?.width
            const viewportHeight = window.visualViewport?.height
            if (!viewportWidth || !viewportHeight) return
            if (popoverOpen || !container.current) return
            if (!container.current.contains(e.target as Node)) return
            if (!e.target) return

            const selectedText = window.getSelection()?.toString()
            

            if (!selectedText || !isValidSelection(selectedText) || selectedText === selection.current) {
                selection.current = ""
                return
            }
            // selectedText !== selection.currentを追加しないと、選択された文字をクリックするとpopoverが消えてからまたポップしてしまう
            
            const range = window.getSelection()?.getRangeAt(0)
            if (!range) return

            const targetContainer = e.target
            if (!targetContainer || !(targetContainer instanceof HTMLElement)) return
            
            const containerRef = targetContainer.offsetParent as HTMLElement


            const rect = range.getBoundingClientRect()
            const containerRect = containerRef.getBoundingClientRect()

            const left = rect.left - containerRect.left
            const top = rect.top - containerRect.top
            
            selection.current = selectedText
            setPopoverOpen(true)

            clickedPosition.current = { left: rect.left + rect.width / 2, top: rect.top + rect.height / 2 }
            
            const popoverTop = (rect.top > 296 && top > 296) ? top - 234 : top + 44
            const popoverLeft = Math.min(Math.max((left - 160 + rect.width / 2), containerRect.left > 12 ? (12 - 160) : 12), viewportWidth - 332)

            setPopoverPosition({
                top: popoverTop,
                left: popoverLeft,
            })
            transformOrigin.current = { x: (clickedPosition.current.left - (popoverLeft + containerRect.left)) / 320 * 100, y: (clickedPosition.current.top - (popoverTop + containerRect.top)) / 224 * 100 }
        }

        const handlePointerDown = (e: PointerEvent) => {
            e.stopPropagation()
            // ポップオーバーが開いていて、クリックされた要素がポップオーバー外の場合
            if (popover.current && popover.current.contains(e.target as Node)) return
            if (e.target instanceof HTMLButtonElement) return

            const wordForm = document.getElementById("word-form")
            if (wordForm) return

            if (popoverOpen) {
                closePopover(popover.current, setPopoverOpen, transformOrigin.current)
                // setPopoverOpen(false)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('mouseup', handleSelection)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('mouseup', handleSelection)
        }
    }, [indexDB, isEditing, masteredWords.size, popoverOpen, session?.user.id, setMasteredWords])

    const handleDelete = () => {
        if (!('id' in material)) {
            return
        }

        deleteMaterial(material.id)
    }

    const handleUndoBookmark = async () => {
        const saveRequest = await indexDB.updateMaterial({ ...material, bookmarked_at: undefined })
        if (!saveRequest.isSuccess) {
            return
        }
        setGeneratedMaterial(saveRequest.data[0])
        upsertMaterialHistory(saveRequest.data[0])
        toast({
            title: "Undone",
            description: "Bookmark has been undone",
            duration: 3000
        })
    }

    const handleBookmark = async () => {
        if (!('id' in material)) {
            return
        }

        if (material.bookmarked_at) {
            handleUndoBookmark()
            return
        }

        const saveRequest = await indexDB.updateMaterial({ ...material, bookmarked_at: new Date()})
        if (!saveRequest.isSuccess) {
            return
        }

        setGeneratedMaterial(saveRequest.data[0])
        upsertMaterialHistory(saveRequest.data[0])

        toast({
            title: "Bookmarked",
            description: "Material has been bookmarked",
            action: 
            <Button variant={"outline"} onClick={handleUndoBookmark}>
                {"Undo"}
            </Button>,
            duration: 3000
        })
    }

    const handlePlayAudio = async () => {
        if (!AIBoosterAudio) return
        
        for (let index = 0; index < material.content.length; index++) {
            await fetchAndPlayAudio(material.content[index], `material_${material.id}_${index}`, AIBoosterAudio, playAudio)
        }
    }
    
    if (!material.content.length && isPending) { // 内容がなくかつローディング中なら
        return (
            <div className={"appear relative px-4 pb-32 sm:pb-6 flex flex-col gap-7"}>
                <Skeleton className={"w-full h-16 mb-3"}/>
                <div className={"flex flex-col gap-6"}>
                    {Array.from({ length: 10 }).map((_, key) => (
                        <Skeleton key={key} className={"w-full h-10"}/>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div ref={container}
            className={"appear relative pb-32 sm:pb-6 flex flex-col gap-7"}>
            <div className={"appear flex flex-col gap-4 px-5"}>
                <h4 className={"text-2xl lg:text-3xl font-bold line-clamp-2 lg:leading-snug"}>
                    {material?.title || exampleMaterial.title}
                </h4>
                <div className={"flex gap-3"}>
                    <Button variant={"coloredOutline"} 
                            className={"p-0 size-8 align-middle"} 
                            onClick={handlePlayAudio}>
                        <Volume2 size={24}/>
                    </Button>
                    <Button variant={"bookmarked_at" in material && material?.bookmarked_at ? "default" : "coloredOutline"} 
                            className={"p-0 size-8 align-middle"} 
                            onClick={handleBookmark}>
                        <Bookmark size={24}/>
                    </Button>
                </div>
            </div>
            <Paragraph id={material?.id || exampleMaterial.id} content={material?.content || exampleMaterial.content} translation={material?.translation.text || exampleMaterial.translation.text} handleClick={handleClick}/>
            <div className="mt-6 mb-12 pl-4 pr-4 sm:pr-0">
                <Separator className={"mb-3"}/>

                <div className="flex justify-between items-center">
                    
                    <div className="flex gap-8 items-center">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">{"Created At"}</p>
                            {material?.created_at?.toLocaleDateString()}
                        </div>
                        <Separator orientation="vertical" className={"py-4"}/>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">{"Generated By"}</p>
                            {material?.generated_by || "AIModel"}
                        </div>
                    </div>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant={"ghost"} size={"icon"}>
                                <Trash2 size={20}/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-96">
                            <DialogHeader className="flex flex-col gap-2">
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove your data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-stretch gap-1">
                                <DialogClose asChild>
                                    <Button variant={"secondary"}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={handleDelete} variant={"destructive"}>
                                        Delete
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {popoverOpen &&
                <TextPopover ref={popover} selection={selection.current} popoverPosition={popoverPosition}
                             setPopoverOpen={setPopoverOpen} closePopover={closePopover}
                             transformOrigin={transformOrigin.current}
                             popoverRef={popover.current}/>
            }
        </div>
    )
}


function Paragraph({ id, content, translation, handleClick }: { id: string, content: string[], translation: string[] , handleClick: React.MouseEventHandler }) {

    const isPending = useWordbookStore((state) => state.loadingMaterial)

    return (
        <article
            className={"appear flex flex-col gap-7"}>
            {content.map((p, index) => (
                <div key={index} className={"flex flex-col gap-2 pl-4 pr-3 sm:pr-0"}>
                <p className={"w-full sm:w-fit pl-1 text-lg leading-[200%] text-pretty font-light tracking-[0.05rem] rounded-lg align-middle text-foreground/75"}>
                    {p.split(/\b|\s/).map((token, key, arr) => {
                        const isWord = /^\w+$/.test(token)

                        if (isWord) {
                            if (/[,.!?:;]/.test(arr[key + 1])) {
                                return (
                                    <span key={key} className={"inline-block"}>
                                    <Token key={key} token={token} handleClick={handleClick}/>
                                        {arr[key + 1]}
                                </span>
                                )
                            } else if (/['"-]/.test(arr[key + 1])) {
                                return (
                                    <span key={key} className={"inline-block"}>
                                    <Token key={key} token={token} handleClick={handleClick}/>
                                        {arr[key + 1]}
                                </span>
                                )
                            } else {
                                return <Token key={key} token={token} handleClick={handleClick}/>
                            }
                        } else if (/[,.!?:;]/.test(token)) {
                            return " "
                        } else if (/['"-]/.test(token)) {
                            if (key === 0) return token
                            return
                        } else {
                            return token
                        }
                    })}
                </p>
                {translation?.length && 
                    <div className={"flex gap-6 sm:gap-5 max-w-[48rem]"}>
                        <Translation text={index < translation.length ? translation[index] : ""}/>
                        <Tools id={id} text={p} index={index}/>
                    </div>
                }
                </div>
            ))}
            {isPending && 
                <div className={"flex flex-col w-full px-4"}>
                    <Skeleton className={"h-10 mb-4"}/>
                </div>
            }
        </article>
    )
}

function Translation({ text }: { text: string }) {
    const isPending = useWordbookStore((state) => state.loadingMaterial)

    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const detailRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'touch') return
        if (!detailRef.current || !containerRef.current) return

        e.currentTarget.click()
    }

    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'touch') return
        if (!detailRef.current || !containerRef.current) return

        e.currentTarget.click()
    }

    const handleClick = () => {
        if (!detailRef.current || !containerRef.current) return

        if (open) {
            containerRef.current.style.height = "2rem"
            setOpen(false)
        } else {
            containerRef.current.style.height = `${(detailRef.current.clientHeight) / 16}rem`
            setOpen(true)
        }
    }

    return (
        <div ref={containerRef}
             className={cn("flex w-full sm:w-auto min-w-60 h-8 overflow-hidden bg-muted/70 rounded-lg transition-all cursor-pointer", text ? "hover:bg-muted" : "bg-muted/40 text-muted cursor-not-allowed")}>
            <button ref={buttonRef}
                    disabled={!text}
                    onClick={handleClick}
                    className={cn("relative flex w-full rounded-none px-2 text-sm")}>
                <div
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                    className={"absolute  h-full w-32 z-20"}/>
                <div className={cn("absolute -left-4 translate-x-6 flex gap-2 text-muted-foreground items-center transition-all duration-300", open ? "-translate-y-full opacity-0" : "opacity-100", !text && "opacity-40")}>
                    <Languages
                        className={"size-6 p-[3px] my-1"}
                        size={16}/>
                    {!text ? 
                        isPending ? 
                            "生成中" : 
                            "" : 
                        "翻訳を表示"
                    }
                </div>
                <div ref={detailRef}
                     className={cn("h-auto w-full text-start text-muted-foreground px-2 py-1.5 transition-all duration-300", open ? "opacity-100" : "opacity-0 translate-y-full",)}>
                    {text}
                </div>
            </button>
        </div>
    )
}
    


function Tools({ id, text, index }: { id: string, text: string, index: number }) {
    const [isPlaying, setIsPlaying] = useState(false)

    const AIBoosterAudio = useWordbookStore((state) => state.AIBoosterAudio)

    const handlePlayAudio = async () => {
        console.log(`material_${id}_${index}`)
        console.log(text)
        if (!AIBoosterAudio) return
        console.log(`aaa`)
        
        setIsPlaying(true)
        await fetchAndPlayAudio(text, `material_${id}_${index}`, AIBoosterAudio, playAudio)
        setIsPlaying(false)
    }

    return (
        <div className={"flex gap-4 sm:gap-3 align-bottom mb-0.5"}>
            <Button variant={"ghost"} 
                    onClick={handlePlayAudio}
                    className={cn("p-0 size-8 text-muted-foreground", isPlaying && "text-primary")}>
                <Volume2 size={22}/>
            </Button>
            <Button variant={"ghost"} className={"p-0 size-8 text-muted-foreground"}>
                <Bookmark size={22}/>
            </Button>
        </div>
    )
}


function Token({ token, handleClick }: { token: string, handleClick: React.MouseEventHandler }) {
    const masteredWords = useWordbookStore((state) => state.masteredWords)
    const words = useWordbookStore((state) => state.words)

    const useSpan = useMemo(() => {
        if (!masteredWords.size) return false
        if (isName(token)) return false

        const lemma = getLemma(token.toLowerCase())
        return !masteredWords.has(lemma)
    }, [token, masteredWords])

    const isLearning = useMemo(() => {
        if (!words.length) return false
        const lemma = getLemma(token.toLowerCase())
        return words.some(word => word.word === lemma)
    }, [token, words])

    return (
        <>
            {useSpan ?
                <button onClick={handleClick}
                        className={cn("relative inline-block rounded py-0 select-text font-medium text-foreground hover:scale-105 active:scale-95 hover:bg-foreground/10 active:bg-foreground/10 transition-all cursor-pointer", isLearning && "text-orange-800 dark:text-orange-200")}>
                    {token}
                </button> : token
            }
        </>
    )
}


