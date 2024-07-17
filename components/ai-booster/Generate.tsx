import { useWordbookStore } from "@/providers/wordbook-store-provider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MaterialContainer } from "@/components/ai-booster/MaterialContainer";
import { SendPrompt } from "@/components/ai-booster/SendPrompt";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquareCode } from "lucide-react";
import ReactDOM from "react-dom";
import { cn } from "@/app/lib/utils";
    
export function Generate() {
    const generatedMaterial = useWordbookStore((state) => state.generatedMaterial)
    const isSmallDevice = useMediaQuery('(max-width:640px)')

    return (
        <div className={"mt-40 lg:mt-48 mx-auto w-full h-fit flex gap-4 lg:gap-6 xl:gap-10 lg:px-[10.125rem] justify-center items-start max-w-[95rem]"}>
            <div className={"flex-grow min-h-[calc(100vh-20rem)] lg:min-w-[26.75rem]"}>
                <MaterialContainer material={generatedMaterial}/>
            </div>
            {isSmallDevice ? <PromptPopover/> : <SendPrompt/>}
        </div>
    )
}

function PromptPopover() {
    const carouselIndex = useWordbookStore((state) => state.carouselIndex)

    const container = document.getElementById("animation-container")
    if (!container) return

    return ReactDOM.createPortal(
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"secondary"}
                        className={cn("flex bottom-24 right-[calc(3%+(8.8125%-28px))] p-3 size-14 rounded-full fixed bg-primary backdrop-blur-xl shadow-primary/30 shadow-lg z-20 text-primary-foreground", carouselIndex !== 0 && "translate-x-[calc(100%+2rem)]")}>
                    <MessageSquareCode/>
                </Button>
            </DialogTrigger>
            <DialogContent className={"p-0 w-[calc(100vw-2rem)] rounded-xl"}>
                <DialogTitle className={"hidden"}>{"Prompt Popover"}</DialogTitle>
                <SendPrompt/>
                <DialogDescription className={"hidden"}>
                    {"Prompt Popover"}
                </DialogDescription>
            </DialogContent>
        </Dialog>,
        container
    )
}