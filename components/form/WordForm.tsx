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

export default function WordForm({
    children, form, onSubmit, className = "columns-1 lg:columns-2 space-y-5"
}: {
    children?: React.ReactNode,
    form: UseFormReturn<z.infer<typeof saveWordCardRequest>>
    onSubmit: (values: z.infer<typeof saveWordCardRequest>) => void
    className?: string
}) {
    const t = useTranslations()

    console.log("WordFormがレンダリングされたようだ")
    const isMediumDevice = useMediaQuery('(max-width:1023px)')

    return (
        <>
            <Form {...form}>
                <form id={"word-form"} 
                      autoComplete={"off"}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className={cn("w-full h-full px-4 pt-4 sm:px-6 sm:pt-2 pb-6 gap-x-12", className)}>

                    <FormField
                        control={form.control}
                        name="word"
                        render={({ field }) => (
                            <FloatInput
                                className={"text-2xl font-semibold h-14 lg:h-16"}
                                description={t('WordSubmitForm.word_description')}
                                labelClassName={"text-2xl"}
                                limit={50}
                                label={t('WordSubmitForm.word')} {...field}
                            />
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="pos"
                        render={({ field }) => (
                            <FormSelect fieldValue={field.value} onChange={field.onChange}/>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phonetics"
                        render={({ field }) => (
                            <FloatInput
                                className={"text-base h-12 lg:h-14"}
                                description={t('WordSubmitForm.phonetics_description')}
                                limit={80}
                                label={t('WordSubmitForm.phonetics')} {...field}
                            />
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="definition"
                        render={({ field }) => (
                            <FloatInput
                                className={"text-base h-12 lg:h-14"}
                                // parentClass={"break-after-column"}
                                description={t('WordSubmitForm.definition_description')}
                                limit={200}
                                label={t('WordSubmitForm.definition')} {...field}
                            />
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="example"
                        render={({ field }) => (
                            <FloatTextarea
                                className={"text-base "}
                                parentClass={"break-before-auto"}
                                description={t('WordSubmitForm.example_description')}
                                limit={200}
                                label={t('WordSubmitForm.example')} {...field}
                                rows={isMediumDevice ? 2 : 3}
                            />
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FloatTextarea
                                className={"text-base"}
                                description={t('WordSubmitForm.notes_description')}
                                limit={500}
                                label={t('WordSubmitForm.notes')} {...field}
                                rows={isMediumDevice ? 2 : 4}
                            />
                        )}
                    />

                    <div className={"h-12"}/>
                    {children}
                </form>
            </Form>
        </>
    )
}