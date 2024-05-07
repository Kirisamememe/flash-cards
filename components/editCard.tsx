import React, { SetStateAction, useState, useTransition } from "react";
import { FormError } from '@/components/form-error';
import { deleteById, saveCard } from "@/app/lib/indexDB";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import WordForm from "@/components/wordForm";
import { WordCard } from "@/types/WordCard"
import { TrashIcon } from "@radix-ui/react-icons";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {useTranslations} from "next-intl";


export function EditWordCard({
    children,
    userId,
    wordData,
    setIsEditing,
    setReload,
    setInterval,
    setCurrentIndex
}: {
    children?: React.ReactNode,
    userId: string | undefined,
    wordData : WordCard | null,
    setIsEditing: React.Dispatch<SetStateAction<boolean>>,
    setReload: React.Dispatch<SetStateAction<boolean>>,
    setInterval: React.Dispatch<SetStateAction<number>>,
    setCurrentIndex: React.Dispatch<SetStateAction<number>>
}) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const t1 = useTranslations('WordSubmitForm')
    const t2 = useTranslations('IndexDB')
    const { toast } = useToast()

    const wordCardSaveRequest = z.object({
        id: z.string().optional(),
        phonetics: z.string().max(80, t1('phonetics_valid_max')).optional(),
        word: z.string().min(1, t1('word_valid_min')).max(20, t1('word_valid_max')),
        partOfSpeech: z.string().optional(),
        definition: z.string().min(1, t1('definition_valid_min')).max(100, t1('definition_valid_max')),
        example: z.string().max(200, t1('example_valid_max')).optional(),
        notes: z.string().max(500, t1('notes_valid_max')).optional(),
        is_learned: z.boolean(),
        created_at: z.date().optional(),
        updated_at: z.date().optional(),
        synced_at: z.date().optional(),
        learned_at: z.date().optional(),
        retention_rate: z.number().optional(),
        author: z.string().optional(),
        is_deleted: z.boolean()
    })

    const form = useForm<z.infer<typeof wordCardSaveRequest>>({
        resolver: zodResolver(wordCardSaveRequest),
        defaultValues: {
            //この中身はindexDB.tsに送信される
            id: wordData?.id,
            phonetics: wordData?.phonetics,
            word: wordData?.word,
            partOfSpeech: wordData?.partOfSpeech,
            definition: wordData?.definition,
            example: wordData?.example,
            notes: wordData?.notes,
            is_learned: wordData?.is_learned || false,
            created_at: wordData?.created_at,
            updated_at: wordData?.updated_at,
            synced_at: wordData?.synced_at,
            learned_at: wordData?.learned_at,
            retention_rate: wordData?.retention_rate,
            author: userId,
            is_deleted: wordData?.is_deleted || false
        },
    })

    function onSubmit(values: z.infer<typeof wordCardSaveRequest>) {
        setError("")
        startTransition(async () => {
            console.log("フォームをサブミット")
            console.log(values)
            const result = await saveCard(values)

            if (!result.isSuccess) {
                setError(result.error.message);
                return;
            }
            else {
                if (values.id === undefined){ // 新しく追加された単語
                    setCurrentIndex(0)
                }
                else { // 既存の単語
                    const userInterval = localStorage.getItem("interval")
                    if (userInterval) setInterval(parseInt(userInterval))
                    else setInterval(1000)
                    setIsEditing(false)
                }
                setReload(prev => !prev)

                form.reset({
                    id: undefined,
                    phonetics: "",
                    word: "",
                    definition: "",
                    example: "",
                    notes: "",
                    is_learned: false,
                    is_deleted: false,
                    author: userId
                })
            }
            console.log(form)
            toast({
                variant: "default",
                title: t2('saved')
            });
        })

        console.log(values)
    }

    const handleDelete = () => {
        console.log("削除開始")
        setError("")

        startTransition(async () => {
            const id = wordData && wordData.id
            if (!id) return

            const result = await deleteById(wordData)

            if (!result.isSuccess) {
                setError(result.error.message);
                return;
            }
            else {
                setInterval(1000)
                setReload(prev => !prev)
                setIsEditing && setIsEditing(false)
            }

            toast({
                variant: "default",
                title: t2('deleteCard')
            });
            console.log("削除できたぜ")
        })
    }

    return (
        <WordForm
            userId={userId}
            form={form}
            onSubmit={onSubmit}
        >
            <FormError message={error} />
            <Button className={"mr-3"} size={"lg"} type="submit" disabled={isPending}>{t1('save')}</Button>
            {children}
            {form.getValues().id &&
                <Dialog onOpenChange={() => {}}>
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
                    <DialogContent className="max-w-96 sm:max-w-[425px] rounded-6">
                        <DialogHeader>
                            <DialogTitle>{"本当に削除しますか"}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className={"text-center"}>
                            {"削除すると、復元はできません"}
                        </DialogDescription>
                        <div className={"flex w-full justify-stretch gap-3"}>
                            <Button
                                className={"w-full"}
                                variant={"destructive"}
                                onClick={handleDelete}
                                type={"button"}>
                                {"Yes"}
                            </Button>
                            <DialogClose asChild>
                                <Button
                                    className={"w-full"}
                                    variant={"ghost"}
                                    type={"button"}>
                                    {"Cancel"}
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                </Dialog>}
        </WordForm>
    )
}