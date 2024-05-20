import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import React, { SetStateAction, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { partOfSpeech } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { savePartOfSpeechToLocal } from "@/app/lib/indexDB/saveToLocal";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/use-toast";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/dialog/dialog";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/formError";
import { Button } from "@/components/ui/button";

export default function PosForm({
    newPOS,
    setNewPOS
}: {
    newPOS: string
    setNewPOS: React.Dispatch<SetStateAction<string>>
}) {

    const t = useTranslations('WordSubmitForm')
    const t2 = useTranslations('IndexDB')

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>('');


    console.log("WordFormがレンダリングされたようだ")

    const { toast } = useToast()

    const userInfo = useWordbookStore((state) => state.userInfo)
    const addPos = useWordbookStore((state) => state.addPos)
    const isAddingPos = useWordbookStore((state) => state.isAddingPos)
    const setIsAddingPos = useWordbookStore((state) => state.setIsAddingPos)

    const partOfSpeechForm = useForm<z.infer<typeof partOfSpeech>>({
        resolver: zodResolver(partOfSpeech),
        defaultValues: {
            //この中身はindexDB.tsに送信される
            id: "",
            partOfSpeech: "",
            author: userInfo?.id,
            is_deleted: false,
            created_at: undefined,
            updated_at: undefined,
            synced_at: undefined
        },
    })


    const submitPartOfSpeech = (values: z.infer<typeof partOfSpeech>) => {
        startTransition(async () => {
            const result = await savePartOfSpeechToLocal(values)

            if (!result.isSuccess) {
                setError(result.error.message);
                toast({
                    variant: "destructive",
                    title: t2('saved'),
                    description: error
                })
                return;
            }
            else {
                // form.setValue("partOfSpeech", result.data.toString())
                addPos({ ...values, id: result.data.toString(), author: userInfo?.id, synced_at: undefined })
                // コンテキストの更新により、コンポーネントの再レンダリングが確定する
                setIsAddingPos(false)
                setNewPOS(result.data.toString())
                // ここでsetValueは実行しても、UIはまだまだ未更新だから、プルダンは古い状態のまま。
                // だから必然的に、対応のオプションが見つけられず、Selectフィールドは変わらない
                // だから再レンダリング後も、必然的にフィールドは更新されない
                console.log(result.data.toString())
                console.log("newPos1:")
                console.log(newPOS)

                // setReload(prev => !prev)
                partOfSpeechForm.reset({
                    id: undefined,
                    partOfSpeech: "",
                    author: userInfo?.id,
                    is_deleted: false,
                    created_at: undefined,
                    updated_at: undefined,
                    synced_at: undefined
                })
                console.log(result)
                toast({
                    title: t2('saved'),
                    description: t2('saved')
                })
            }
        })
        // const POSValue = form.watch("partOfSpeech")
        // console.log("今のPOSは：")
        // console.log(POSValue ? POSValue : "からっぽよ")
    }


    return (
        <Dialog open={isAddingPos} onOpenChange={setIsAddingPos}>
            <DialogContent className="max-w-96 rounded-6">
                <DialogHeader>
                    <DialogTitle>{t('part_of_speech_title')}</DialogTitle>
                </DialogHeader>
                <Form {...partOfSpeechForm}>
                    <form autoComplete={"off"}
                          className={"mt-2"}
                          onSubmit={partOfSpeechForm.handleSubmit(submitPartOfSpeech)}>
                        <FormField
                            control={partOfSpeechForm.control}
                            name="partOfSpeech"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input className={"mb-5"} placeholder={t("part_of_speech_placeholder")} {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormError message={error}/>
                        <DialogFooter className={"flex-row justify-between gap-3"}>
                            <Button disabled={isPending} className={"w-full"} type={"submit"}>{t('save')}</Button>
                            <DialogClose asChild>
                                <Button className={"w-full"} variant={"secondary"} type={"button"}>{t('cancel')}</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}