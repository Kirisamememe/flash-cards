import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog/dialog";
import {Button} from "@/components/ui/button";
import {TrashIcon} from "@radix-ui/react-icons";
import React from "react";

export default function DestructiveDialog({
    eventHandler,
    title,
    description,
    confirmBtnText,
    cancelBtnText
}: {
    eventHandler: (e: React.MouseEvent) => void
    title: string
    description: string
    confirmBtnText: string
    cancelBtnText: string
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className={"absolute right-6 group hover:bg-destructive/10 px-2 w-11"}
                    variant={"ghost"}
                    size={"lg"}
                    type={"button"}
                >
                    <TrashIcon className={"group-hover:text-destructive"} width={20} height={20}/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[25rem] rounded-6">
                <DialogHeader>
                    <DialogTitle className={"text-center"}>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className={"text-center"}>
                    {description}
                </DialogDescription>
                <div className={"flex w-full justify-stretch gap-3"}>
                    <Button
                        className={"w-full"}
                        variant={"destructive"}
                        onClick={eventHandler}
                        type={"button"}>
                        {confirmBtnText}
                    </Button>
                    <DialogClose asChild>
                        <Button
                            className={"w-full"}
                            variant={"ghost"}
                            type={"button"}>
                            {cancelBtnText}
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}