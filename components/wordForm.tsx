import { Form, FormLabel, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormError } from '@/components/formError';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    // DialogDescription,
    // DialogTrigger,
} from "@/components/ui/dialog/dialog"
import React, { useEffect, useState, useTransition } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod"
import { wordCardSaveRequest } from "@/schemas";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PartOfSpeechLocal } from "@/types/WordCard";
import { getPartOfSpeechesFromLocal, savePartOfSpeechToLocal } from "@/app/lib/indexDB";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast"

export default function WordForm({ children, form, onSubmit, userId}: {
    children: React.ReactNode,
    form: UseFormReturn<z.infer<typeof wordCardSaveRequest>>,
    onSubmit: (values: z.infer<typeof wordCardSaveRequest>) => void
    userId: string | undefined
}) {
    const t = useTranslations('WordSubmitForm')
    const t2 = useTranslations('IndexDB')
    const [isPending, startTransition] = useTransition();
    const [partOfSpeeches, setPartOfSpeeches] = useState<PartOfSpeechLocal[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [error, setError] = useState<string | undefined>('');
    const [reLoad, setReload] = useState(false)

    const { toast } = useToast()

    const partOfSpeech = z.object({
        id: z.string().optional(),
        partOfSpeech: z.string().min(1, t("partOfSpeech_valid_min")).max(20, t("partOfSpeech_valid_max")),
        author: z.string().optional(),
        is_deleted: z.boolean(),
        created_at: z.date().default(new Date()),
        updated_at: z.date().default(new Date()),
        synced_at: z.date().optional()
    })

    const partOfSpeechForm = useForm<z.infer<typeof partOfSpeech>>({
        resolver: zodResolver(partOfSpeech),
        defaultValues: {
            //この中身はindexDB.tsに送信される
            id: "",
            partOfSpeech: "",
            author: userId,
            is_deleted: false,
            created_at: undefined,
            updated_at: undefined,
            synced_at: undefined
        },
    })


    useEffect(() => {
        const fetchPartOfSpeeches = async () => {
            const result: PartOfSpeechLocal[] = await getPartOfSpeechesFromLocal().then()
            setPartOfSpeeches(result)
        }
        fetchPartOfSpeeches().catch(e => console.error(e))
    }, [reLoad]);


    const submitPartOfSpeech = (values: z.infer<typeof partOfSpeech>) => {
        startTransition(async () => {
            const result = await savePartOfSpeechToLocal(values)

            if (!result.isSuccess) {
                setError(result.message);
                toast({
                    variant: "destructive",
                    title: t2('saved'),
                    description: error
                })
                return;
            }
            else {
                setDialogOpen(false)
                setReload(prev => !prev)
                partOfSpeechForm.reset({
                    id: "",
                    partOfSpeech: "",
                    author: userId,
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
    }

    // TODO 品詞を編集する機能
    // TODO 連続で単語を作成する場合、品詞が反映されない問題

    // const onSelectChange = (value: string) => {
    //     form.setValue('partOfSpeech', value)
    // }

    return (
        <>
            {/*メインフォーム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/}
            <Form {...form}>
                <form autoComplete={"off"}
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-3">
                    <FormField
                        control={form.control}
                        name="word"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-1"}>{t('word')}</FormLabel>
                                <FormControl>
                                    <Input className={"text-lg font-semibold h-14"}
                                           placeholder={t('word_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage className={"ml-1"}/>
                            </FormItem>
                        )}
                    />
                    <div className={"flex gap-3 justify-between items-end"}>
                        <FormField
                            control={form.control}
                            name="partOfSpeech"
                            render={({field}) => (
                                <FormItem className={"w-full"}>
                                    <FormLabel className={"ml-1"}>{t('part_of_speech')}</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isPending}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger disabled={partOfSpeeches.length <= 0} className="w-full">
                                                <SelectValue
                                                    placeholder={partOfSpeeches.length > 0 ? t('part_of_speech_placeholder') : t('no_part_of_speech')} />
                                            </SelectTrigger>
                                            {partOfSpeeches.length > 0 && <SelectContent className={"w-full"}>
                                                {partOfSpeeches.map((value) => (
                                                    <SelectItem
                                                        key={value.id}
                                                        value={value.id}
                                                    >
                                                        {value.partOfSpeech}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>}
                                        </Select>
                                    </FormControl>
                                    <FormMessage className={"ml-1"}/>
                                </FormItem>
                            )}
                        />
                        <Button onClick={() => setDialogOpen(true)} variant={"coloredOutline"} type={"button"}>{t("add")}</Button>
                    </div>

                    <FormField
                        control={form.control}
                        name="phonetics"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-1"}>{t('phonetics')}</FormLabel>
                                <FormControl>
                                     <Input className={""}
                                           placeholder={t('phonetics_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage className={"ml-1"}/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="definition"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-1"}>{t('definition')}</FormLabel>
                                <FormControl>
                                    <Input className={"resize-none"}
                                           placeholder={t('definition_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage className={"ml-1"} />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="example"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-1"}>{t('example')}</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              rows={3}
                                              placeholder={t('example_placeholder')} {...field} />
                                </FormControl>
                                <FormMessage className={"ml-1"}/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className={"ml-1"}>{t('notes')}</FormLabel>
                                <FormControl>
                                    <Textarea className={"resize-none"}
                                              rows={3}
                                              placeholder={t('notes_placeholder')} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className={"pt-2"}>
                        {children}
                    </div>
                </form>
            </Form>

            {/*品詞追加用のフォーム＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-96 rounded-6">
                    <DialogHeader>
                        <DialogTitle>{('Add a Part of Speech')}</DialogTitle>
                    </DialogHeader>
                    <Form {...partOfSpeechForm}>
                        <form autoComplete={"off"}
                              className={"mt-2"}
                              onSubmit={partOfSpeechForm.handleSubmit(submitPartOfSpeech)}>
                            <FormField
                                control={partOfSpeechForm.control}
                                name="partOfSpeech"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input className={"mb-5"} {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormError message={error} />
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
        </>

    )
}