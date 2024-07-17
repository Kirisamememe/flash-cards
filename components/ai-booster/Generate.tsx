import { useWordbookStore } from "@/providers/wordbook-store-provider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MaterialContainer } from "@/components/ai-booster/MaterialContainer";
import { SendPrompt } from "@/components/ai-booster/SendPrompt";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquareCode, StopCircle } from "lucide-react";
import ReactDOM from "react-dom";
import { cn } from "@/app/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { z } from "zod";
import { promptRequest } from "@/types";
import { generateMaterial } from "@/app/lib/GenerativeAI";
import { MaterialIndexDB } from "@/types/AIBooster";
import { useSession } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import { readStreamableValue } from "ai/rsc";
import { useState } from "react";
import { indexDB } from "@/stores/wordbook-store";
    
export function Generate() {

    const userInfo = useWordbookStore((state) => state.userInfo)
    const AIModel = useWordbookStore((state) => state.AIModel)
    const generatedMaterial = useWordbookStore((state) => state.generatedMaterial)
    const setLoadingMaterial = useWordbookStore((state) => state.setLoadingMaterial)
    const setGeneratedMaterial = useWordbookStore((state) => state.setGeneratedMaterial)
    const upsertMaterialHistory = useWordbookStore((state) => state.upsertMaterialHistory)

    const [isSuspended, setIsSuspended] = useState(false)
    
    const { data: session } = useSession()
    const isSmallDevice = useMediaQuery('(max-width:640px)')
    const { toast } = useToast()

    const handleSend = async (value: z.infer<typeof promptRequest>) => {
        const userId = session?.user?.id
        const role = session?.user?.role
        if (!userId || !role) return

        setLoadingMaterial(true)

        const { data } = await generateMaterial(value.prompt, AIModel, userInfo?.learning_lang || "EN", userInfo?.trans_lang)
        const material: MaterialIndexDB = {
            id: "",
            title: "",
            content: [],
            translation: {
                lang: userInfo?.trans_lang || "JA",
                text: []
            },
            author: userId,
            generated_by: AIModel,
            created_at: new Date(),
            updated_at: new Date(),
        }
        setGeneratedMaterial(material)

        try {
            for await (const delta of readStreamableValue(data)) {
                if (isSuspended) {
                    console.log("Suspended")
                    break
                }

                if (delta?.done) {
                    console.log("＆＆＆＆＆＆　マテリアルを保存する　＆＆＆＆＆＆＆")
                    indexDB.createMaterial(material)
                        .then((res) => {
                            if (res.isSuccess){
                                setGeneratedMaterial(res.data[0])
                                upsertMaterialHistory(res.data[0])
                            }
                        })
                    break
                }

                if (!delta?.title || !delta?.content.length) {
                    continue
                }

                material.title = delta.title
                material.content = delta?.content
                material.translation.text = delta?.translation
                material.updated_at = new Date()

                setGeneratedMaterial({...material})
                console.log(delta)
            }
        } catch (error) {
            console.error(error)
            const errorMessage = error as { error: string }

            toast({
                title: ("generative_error"),
                description: errorMessage.error,
                variant: "destructive"
            })

            setGeneratedMaterial({ ...material, title: "Error", content: ["Error"] })
        } finally {
            setLoadingMaterial(false)
        }
    }

    const handleSuspend = () => {
        setLoadingMaterial(false)
        setIsSuspended(true)
        setTimeout(() => {
            setIsSuspended(false)
        }, 1000)
    }

    return (
        <div className={"mt-40 lg:mt-48 mx-auto w-full h-fit flex gap-4 lg:gap-6 xl:gap-10 lg:px-[10.125rem] justify-center items-start max-w-[95rem]"}>
            {generatedMaterial ?
                <>
                    <div className={"flex-grow min-h-[calc(100vh-20rem)] lg:min-w-[26.75rem]"}>
                        <MaterialContainer material={generatedMaterial}/>
                    </div>
                    {isSmallDevice ? <PromptPopover handleSend={handleSend} handleSuspend={handleSuspend}/> : <SendPrompt handleSend={handleSend} handleSuspend={handleSuspend}/>}
                </> :
                <div className={"pb-32 sm:pb-6 px-4 flex flex-col gap-7 w-full"}>
                    <Skeleton className={"w-full h-16 mb-3"}/>
                    <div className={"flex flex-col gap-6"}>
                        {Array.from({ length: 10 }).map((_, key) => (
                            <Skeleton key={key} className={"w-full h-10"}/>
                        ))}
                    </div>
                </div>
            }
        </div>
    )
}

function PromptPopover({ handleSend, handleSuspend }: { handleSend: (value: z.infer<typeof promptRequest>) => void, handleSuspend: () => void }) {
    const carouselIndex = useWordbookStore((state) => state.carouselIndex)
    const isPending = useWordbookStore((state) => state.loadingMaterial)

    const [open, setOpen] = useState(false)

    const container = document.getElementById("animation-container")
    if (!container) return

    return ReactDOM.createPortal(
        <Dialog open={open} onOpenChange={setOpen}>
            {isPending ? 
                <Button variant={"secondary"} 
                        className={cn("flex bottom-24 right-[calc(3%+(8.8125%-28px))] p-3 size-14 rounded-full fixed bg-destructive backdrop-blur-xl shadow-primary/30 shadow-lg z-20 text-primary-foreground", carouselIndex !== 0 && "translate-x-[calc(100%+2rem)]")}
                        onClick={handleSuspend}>
                    <StopCircle/>
                </Button> :
                <DialogTrigger asChild>
                    <Button variant={"secondary"}
                            className={cn("flex bottom-24 right-[calc(3%+(8.8125%-28px))] p-3 size-14 rounded-full fixed bg-primary backdrop-blur-xl shadow-primary/30 shadow-lg z-20 text-primary-foreground", carouselIndex !== 0 && "translate-x-[calc(100%+2rem)]")}>
                        <MessageSquareCode/>
                    </Button>
                </DialogTrigger>
            }
            <DialogContent className={"p-0 w-[calc(100vw-2rem)] rounded-xl"}>
                <DialogTitle className={"hidden"}>{"Prompt Popover"}</DialogTitle>
                <SendPrompt handleSend={handleSend} handleSuspend={handleSuspend} setOpen={setOpen}/>
                <DialogDescription className={"hidden"}>
                    {"Prompt Popover"}
                </DialogDescription>
            </DialogContent>
        </Dialog>,
        container
    )
}