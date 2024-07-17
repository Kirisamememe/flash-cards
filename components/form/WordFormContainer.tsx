import React, { SetStateAction, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import WordForm from "@/components/form/WordForm";
import { useTranslations } from "next-intl";
import DestructiveDialog from "@/components/dialog/DestructiveDialog";
import { saveWordCardRequest } from "@/types";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { WordData } from "@/types/WordIndexDB";
import { cn } from "@/app/lib/utils";
import { indexDB } from "@/stores/wordbook-store";

export function WordFormContainer({
    children,
    setOpen, // 編集が終わったらダイアログを閉じたいから必要
    setIsEditing,
    className,
    wordData,
    setCurrentIndex, // 単語を追加する時に必要
    half = true
}: {
    children?: React.ReactNode,
    setOpen?: React.Dispatch<SetStateAction<boolean>>
    setIsEditing?: (value: boolean) => void
    className?: string,
    wordData?: WordData
    setCurrentIndex?: (num: number) => void
    half?: boolean
}) {
    console.log("EditWordCardがレンダリングされたようだ")

    const [isPending, startTransition] = useTransition();
    const t = useTranslations()
    const { toast } = useToast()

    const addWord = useWordbookStore((state) => state.addWord)
    const setWord = useWordbookStore((state) => state.setWord)
    const setUserInterval = useWordbookStore((state) => state.setUserInterval)

    const formToSave = useForm<z.infer<typeof saveWordCardRequest>>({
        resolver: zodResolver(saveWordCardRequest),
        defaultValues: wordData ? {
            // この中身はindexDB.tsに送信される
            // ここの""がないと、Reactが「A component is changing an uncontrolled input to be controlled.」というエラーを出す。
            // 要はundefinedにしなければいい
            ...wordData,
            word: wordData.word.toLowerCase()
        } : {},
        mode: "onChange"
    })


    function onSubmitToSave(values: z.infer<typeof saveWordCardRequest>) {
        startTransition(async () => {
            console.log("フォームをサブミット")
            console.log(values)
            const result = await indexDB.saveCardAndReturn(values)

            if (!result.isSuccess) {
                toast({
                    variant: "destructive",
                    title: t('IndexDB.dbErr'),
                    description: result.error?.detail
                })
                return
            }
            
            if (wordData) {
                if (wordData?.id) {
                    setWord(result.data)
                }
                else {
                    addWord(result.data)
                }

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
                pos: "UNDEFINED",
                definition: "",
                example: "",
                notes: "",
                created_at: undefined,
                updated_at: undefined,
            })

            toast({
                variant: "default",
                title: t('IndexDB.saved')
            })
        })
    }


    return (
        <WordForm form={formToSave} onSubmit={onSubmitToSave} className={className} >
            <div className={cn("absolute flex right-0 bottom-0 justify-between p-[inherit] bg-background/80 lg:bg-transparent rounded-b-4",
                half ? "w-full lg:w-1/2" : "w-full")}>
                {wordData?.id &&
                    <DestructiveDialog isPendingParent={isPending}/>
                }
                <div className={cn(!wordData?.id &&
                    "flex w-full justify-end"
                )}>
                    {/*このchildrenはキャンセルボタン*/}
                    {children}
                    <Button id={"submitFormBtn"} className={"ml-4"} size={"lg"} type="submit" disabled={isPending}>
                        {t('WordSubmitForm.save')}
                    </Button>
                </div>
            </div>
        </WordForm>
    )
}