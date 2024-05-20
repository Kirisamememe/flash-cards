import { Form, FormField } from "@/components/ui/form";
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod"
import { saveWordCardRequest } from "@/types";
import { useTranslations } from "next-intl";
import { FloatInput } from "@/components/ui/FloatInput";
import { FloatTextarea } from "@/components/ui/FloatTextarea";
import useMediaQuery from "@mui/material/useMediaQuery";
import { cn } from "@/app/lib/utils";
import FormSelect from "@/components/ui/FormSelect";
import PosForm from "@/components/form/PosForm";

export default function WordForm({ children, form, onSubmit, className }: {
    children?: React.ReactNode,
    form: UseFormReturn<z.infer<typeof saveWordCardRequest>>
    onSubmit: (values: z.infer<typeof saveWordCardRequest>) => void
    className?: string
}) {
    const t = useTranslations('WordSubmitForm')

    const [newPOS, setNewPOS] = useState("")

    const POSValueOutside = form.watch("partOfSpeech")
    console.log("今のPOSはなんだ：")
    console.log(POSValueOutside ? POSValueOutside : "からっぽよ")

    const isSmallDevice = useMediaQuery('(max-width:1023px)')

    console.log("WordFormがレンダリングされたようだ")

    useEffect(() => {
        // console.log("＝＝＝＝＝＝＝WordFormのuseEffectが実行されました＝＝＝＝＝＝")
        if (newPOS !== "") {
            form.setValue("partOfSpeech", newPOS)
        }
    }, [form, newPOS]);


    // TODO 品詞を編集する機能

    return (
        <>
            <Form {...form}>
                <form autoComplete={"off"}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className={cn("grid grid-cols-1 lg:grid-cols-2 w-full justify-stretch px-2 mt-5 lg:mt-8 gap-6 lg:gap-12", className)}>
                    <div className={"flex flex-col w-full gap-6"}>
                        <FormField
                            control={form.control}
                            name="word"
                            render={({ field }) => (
                                <FloatInput
                                    className={"text-2xl font-semibold h-14 lg:h-16"}
                                    description={t('word_description')}
                                    labelClassName={"text-2xl"}
                                    limit={50}
                                    label={t('word')} {...field}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="partOfSpeech"
                            render={({ field }) => (
                                <FormSelect fieldValue={field.value} onChange={field.onChange} newPOS={newPOS} setNewPOS={setNewPOS}/>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phonetics"
                            render={({ field }) => (
                                <FloatInput
                                    className={"text-base h-12 lg:h-14"}
                                    description={t('phonetics_description')}
                                    limit={80}
                                    label={t('phonetics')} {...field}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="definition"
                            render={({ field }) => (
                                <FloatInput
                                    className={"text-base h-12 lg:h-14"}
                                    description={t('definition_description')}
                                    limit={200}
                                    label={t('definition')} {...field}
                                />
                            )}
                        />
                    </div>

                    <div className={"flex flex-col w-full h-full justify-between"}>
                        <div className={"space-y-6 h-full"}>
                            <FormField
                                control={form.control}
                                name="example"
                                render={({ field }) => (
                                    <FloatTextarea
                                        className={"text-base"}
                                        description={t('example_description')}
                                        limit={200}
                                        label={t('example')} {...field}
                                    />
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FloatTextarea
                                        className={"text-base h-full"}
                                        description={t('notes_description')}
                                        limit={500}
                                        label={t('notes')} {...field}
                                        rows={isSmallDevice ? 2 : 4}
                                    />
                                )}
                            />
                        </div>
                        {children}
                    </div>
                </form>
            </Form>
            <PosForm newPOS={newPOS} setNewPOS={setNewPOS}/>
        </>

    )
}