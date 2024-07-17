// import React, { useState, useTransition } from "react";
// import { Button } from "@/components/ui/button";
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { useToast } from "@/components/ui/use-toast"
// import WordForm from "@/components/form/WordForm";
// import { useTranslations } from "next-intl";
// import { saveWordCardRequest } from "@/types";
// import { useWordbookStore } from "@/providers/wordbook-store-provider";

// export function AddWordCard({ children, }: { children?: React.ReactNode, }) {
//     console.log("AddWordCardがレンダリングされたようだ")

//     const [error, setError] = useState<string | undefined>('');
//     const [isPending, startTransition] = useTransition();
//     const t1 = useTranslations('WordSubmitForm')
//     const t2 = useTranslations('IndexDB')
//     const { toast } = useToast()

//     const userInfo = useWordbookStore((state) => state.userInfo)
//     const addWord = useWordbookStore((state) => state.addWord)
//     const setCurrentIndex = useWordbookStore((state) => state.setCurrentIndex)

//     const form = useForm<z.infer<typeof saveWordCardRequest>>({
//         resolver: zodResolver(saveWordCardRequest),
//         defaultValues: {},
//         mode: "onChange"
//     })

//     function onSubmit(values: z.infer<typeof saveWordCardRequest>) {
//         setError("")
//         startTransition(async () => {
//             console.log("フォームをサブミット")
//             console.log(values)
//             const result = await saveCardToLocal(userInfo?.id, values)

//             if (!result.isSuccess) {
//                 setError(t1(result.error.message));
//                 return;
//             }
//             else {
//                 addWord(result.data)

//                 if (values.id === undefined){ // 新しく追加された単語
//                     setCurrentIndex(0)
//                 }

//                 form.reset({
//                     word: undefined,
//                     phonetics: undefined,
//                     pos: "UNDEFINED",
//                     definition: undefined,
//                     example: undefined,
//                     notes: undefined,
//                     created_at: undefined,
//                     updated_at: undefined,
//                 })
//             }
//             toast({
//                 variant: "default",
//                 title: t2('saved')
//             });
//         })
//     }

//     return (
//         <WordForm form={form} onSubmit={onSubmit}>
//             {children}
//             {/*このchildrenはキャンセルボタン*/}
//             <Button className={""} size={"lg"} type="submit" disabled={isPending}>{t1('save')}</Button>
//         </WordForm>
//     )
// }