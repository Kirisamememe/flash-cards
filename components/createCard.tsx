// import React, {SetStateAction, useState, useTransition} from "react";
// import { FormError } from '@/components/form-error';
// import {addCard} from "@/app/lib/indexDB";
// import {Button} from "@/components/ui/button";
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import {toast} from "sonner";
// import { wordCardSchema } from "@/schemas";
// import WordForm from "@/components/ui/wordForm";
// import {WordCard} from "@/components/ui/wordCard";
//
// export function CreateWordCard({children, setCurrentIndex, setWords}: {
//     children?: React.ReactNode,
//     setCurrentIndex: React.Dispatch<SetStateAction<number>>,
//     setWords: React.Dispatch<SetStateAction<WordCard[]>>
// }) {
//     const [error, setError] = useState<string | undefined>('');
//     const [isPending, startTransition] = useTransition();
//
//     const form = useForm<z.infer<typeof wordCardSchema>>({
//         resolver: zodResolver(wordCardSchema),
//         defaultValues: {
//             phonetics: "",
//             word: "",
//             definition: "",
//             example: "",
//             notes: ""
//         },
//     })
//
//     function onSubmit(values: z.infer<typeof wordCardSchema>) {
//         setError("")
//         startTransition(async () => {
//             const result = await addCard(values)
//
//             if (!result.isSuccess) {
//                 setError(result.error.messages);
//                 return;
//             }
//             else {
//                 setWords(prev => [result.data, ...prev])
//                 setCurrentIndex(0)
//
//                 form.reset({
//                     phonetics: "",
//                     word: "",
//                     definition: "",
//                     example: "",
//                     notes: ""
//                 })
//             }
//
//             toast.success(result.messages);
//         })
//
//         console.log(values)
//     }
//
//     return (
//         <WordForm form={form} onSubmit={onSubmit}>
//             <FormError messages={error} />
//             <Button className={"mr-3"} type="submit" disabled={isPending}>Submit</Button>
//             {children}
//         </WordForm>
//     )
// }