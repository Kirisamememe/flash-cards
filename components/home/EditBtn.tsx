import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/dialog/dialog";
import { Button } from "@/components/ui/button";
import { EditWordCard } from "@/components/form/EditCard";
import React, { useState } from "react";
import { WordDataMerged } from "@/types/WordIndexDB";
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditWordBtn({
    children,
    wordData
}: {
    children?: React.ReactNode
    wordData: WordDataMerged
}) {
    console.log("EditWordBtnがレンダリングされたようだ")

    const t = useTranslations('WordSubmitForm')
    const t2 = useTranslations('Index')

    const [open, setOpen] = useState(false)

    const setUserInterval = useWordbookStore((state) => state.setUserInterval)

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    const handleOnChange = () => {
        setOpen(prev => !prev)
        if (!open) {// ここの値は変更前の値、つまりprevのほう
            setUserInterval(99999999)
        }
        else {
            const interval = localStorage.getItem("interval") || "2000"
            setUserInterval(parseInt(interval))
        }
    }

    if (isSmallDevice) {
        return (
            <Drawer noBodyStyles>
                <DrawerTrigger asChild>
                    <Button className={""} variant={"coloredOutline"}>{t2('editBtn')}</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <ScrollArea className={"w-full h-full px-3"}>
                        <EditWordCard className={"mb-6"} setOpen={setOpen} wordData={wordData}>
                            <DrawerClose asChild>
                                <Button variant={"ghost"} size={"lg"} type={"button"} className={"px-5"}>
                                    {t('cancel')}
                                </Button>
                            </DrawerClose>
                        </EditWordCard>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleOnChange}>
            <DialogTrigger asChild>
                <Button className={""} variant={"coloredOutline"}>{t2('editBtn')}</Button>
            </DialogTrigger>
            <DialogContent className="bg-background shadow-2xl rounded-6 mt-4 h-[calc(100vh-2rem)] -translate-y-[calc(50%+1rem)] max-h-[49.75rem] lg:max-w-[60rem] lg:max-h-[31rem] p-4 lg:p-6">
                <ScrollArea className={"pb-3 lg:pb-0 w-full h-full"}>
                    <EditWordCard setOpen={setOpen} wordData={wordData}>
                        <DialogClose asChild>
                            <Button variant={"ghost"} size={"lg"} type={"button"} className={"px-5"}>
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                    </EditWordCard>
                    {children}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}