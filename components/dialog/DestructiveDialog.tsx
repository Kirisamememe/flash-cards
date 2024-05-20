import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/dialog/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import React, { SetStateAction, useState, useTransition } from "react";
import { cn } from "@/app/lib/utils";
import { deleteByIdFromLocal } from "@/app/lib/indexDB/indexDB";
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";

export default function DestructiveDialog({
    className,
    isPendingParent,
    setParentOpen,
}: {
    className?: string
    isPendingParent?: boolean
    setParentOpen?: React.Dispatch<SetStateAction<boolean>>
}) {

    const [isPending, startTransition] = useTransition();
    const { toast } = useToast()
    const t = useTranslations('WordSubmitForm')
    const [open, setOpen] = useState(false)

    const words = useWordbookStore((state) => state.words)
    const currentIndex = useWordbookStore((state) => state.currentIndex)
    const userInfo = useWordbookStore((state) => state.userInfo)
    const deleteWord = useWordbookStore((state) => state.deleteWord)
    const userInterval = useWordbookStore((state) => state.userInterval)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)

    const handleDelete = () => {
        if (words[currentIndex].id && deleteWord) {
            startTransition(async () => {
                const result = await deleteByIdFromLocal(userInfo?.id, words[currentIndex].id)
                if (!result.isSuccess) {
                    toast({
                        variant: "destructive",
                        title: t('edit_permission_error'),
                        description: t('edit_permission_error')
                        // TODO 適切なローカライズが必要
                    });
                    return
                }

                deleteWord(words[currentIndex].id)

                toast({
                    variant: "default",
                    title: ('単語を削除しました'),
                    description: ('単語を削除しました')
                    // TODO 適切なローカライズが必要
                })

                if (userInterval > 99999) {
                    const localInterval = localStorage.getItem("interval")
                    localInterval && setUserInterval(parseInt(localInterval))
                }

                setOpen(false)
                setParentOpen && setParentOpen(false)
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={cn("group hover:bg-destructive/10 px-2 w-11 transition-all", className)}
                    variant={"ghost"}
                    size={"lg"}
                    type={"button"}
                >
                    <Trash2 className={"group-hover:text-destructive transition-all"} width={20} height={20}/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[25rem] w-[calc(100%-2rem)] rounded-6 -translate-x-[50%]">
                <DialogHeader>
                    <DialogTitle className={"text-center mt-2"}>{t("delete_confirm_title")}</DialogTitle>
                </DialogHeader>
                <DialogDescription className={"text-center mt-1 mb-2"}>
                    { t('delete_confirm_description') }
                </DialogDescription>
                <div className={"flex w-full justify-stretch gap-3"}>
                    <Button
                        className={"w-full"}
                        variant={"destructive"}
                        onClick={ handleDelete }
                        type={"button"}
                        disabled={ isPendingParent || isPending }
                    >
                        { t('yes') }
                    </Button>
                    <DialogClose asChild>
                        <Button
                            className={"w-full"}
                            variant={"ghost"}
                            type={"button"}>
                            { t('no') }
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}