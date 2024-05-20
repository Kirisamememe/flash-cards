import React, { SetStateAction, useState, useTransition } from "react";
import { FormError } from '@/components/ui/formError';
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import WordForm from "@/components/form/WordForm";
import { useTranslations } from "next-intl";
import DestructiveDialog from "@/components/dialog/DestructiveDialog";
import { saveCardToLocal } from "@/app/lib/indexDB/saveToLocal";
import { saveWordCardRequest } from "@/types";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { WordDataMerged } from "@/types/WordIndexDB";

export function EditWordCard({
    children,
    setOpen, // 編集が終わったらダイアログを閉じたいから必要
    setIsEditing,
    className,
    wordData,
    setCurrentIndex // 単語を追加する時に必要
}: {
    children?: React.ReactNode,
    setOpen?: React.Dispatch<SetStateAction<boolean>>
    setIsEditing?: (value: boolean) => void
    className?: string,
    wordData?: WordDataMerged
    setCurrentIndex?: (num: number) => void
}) {
    console.log("EditWordCardがレンダリングされたようだ")

    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const t1 = useTranslations('WordSubmitForm')
    const t2 = useTranslations('IndexDB')
    const { toast } = useToast()

    const addWord = useWordbookStore((state) => state.addWord)
    const setWord = useWordbookStore((state) => state.setWord)
    const userInfo = useWordbookStore((state) => state.userInfo)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)

    console.log(wordData)

    const formToSave = useForm<z.infer<typeof saveWordCardRequest>>({
        resolver: zodResolver(saveWordCardRequest),
        defaultValues: wordData ? {
            // この中身はindexDB.tsに送信される
            // ここの""がないと、Reactが「A component is changing an uncontrolled input to be controlled.」というエラーを出す。
            // 要はundefinedにしなければいい
            ...wordData,
            partOfSpeech: wordData.partOfSpeech?.id
        } : {},
        mode: "onChange"
    })


    function onSubmitToSave(values: z.infer<typeof saveWordCardRequest>) {
        setError("")
        startTransition(async () => {
            console.log("フォームをサブミット")
            console.log(values)
            const result = await saveCardToLocal(userInfo?.id, values, false, !wordData)

            if (!result.isSuccess) {
                setError(t1(result.error.message));
                return;
            }
            else {
                if (wordData) {
                    setWord(result.data)
                    const localInterval = localStorage.getItem("interval")
                    if (localInterval) setUserInterval(parseInt(localInterval))
                    else setUserInterval(5000)

                    setOpen && setOpen(false)
                    setIsEditing && setIsEditing(false)
                }
                else {
                    addWord(result.data)
                    setCurrentIndex && setCurrentIndex(0)
                }

                formToSave.reset({
                    id: undefined,
                    word: "",
                    phonetics: "",
                    partOfSpeech: "",
                    definition: "",
                    example: "",
                    notes: "",
                    created_at: undefined,
                    updated_at: undefined,
                })
            }
            toast({
                variant: "default",
                title: t2('saved')
            });
        })
    }


    return (
        <WordForm form={formToSave} onSubmit={onSubmitToSave} className={className}>
            <FormError className={"my-2"} message={error}/>
            <div className={"flex justify-between mt-3"}>
                {wordData ?
                    <DestructiveDialog className={""} isPendingParent={isPending}/> :
                    <div className={"size-11"}></div>}
                <div>
                    {children}
                    {/*このchildrenはキャンセルボタン*/}
                    <Button id={"submitFormBtn"} className={"ml-4"} size={"lg"} type="submit" disabled={isPending}>{t1('save')}</Button>
                </div>
            </div>
        </WordForm>
    )
}