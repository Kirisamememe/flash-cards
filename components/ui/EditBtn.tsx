import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog/dialog";
import { Button } from "@/components/ui/button";
import { EditWordCard } from "@/components/editCard";
import React, { SetStateAction, useState } from "react";
import { WordDataMerged } from "@/types/WordIndexDB";
import { useTranslations } from "next-intl";

export default function EditWordBtn({
   userId,
   wordData,
   setReload,
   setInterval,
   children
}: {
    userId: string | undefined
    isEditing?: boolean
    setIsEditing?: React.Dispatch<SetStateAction<boolean>>
    isAdding?: boolean
    setIsAdding?: React.Dispatch<SetStateAction<boolean>>
    handleOpenChange?: any
    wordData?: WordDataMerged
    setReload?: React.Dispatch<SetStateAction<boolean>>
    setInterval?: React.Dispatch<SetStateAction<number>>
    currentIndex?: number
    children?: React.ReactNode
}) {
    const t = useTranslations('WordSubmitForm')
    const t2 = useTranslations('Index')

    const [open, setOpen] = useState(false)
    const handleOnChange = () => {
        setOpen(prev => !prev)
        if (!open) {// ここの値は変更前の値、つまりprevのほう
            setInterval && setInterval(99999999)
        }
        else {
            const interval = localStorage.getItem("interval") || "2000"
            setInterval && setInterval(parseInt(interval))
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOnChange}>
            <DialogTrigger asChild>
                <Button variant={"coloredOutline"}>{t2('editBtn')}</Button>
            </DialogTrigger>
            <DialogContent className="p-6 bg-background dark:shadow-primary/10 dark:ring-primary/20 shadow-2xl ring-1 ring-foreground/[0.05] rounded-6 sm:max-w-xl">
                <EditWordCard userId={userId} wordData={wordData} setInterval={setInterval} setReload={setReload} setOpen={setOpen}>
                    <DialogClose asChild>
                        <Button variant={"ghost"} size={"lg"} type={"button"}>
                            {t('cancel')}
                        </Button>
                    </DialogClose>
                </EditWordCard>
                {children}
            </DialogContent>
        </Dialog>
    )
}