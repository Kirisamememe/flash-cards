import {Form, FormLabel, FormControl, FormDescription, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import React from "react";
import {UseFormReturn} from "react-hook-form";
import { z } from "zod"
import {wordCardSchema} from "@/schemas";

export default function WordForm({children, form, onSubmit}: {
    children: React.ReactNode,
    form: UseFormReturn<z.infer<typeof wordCardSchema>>,
    onSubmit: (values: z.infer<typeof wordCardSchema>) => void
}) {
    return (
        <div
            className={"fixed max-w-96 w-full h-fit p-6 top-20 right-6 bg-background rounded-4 dark:shadow-primary/[0.05] dark:ring-primary/10 shadow-2xl ring-1 ring-foreground/[0.05]"}>
            <Form {...form}>
                <form autoComplete={"off"}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4">
                    <FormField
                        control={form.control}
                        name="word"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-2"}>Word</FormLabel>
                                <FormControl>
                                    <Input className={"text-lg font-semibold h-14"}
                                           placeholder="Enter a word" {...field} />
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
                                <FormLabel className={"ml-2"}>Phonetics</FormLabel>
                                <FormControl>
                                    <Input className={""}
                                           placeholder="Enter phonetic" {...field} />
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
                                <FormLabel className={"ml-2"}>Definition</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              placeholder="Enter a definition" {...field} />
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
                                <FormLabel className={"ml-2"}>Example</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              placeholder="Enter an example" {...field} />
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
                                <FormLabel className={"ml-2"}>Notes</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              rows={6}
                                              placeholder="Enter notes" {...field} />
                                </FormControl>
                                <FormDescription
                                    className={"text-xs text-muted-foreground/50"}>例文の翻訳や、単語の記憶法など</FormDescription>
                                <FormMessage/>
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
                    <div className={"pt-4"}>
                        {children}
                    </div>
                </form>
            </Form>
        </div>
    )
}