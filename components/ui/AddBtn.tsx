import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { EditWordCard } from "@/components/editCard";
import React, { SetStateAction, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function AddWordBtn({
    userId,
    children,
    setReload,
    setCurrentIndex
}: {
    userId: string | undefined
    children?: React.ReactNode
    setCurrentIndex?: React.Dispatch<SetStateAction<number>>
    setReload?: React.Dispatch<SetStateAction<boolean>>
}) {
    const t = useTranslations('WordSubmitForm')

    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="p-6 bg-background dark:shadow-primary/10 dark:ring-primary/20 shadow-2xl ring-1 ring-foreground/[0.05] rounded-6 sm:max-w-xl">
                <EditWordCard userId={userId} setReload={setReload} setCurrentIndex={setCurrentIndex}>
                    <DialogClose asChild>
                        <Button variant={"ghost"} size={"lg"} type={"button"}>
                            {t('cancel')}
                        </Button>
                    </DialogClose>
                </EditWordCard>

            </DialogContent>
        </Dialog>
    )
}