import { useWordbookStore } from "@/providers/wordbook-store-provider"
import { AIDicData, ModelList } from "@/types/AIBooster"
import { useTranslations } from "next-intl"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { SetStateAction } from "react"
import { useToast } from "../ui/use-toast"
import { getLemma } from "./MaterialContainer"
import { getDicData } from "@/app/lib/GenerativeAI"
import { readStreamableValue } from "ai/rsc"
import { animateElement, cn, fetchAndPlayAudio, isEnglish, playAudio } from "@/app/lib/utils"
import { Button } from "../ui/button"
import { Plus, X } from "lucide-react"
import EditWordBtn from "../home/EditBtn"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { POS } from "@/types/WordIndexDB"
import { indexDB } from "@/stores/wordbook-store"
import { Separator } from "../ui/separator"



type TextPopoverProps = {
    selection: string
    popoverPosition: { top: number, left: number }
    setPopoverOpen: React.Dispatch<SetStateAction<boolean>>
    popoverRef: HTMLDivElement | null
    transformOrigin: { x: number, y: number }
    closePopover: (popoverRef: HTMLDivElement | null, setPopoverOpen: React.Dispatch<SetStateAction<boolean>>, transformOrigin: { x: number, y: number }) => void
}
const TextPopover = React.forwardRef<
    HTMLDivElement, TextPopoverProps
