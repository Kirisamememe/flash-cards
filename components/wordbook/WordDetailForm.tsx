import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveWordCardRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveCardToLocal } from "@/app/lib/indexDB/saveToLocal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { WordDataMerged } from "@/types/WordIndexDB";
import WordForm from "@/components/form/WordForm";
import { FormError } from "@/components/ui/formError";

export default function WordDetailForm({ wordData }: { wordData: WordDataMerged }) {

    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const isEditing = useWordbookStore((state) => state.isEditing)
    const userInfo = useWordbookStore((state) => state.userInfo)
    const currentIndex = useWordbookStore((state) => state.currentIndex)
    const setWord = useWordbookStore((state) => state.setWord)
    const poses = useWordbookStore((state) => state.poses)

    const [dialogOpen, setDialogOpen] = useState(false)

    const t = useTranslations('WordSubmitForm')

    const form = useForm<z.infer<typeof saveWordCardRequest>>({
        resolver: zodResolver(saveWordCardRequest),
        defaultValues: {
            ...wordData,
            partOfSpeech: wordData.partOfSpeech?.id
        },
        mode: "onChange"
    })

    function onSubmit(values: z.infer<typeof saveWordCardRequest>) {
        startTransition(async () => {
            console.log("フォームをサブミット")
            console.log(`提出したもの：${values}`)
            const result = await saveCardToLocal(userInfo?.id, values)

            if (!result.isSuccess) {
                toast({
                    variant: "destructive",
                    title: t('saved'),
                    description: result.error.message
                });
                return;
            }
            else {
                setWord(result.data)

                form.reset({
                    id: undefined,
                    word: undefined,
                    phonetics: undefined,
                    partOfSpeech: undefined,
                    definition: undefined,
                    example: undefined,
                    notes: undefined,
                    created_at: undefined,
                    updated_at: undefined,
                })
            }
            toast({
                variant: "default",
                title: t('saved')
            });
        })
    }

    useEffect(() => {
        form.reset()
    }, [currentIndex, form]);

    return (
        <WordForm form={form} onSubmit={onSubmit} className={"flex flex-col w-full px-0 lg:gap-6"}>
            <FormError className={"mb-4"} message={"error"} />
        </WordForm>



        // <Form {...form}>
        //     <form className={"flex flex-col my-3 w-full gap-8"}>
        //
        //         <FormField
        //             control={form.control}
        //             name="word"
        //             render={({ field }) => (
        //                 <FloatInput
        //                     className={"text-2xl px-4 font-semibold h-20"}
        //                     label={"Word"}
        //                     {...field}
        //                 />
        //             )}
        //         />
        //         <FormField
        //             control={form.control}
        //             name="phonetics"
        //             render={({ field }) => (
        //                 <FloatInput
        //                     className={"text-base px-4 h-16"}
        //                     label={"Phonetics"}
        //                     {...field}
        //                 />
        //             )}
        //         />
        //         <div className={"flex gap-3 justify-between items-end"}>
        //             <FormField
        //                 control={form.control}
        //                 name="partOfSpeech"
        //                 render={({ field }) => (
        //                     <FormItem className={"w-full"}>
        //                         <FormLabel className={"ml-1"}>{t('part_of_speech')}</FormLabel>
        //                         <FormControl>
        //                             <Select
        //                                 value={field.value} // この値は、実際に下に存在する値しか入らないようになっている
        //                                 onValueChange={field.onChange}
        //                                 disabled={isPending}
        //                             >
        //                                 <SelectTrigger disabled={poses.length <= 0} className="w-full">
        //                                     <SelectValue
        //                                         placeholder={poses.length > 0 ? t('part_of_speech_placeholder') : t('no_part_of_speech')}/>
        //                                 </SelectTrigger>
        //                                 {poses.length > 0 && <SelectContent className={"w-full"}>
        //                                     {poses.map((value) => (
        //                                         <SelectItem
        //                                             key={value.id}
        //                                             value={value.id}
        //                                         >
        //                                             {value.partOfSpeech}
        //                                         </SelectItem>
        //                                     ))}
        //                                 </SelectContent>}
        //                             </Select>
        //                         </FormControl>
        //                         <FormMessage className={"ml-1"}/>
        //                     </FormItem>
        //                 )}
        //             />
        //             <Button onClick={() => setDialogOpen(true)} variant={"coloredOutline"} type={"button"}>{t("add")}</Button>
        //         </div>
        //
        //
        //
        //             <FormField
        //                 control={form.control}
        //                 name="definition"
        //                 render={({ field }) => (
        //                     <FloatInput
        //                         className={"text-base px-4 h-16"}
        //                         label={"Definition"}
        //                         {...field}
        //                     />
        //                 )}
        //             />
        //     </form>
        // </Form>
    )
}