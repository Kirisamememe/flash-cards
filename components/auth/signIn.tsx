import { Button } from "../ui/button";
import { Social } from "@/components/auth/socialButtons";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/dialog/dialog";
import { Separator } from "@/components/ui/separator";
import React, { SetStateAction } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

export default function SignIn({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<SetStateAction<boolean>> }){
    const t = useTranslations('User')
    const isSmallDevice = useMediaQuery('(max-width:640px)');

    if (isSmallDevice) {
        return (
            <Drawer shouldScaleBackground={false} noBodyStyles open={open} onOpenChange={setOpen}>
                <DrawerContent className={"h-fit px-6 focus-visible:outline-none"}>
                    <DrawerHeader className={"pt-8 pb-4 gap-4"}>
                        <DrawerTitle className={"text-2xl"}>{t("signIn")}</DrawerTitle>
                        <DrawerDescription className={"text-xs leading-relaxed whitespace-pre-wrap"}>
                            {t("description")}
                        </DrawerDescription>
                    </DrawerHeader>
                    <Social/>
                    <Separator className={"my-6"}/>
                    <DrawerClose asChild>
                        <Button className={"w-full mb-8"} type={"button"} variant={"secondary"}>
                            {t("cancel")}
                        </Button>
                    </DrawerClose>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={"rounded-full font-medium lg:px-5 lg:h-10 lg:text-sm"} variant={"coloredOutline"} size={"sm"}>
                    {t("signIn")}
                </Button>
            </DialogTrigger>
            <DialogContent className={"max-w-[25rem] w-full p-6 rounded-4 shadow-2xl"}>
                <DialogHeader className={"gap-2 mb-1"}>
                    <DialogTitle>
                        {t("signIn")}
                    </DialogTitle>
                    <DialogDescription className={"text-xs leading-relaxed whitespace-pre-wrap"}>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>
                <Social/>
                <Separator className={"my-2"}/>
                <DialogClose asChild>
                    <Button
                        className={"w-full"}
                        type={"button"}
                        variant={"secondary"}
                    >
                        {t("cancel")}
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>

    )
}