>(({ selection, popoverPosition, closePopover, setPopoverOpen, popoverRef, transformOrigin, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement | null>()
    const dataFetchedRef = useRef(false)

    const userInfo = useWordbookStore((state) => state.userInfo)
    const AIBoosterAudio = useWordbookStore((state) => state.AIBoosterAudio)

    const t = useTranslations()

    const [dicData, setDicData] = useState<AIDicData>()
    const { toast } = useToast()

    const handleClose = () => {
        if (innerRef.current) {
            closePopover(innerRef.current, setPopoverOpen, transformOrigin)
        }
    }

    const generateDicData = useCallback(async () => {
        const model: ModelList = localStorage.getItem("AIModel") as ModelList || "gemini-1.5-flash-latest" as ModelList
        const { data } = await getDicData(getLemma(selection), model, userInfo?.trans_lang)

        try {
            const generatedDicData = {
                word: "",
                pronunciation: "",
                results: [],
                generatedAt: new Date(),
                generated_by: model,
                transLang: userInfo?.trans_lang,
            }

            for await (const delta of readStreamableValue(data)) {
                if (delta?.done) {
                    indexDB.saveGeneratedDicData(generatedDicData).then()
                    break
                }

                generatedDicData.word = delta?.word
                generatedDicData.pronunciation = delta?.pronunciation
                generatedDicData.results = delta?.results
                setDicData({ ...generatedDicData })
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

    }, [selection, toast, userInfo?.trans_lang])

    useEffect(() => {
        if (!isEnglish(selection)) return
        if (dataFetchedRef.current) return
        dataFetchedRef.current = true
        setDicData(undefined)

        ;(async () => {
            const localDicData = await indexDB.getGeneratedDicData(getLemma(selection))
            if(localDicData.isSuccess) {
                setDicData(localDicData.data[0])
                return
            }

            await generateDicData()
        })().then().finally(() => dataFetchedRef.current = false)

    }, [generateDicData, selection])

    const handlePlayAudio = () => {
        if (!dicData || !AIBoosterAudio) return
        fetchAndPlayAudio(dicData.word, `AIDic_${dicData.word}`, AIBoosterAudio, playAudio)
    }

    const handleAddToWordbook = (index: number) => {
        if (!dicData) return
        const result = dicData.results[index]
        if (!result) return

        
    }

    return (
        <div 
            ref={(node) => {
                innerRef.current = node
                if (typeof ref === 'function') { // 別に親から関数型で渡してるわけではないが、今後のために残しとく
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={cn("popover pointer-events-auto rounded-lg absolute h-56 w-80 z-20 bg-muted/80 backdrop-blur-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-black/10 drop-shadow-2xl transition-all")}
            style={{
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`
            }} {...props}>

            <Button className={"absolute right-3 top-3 p-0 size-7"} variant={"ghost"}
                    onClick={handleClose}>
                <X size={20}/>
            </Button>

            <div className={"w-full h-full overflow-scroll"}>
                <div className={"flex flex-col p-4"}>
                    {dicData?.results.length ?
                        <div className={"flex flex-col gap-6"}>
                            <div className={"flex flex-col gap-1"}>
                                <p className={"text-lg leading-tight font-semibold"}>{dicData?.word}</p>
                                <button onClick={handlePlayAudio} className={"inline-flex p-0 text-muted-foreground hover:text-foreground"}>{dicData?.pronunciation}</button>
                            </div>

                            {dicData.results.map((result, key, arr) => (
                                <div key={key} className={"flex flex-col gap-3"}>

                                    {/* POSタイトル */}
                                    <div className={"flex gap-2 items-center"}>
                                        <Badge className={"p-0 rounded-sm size-5 justify-center items-center"}>
                                            {key + 1}
                                        </Badge>
                                        {result.partOfSpeech && 
                                            <Badge variant={"coloredSecondary"}
                                               className={"rounded-sm px-1.5 justify-center items-center"}>
                                                {t(`POS.${result.partOfSpeech}`)}
                                            </Badge>
                                        }
                                        <EditWordBtn wordData={{ 
                                                id: "",
                                                phonetics: dicData?.pronunciation || "",
                                                word: dicData?.word || "",
                                                pos: result?.partOfSpeech ? result?.partOfSpeech.toUpperCase() as POS : "UNDEFINED",
                                                definition: result?.definition || "",
                                                example: result.example?.text || "",
                                                notes: result.example?.translation || "",
                                                created_at: new Date(),
                                                updated_at: new Date(),
                                                synced_at: undefined,
                                                learned_at: undefined,
                                                retention_rate: 0,
                                                author: userInfo?.id || undefined,
                                                is_deleted: false,
                                            }}>
                                            <Button variant={"coloredOutline"}
                                                    className={"p-0 size-5 rounded-sm ring-0 bg-primary/10 hover:bg-primary/20"}>
                                                <Plus size={16}/>
                                            </Button>    
                                        </EditWordBtn>
                                    </div>

                                    {/* 定義 */}
                                    <p className={"font-semibold "}>
                                        {result?.definition}
                                    </p>

                                    {/* 例文 */}
                                    <div className={"relative pl-3 before:absolute before:left-0 before:top-0 before:w-0.5 before:h-full before:bg-orange-800/30 before:dark:bg-orange-200/30"}>
                                        <p className={"text-orange-800/90 dark:text-orange-200/90"}>
                                            {result.example?.text}
                                        </p>
                                        <p className={"text-foreground mt-1"}>
                                            {result.example?.translation}
                                        </p>
                                    </div>

                                    {/* 類語 */}
                                    <div className={"space-y-1.5 mt-1"}>
                                        <label className={"flex items-center ml-0.5 gap-2 text-sm text-muted-foreground font-semibold"}>
                                            {"Similar to"}
                                        </label>
                                        {result.similarTo.map((word, key) => (
                                            <Badge className={"text-foreground font-medium px-1.5 mr-1 mb-0.5 rounded-sm bg-foreground/10 hover:bg-foreground/15 select-all"} variant={"secondary"} key={key}>
                                                {word}
                                            </Badge>
                                        ))}
                                    </div>

                                    {key !== arr.length - 1 && <Separator className={"mt-3 bg-foreground/10"}/>}
                                </div>
                            ))}

                        </div> :

                        // スケルトン
                        <div className={"flex flex-col gap-3 mt-10"}>
                            {Array.from({ length: 4 }).map((_, key) => (
                                <Skeleton key={key} className={cn("w-full h-7 bg-foreground/10", key === 3 && "w-2/3")}/>
                            ))}
                        </div>
                    }
                </div>
            </div>
        </div>
    )
})
TextPopover.displayName = "TextPopover"


export function closePopover(
    popoverRef: HTMLDivElement | null,
    setPopoverOpen: React.Dispatch<SetStateAction<boolean>>,
    transformOrigin: { x: number, y: number }
) {
    if (!popoverRef) return

    const rect = popoverRef.getBoundingClientRect()
    popoverRef.style.transformOrigin = `${transformOrigin.x}% ${transformOrigin.y}%`
    // popoverRef.style.transformOrigin = `${(clickedPosition.left - rect.left) / rect.width * 100}% ${(clickedPosition.top - rect.top) / rect.height * 100}%`

    animateElement(popoverRef, [
        { transform: 'scale(1) translateY(0)' },
        { transform: 'scale(1.03) translateY(-2px)', offset: 0.2 },
        { transform: 'scale(0.9) translateY(3px)', offset: 0.4 },
        { transform: 'scale(1.1) translateY(-5px)', opacity: 1, offset: 0.6 },
        { transform: 'scale(0) translateY(-200px)', opacity: 0.7 }
    ], {
        duration: 500,
        easing: 'ease-in-out',
        fill: 'forwards'
    }).then((res) => {
        if (res.finish) setPopoverOpen(false)
    })
}

export { TextPopover }