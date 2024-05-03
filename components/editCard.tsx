import React, { SetStateAction, useState, useTransition } from "react";
import { FormError } from '@/components/form-error';
import { deleteById, saveCard } from "@/app/lib/indexDB";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";
import { wordCardSchema } from "@/schemas";
import WordForm from "@/components/wordForm";
import { WordCard } from "@/components/wordCard";
import { TrashIcon } from "@radix-ui/react-icons";

export type SubmitForm = {
    submit: string
    word: string
    phonetics: string
    definition: string
    example: string
    notes: string
    word_placeholder: string
    phonetics_placeholder: string
    definition_placeholder: string
    example_placeholder: string
    notes_placeholder: string
}

export function EditWordCard({ children, submitFormText, wordData, setIsEditing, setReload, setInterval, setCurrentIndex }: {
    children?: React.ReactNode,
    submitFormText: SubmitForm,
    wordData?: WordCard,
    setIsEditing: React.Dispatch<SetStateAction<boolean>>,
    setReload: React.Dispatch<SetStateAction<boolean>>,
    setInterval: React.Dispatch<SetStateAction<number>>,
    setCurrentIndex: React.Dispatch<SetStateAction<number>>
}) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof wordCardSchema>>({
        resolver: zodResolver(wordCardSchema),
        defaultValues: {
            id: wordData?.id,
            phonetics: wordData?.phonetics,
            word: wordData?.word,
            definition: wordData?.definition,
            example: wordData?.example,
            notes: wordData?.notes
        },
    })

    function onSubmit(values: z.infer<typeof wordCardSchema>) {
        setError("")
        startTransition(async () => {
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
                    notes: ""
                })
            }

            toast.success(result.message);
        })

        console.log(values)
    }

    const handleDelete = () => {
        console.log("削除開始")
        setError("")

        startTransition(async () => {
            const id = wordData && wordData.id
            if (!id) return

            const result = await deleteById(id)

            if (!result.isSuccess) {
                setError(result.error.message);
                return;
            }
            else {
                setInterval(1000)
                setReload(prev => !prev)
                setIsEditing && setIsEditing(false)
            }

            toast.success(result.message);
            console.log("削除できたぜ")
        })
    }

    return (
        <WordForm submitFormText={submitFormText} form={form} onSubmit={onSubmit}>
            <FormError message={error} />
            <Button className={"mr-3"} type="submit" disabled={isPending}>{submitFormText.submit}</Button>
            {children}
            {form.getValues().id &&
                <Button
                    className={"fixed right-10 group hover:bg-destructive/10 px-2"}
                    variant={"ghost"}
                    type={"button"}
                    onClick={handleDelete}
                >
                <TrashIcon className={"group-hover:text-destructive"} width={20} height={20}/>
            </Button>}
        </WordForm>
    )
}