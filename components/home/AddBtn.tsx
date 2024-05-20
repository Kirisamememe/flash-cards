import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/dialog/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { EditWordCard } from "@/components/form/EditCard";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWordbookStore } from "@/providers/wordbook-store-provider";

export default function AddWordBtn({ children }: { children?: React.ReactNode }) {
    console.log("AddWordBtnがレンダリングされたようだ")

    const t = useTranslations('WordSubmitForm')

    const [open, setOpen] = useState(false)
    const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

    const isSmallDevice = useMediaQuery('(max-width:640px)');

    if (isSmallDevice) {
        return (
            <Drawer noBodyStyles>
                <DrawerTrigger asChild>
                    {children}
                </DrawerTrigger>
                <DrawerContent>
                    <ScrollArea className={"w-full h-full px-3"}>
                        <EditWordCard className={"mb-6"}>
                            <DrawerClose asChild>
                                <Button variant={"ghost"} size={"lg"} type={"button"} className={"px-3"}>
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-background shadow-2xl rounded-6 mt-4 h-[calc(100vh-2rem)] -translate-y-[calc(50%+1rem)] max-h-[49.75rem] lg:max-w-[60rem] lg:max-h-[31rem] p-4 lg:p-6">
                <ScrollArea className={"pb-3 lg:pb-0 w-full h-full"}>
                    <EditWordCard setCurrentIndex={setCurrentIndex}>
                        <DialogClose asChild>
                            <Button variant={"ghost"} type={"button"} className={"px-3"} size={"lg"}>
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                    </EditWordCard>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}