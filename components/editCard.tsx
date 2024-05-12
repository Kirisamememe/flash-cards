import React, { SetStateAction, useState, useTransition } from "react";
import { FormError } from '@/components/formError';
import { deleteByIdFromLocal } from "@/app/lib/indexDB/indexDB";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import WordForm from "@/components/wordForm";
import { WordCard } from "@/types/WordCard"
import {useTranslations} from "next-intl";
import DestructiveDialog from "@/components/ui/dialog/destructiveDialog";
import { saveCardToLocal } from "@/app/lib/indexDB/saveToLocal";


export function EditWordCard({
    children,
    userId,
    wordData,
    setOpen,
    setReload,
    setInterval,
    setCurrentIndex
}: {
    children?: React.ReactNode,
    userId: string | undefined,
    wordData?: WordCard | null,
    setOpen?: React.Dispatch<SetStateAction<boolean>>,
    setReload?: React.Dispatch<SetStateAction<boolean>>,
    setInterval?: React.Dispatch<SetStateAction<number>>,
    setCurrentIndex?: React.Dispatch<SetStateAction<number>>
}) {
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const t1 = useTranslations('WordSubmitForm')
    const t2 = useTranslations('IndexDB')
    const { toast } = useToast()

    const wordCardSaveRequest = z.object({
        id: z.string().cuid2().optional(),
        phonetics: z.string().max(80, t1('phonetics_valid_max')).trim().optional(),
        word: z.string().min(1, t1('word_valid_min')).max(20, t1('word_valid_max')).trim(),
        partOfSpeech: z.string().optional(),
        definition: z.string().min(1, t1('definition_valid_min')).max(100, t1('definition_valid_max')).trim(),
        example: z.string().max(200, t1('example_valid_max')).trim().optional(),
        notes: z.string().max(500, t1('notes_valid_max')).trim().optional(),
        is_learned: z.boolean().default(false),
        created_at: z.date().default(new Date()),
        updated_at: z.date().default(new Date()),
        synced_at: z.date().optional(),
        learned_at: z.date().optional(),
        retention_rate: z.number().max(100).default(0),
        author: z.string().cuid2().optional(),
        is_deleted: z.boolean().default(false)
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
            author: wordData?.author || userId,
            is_deleted: wordData?.is_deleted
        },
        mode: "onChange"
    })

    function onSubmit(values: z.infer<typeof wordCardSaveRequest>) {
        setError("")
        startTransition(async () => {
            console.log("フォームをサブミット")
            console.log(values)
            const result = await saveCardToLocal(userId, values)

            if (!result.isSuccess) {
                setError(t1(result.error.message));
                return;
            }
            else {
                if (values.id === undefined && setCurrentIndex){ // 新しく追加された単語
                    setCurrentIndex(0)
                }
                else { // 既存の単語
                    const userInterval = localStorage.getItem("interval")
                    if (userInterval && setInterval) setInterval(parseInt(userInterval))
                    else if(setInterval) setInterval(1000)
                    if (setOpen) setOpen(false)
                }
                if (setReload) setReload(prev => !prev)

                form.reset({
                    id: undefined,
                    phonetics: "",
                    word: "",
                    partOfSpeech: "",
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

            const result = await deleteByIdFromLocal(wordData)

            if (!result.isSuccess) {
                setError(result.error.message);
                return;
            }
            else if (setInterval && setReload) {
                setInterval(1000)
                setReload(prev => !prev)
                setOpen && setOpen(false)
            }

            toast({
                variant: "default",
                title: t2('deleteCard')
            });
            console.log("削除できたぜ")
        })
    }

    // TODO 削除のダイアログを部品化及びi18n対応

    return (
        <WordForm
            userId={userId}
            form={form}
            onSubmit={onSubmit}
        >
            <FormError className={"mb-4"} message={error} />
            <Button className={"mr-3"} size={"lg"} type="submit" disabled={isPending}>{t1('save')}</Button>
            {children}
            {form.getValues().id &&
                <DestructiveDialog
                    eventHandler={handleDelete}
                    title={t1("delete_confirm_title")}
                    description={t1("delete_confirm_description")}
                    confirmBtnText={t1("yes")}
                    cancelBtnText={t1("no")}
                />}
        </WordForm>
    )
}