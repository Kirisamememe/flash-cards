import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/dialog/dialog";
import { Button } from "@/components/ui/button";
import { WordFormContainer } from "@/components/form/WordFormContainer";
import React, { useState } from "react";
import { WordDataMerged } from "@/types/WordIndexDB";
import { useTranslations } from "next-intl";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWordbookStore } from "@/providers/wordbook-store-provider";

interface EditWordBtnProps {
    children?: React.ReactNode
    wordData?: WordDataMerged
}

const EditWordBtn = React.forwardRef<HTMLButtonElement, EditWordBtnProps>(({
    wordData, children
}, ref) => {
    // console.log("EditWordBtnがレンダリングされたようだ")

    const t = useTranslations()

    const [open, setOpen] = useState(false)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const handleOnChange = () => {
        setOpen(prev => !prev)

        if (!open) {// ここの値は変更前の値、つまりprevのほう
            document.getAnimations().map(a => a.pause())
        }
        else {
            document.getAnimations().map(a => a.play())
        }
    }

    if (isSmallDevice) {
        return (
            <Drawer noBodyStyles onOpenChange={handleOnChange}>
                <DrawerTrigger asChild>
                    {children ? children :
                        <Button ref={ref} variant={"coloredOutline"}>
                        {t('Index.editBtn')}
                        </Button>
                    }
                </DrawerTrigger>
                <DrawerContent>
                    <ScrollArea barClass={"mr-0.5 py-1"}>
                        <WordFormContainer setOpen={setOpen} wordData={wordData} setCurrentIndex={setCurrentIndex}>
                            <DrawerClose asChild>
                                <Button variant={"ghost"} size={"lg"} type={"button"} className={"px-5"}>
                                    {t('WordSubmitForm.cancel')}
                                </Button>
                            </DrawerClose>
                        </WordFormContainer>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOnChange}>
            <DialogTrigger asChild>
                {children ? children :
                    <Button ref={ref} variant={"coloredOutline"}>
                        {t('Index.editBtn')}
                    </Button>
                }
            </DialogTrigger>
            <DialogContent className="p-0 pt-10 shadow-2xl rounded-6 h-[calc(100vh-2rem)] -translate-y-[calc(50%)] lg:max-w-[60rem] max-h-[49rem] lg:max-h-[31rem]">
                <ScrollArea barClass={"mr-0.5 py-1"}>
                    <WordFormContainer setOpen={setOpen} wordData={wordData} setCurrentIndex={setCurrentIndex}>
                        <DialogClose asChild>
                            <Button variant={"ghost"} size={"lg"} type={"button"} className={"px-5"}>
                                {t('WordSubmitForm.cancel')}
                            </Button>
                        </DialogClose>
                    </WordFormContainer>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
})

EditWordBtn.displayName = "EditWordBtn"
export default EditWordBtn