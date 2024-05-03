import {Form, FormLabel, FormControl, FormDescription, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import React from "react";
import {UseFormReturn} from "react-hook-form";
import { z } from "zod"
import {wordCardSchema} from "@/schemas";
import {SubmitForm} from "@/components/editCard";

export default function WordForm({submitFormText, children, form, onSubmit}: {
    submitFormText: SubmitForm
    children: React.ReactNode,
    form: UseFormReturn<z.infer<typeof wordCardSchema>>,
    onSubmit: (values: z.infer<typeof wordCardSchema>) => void
}) {
    return (
        <div
            className={"fixed max-w-96 w-full h-fit p-6 bottom-32 right-6 bg-background rounded-4 dark:shadow-primary/[0.05] dark:ring-primary/10 shadow-2xl ring-1 ring-foreground/[0.05]"}>
            <Form {...form}>
                <form autoComplete={"off"}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-3">
                    <FormField
                        control={form.control}
                        name="word"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>{submitFormText.word}</FormLabel>
                                <FormControl>
                                    <Input className={"text-lg font-semibold h-14"}
                                           placeholder={submitFormText.word_placeholder} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phonetics"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>{submitFormText.phonetics}</FormLabel>
                                <FormControl>
                                    <Input className={""}
                                           placeholder={submitFormText.phonetics_placeholder} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="definition"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>{submitFormText.definition}</FormLabel>
                                <FormControl>
                                    <Input className={"resize-none"}
                                              placeholder={submitFormText.definition_placeholder} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="example"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>{submitFormText.example}</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              rows={3}
                                              placeholder={submitFormText.example_placeholder} {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>{submitFormText.notes}</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              rows={3}
                                              placeholder={submitFormText.notes_placeholder} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/*デバッグ用*/}
                    {/*<FormField*/}
                    {/*    control={form.control}*/}
                    {/*    name="id"*/}
                    {/*    render={({field}) => (*/}
                    {/*        <FormItem>*/}
                    {/*            <FormControl>*/}
                    {/*                <Input disabled={true} {...field} />*/}
                    {/*            </FormControl>*/}
                    {/*            <FormMessage/>*/}
                    {/*        </FormItem>*/}
                    {/*    )}*/}
                    {/*/>*/}
                    <div className={"pt-2"}>
                        {children}
                    </div>
                </form>
            </Form>
        </div>
    )
}