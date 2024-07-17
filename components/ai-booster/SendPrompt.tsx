import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React, { useState, useTransition } from "react";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ModelList } from "@/types/AIBooster";
import { modelListTuple, onlyProUserModelListTuple, prompts, selectWords } from "@/types/static";
import { cn } from "@/app/lib/utils";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { promptRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";


export function SendPrompt({ 
    handleSend, 
    handleSuspend,
    setOpen
}: { 
    handleSend: (value: z.infer<typeof promptRequest>) => void, 
    handleSuspend: () => void,
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [currentPrompt, setCurrentPrompt] = useState<string>("-1")
    const [currentWordValue, setCurrentWordValue] = useState<string>("-1")
    const [promptWords, setPromptWords] = useState<string[]>([])

    const [promptSelectOpen, setPromptSelectOpen] = useState(false)
    const [wordsSelectOpen, setWordsSelectOpen] = useState(false)

    const AIModel = useWordbookStore((state) => state.AIModel)
    const indexDB = useWordbookStore((state) => state.indexDB)
    const setAIModel = useWordbookStore((state) => state.setAIModel)
    const isPending = useWordbookStore((state) => state.loadingMaterial)

    const form = useForm<z.infer<typeof promptRequest>>({
        resolver: zodResolver(promptRequest),
        defaultValues: {
            prompt: ""
        },
        mode: "onChange"
    })


    const { data: session } = useSession()
    const { toast } = useToast()

    const userId = session?.user?.id
    const role = session?.user?.role
    if (!userId || !role) return


    const handlePromptWords = async (value: string) => {
        setCurrentWordValue(value);

        const words: string[] = []

        switch (value) {
            case "0":
                await indexDB.getPromptWords(userId, "random")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
            case "1":
                await indexDB.getPromptWords(userId, "recent")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
            case "2":
                await indexDB.getPromptWords(userId, "mostForgettable")
                    .then((res) => {
                        if (res.isSuccess) {
                            res.data.map(word => {
                                words.push(word)
                            })
                        }
                    })
                break
        }

        setPromptWords(words)
        form.setValue("prompt", form.getValues("prompt").split("\n")[0] + "\n" + words.join(", "))
        // setRequestPrompt(prev => prev.split("\n")[0] + "\n" + words.join(", "))
    }

    const handlePromptChange = (value: string) => {
        setCurrentPrompt(value)
        const prompt = form.getValues("prompt").split("\n")

        form.setValue("prompt", prompts[Number(value)].prompt + (prompt.length > 1 ? ("\n" + prompt[1]) : ""))
        // setRequestPrompt(prompts[Number(value)].prompt + (prompt.length > 1 ? ("\n" + prompt[1]) : ""))
    }


    return (
        <div className={cn(
            "appear sticky top-28 flex flex-col gap-6 p-4 sm:p-3 sm:pt-1 overflow-auto overflow-x-visible max-h-[calc(100vh-7rem)] h-fit sm:basis-[17rem] lg:basis-80 2xl:basis-[22.5rem] shrink-0 lg:max-w-[40rem] transition-all duration-300"
        )}>
            <h4 className={"text-xl text-foreground font-bold ml-1 my-1"}>{"Input Your Prompts"}</h4>

            <div className={"space-y-3"}>
                <label
                    className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                    <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                    {"Models"}
                </label>
                <Select value={AIModel} onValueChange={(value) => setAIModel(value as ModelList)}>
                    <SelectTrigger
                        className={"h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg lg:text-base [&>span]:line-clamp-none text-start"}>
                        <SelectValue placeholder={"Select a model"}/>
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {modelListTuple.map((model, index) => {
                            const disable = onlyProUserModelListTuple.includes(model as any) && role !== "ADMIN"

                            if (disable) {
                                return (
                                    <TooltipProvider key={`${index}_${model}`}>
                                        <Tooltip>
                                            <TooltipTrigger className={"block w-full"}>
                                                <SelectItem value={"null"}
                                                            disabled={disable}
                                                            className={"py-3 lg:text-base"}>
                                                    {model}
                                                </SelectItem>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{"For paid users only."}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            }
                            return (
                                <SelectItem value={model} key={`${index}_${model}`}
                                            className={"py-3 lg:text-base"}>
                                    {model}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className={"space-y-3"}>
                <label
                    className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                    <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                    {"Quick Prompt"}
                </label>
                <Select defaultValue={"-1"} open={promptSelectOpen} onOpenChange={setPromptSelectOpen}
                        value={currentPrompt} onValueChange={handlePromptChange}>
                    <SelectTrigger
                        onPointerDown={(e) => {
                            e.preventDefault()
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setPromptSelectOpen(p => !p)
                        }}
                        className={"h-auto min-h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg lg:text-base [&>span]:line-clamp-none text-start"}>
                        {currentPrompt === "-1" ? <p>{"Select a Prompt"}</p> :
                            <SelectValue placeholder={"Select a Prompt"}/>}
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {prompts.map((prompt, index) => (
                            <SelectItem value={index.toString()} key={`${index}_${prompt}`}
                                        className={"py-3 lg:text-base max-w-[calc(100vw-2rem)] sm:max-w-[37.5rem]"}>
                                {prompt.description}
                            </SelectItem>
                        ))}

                        {currentPrompt !== "-1" &&
                            <>
                                <SelectSeparator/>
                                <Button variant={"ghost"}
                                        className={"w-full justify-start lg:text-base font-normal gap-2 pl-2 h-12"}
                                        animation={false}
                                        onClick={() => {
                                            setCurrentPrompt("-1")
                                            const promptArr = form.getValues("prompt").split("\n")
                                            const prompt = promptArr.length > 1 ? promptArr[1] : ""
                                            form.setValue("prompt", "\n" + prompt)
                                            setPromptSelectOpen(false)
                                        }}>
                                    <X size={20}/>
                                    {"選択をクリアする"}
                                </Button>
                            </>
                        }
                    </SelectContent>
                </Select>

                <Select defaultValue={"-1"} open={wordsSelectOpen} onOpenChange={setWordsSelectOpen}
                        value={currentWordValue} onValueChange={handlePromptWords}>
                    <SelectTrigger
                        onPointerDown={(e) => {
                            e.preventDefault()
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setWordsSelectOpen(p => !p)
                        }}
                        className={"h-auto min-h-12 pl-4 pr-2 2xl:pl-5 2xl:pr-4 rounded-lg bg-transparent lg:text-base [&>span]:line-clamp-none text-start"}>
                        {currentWordValue === "-1" ? <p>{"Select words"}</p> :
                            <SelectValue asChild placeholder="Select words"
                                         className={"text-sm text-muted-foreground font-semibold"}>
                                <div className={""}>
                                    {promptWords.length ? promptWords.map((word, index) => (
                                        <Badge key={`${index}_${word}`} variant={"coloredSecondary"}
                                               className={"mr-1 sm:mr-1.5 my-0.5 sm:my-[0.1875rem] px-1 py-1 sm:px-1.5 sm:py-1 rounded font-medium text-[0.625rem] sm:text-xs leading-[100%] sm:leading-[100%]"}>{word}</Badge>
                                    )) : <p>{"単語を取得できませんでした"}</p>}
                                </div>
                            </SelectValue>}
                    </SelectTrigger>
                    <SelectContent sideOffset={4} className={"rounded-lg"}>
                        {selectWords.map((val, index) => (
                            <SelectItem value={index.toString()} key={`${index}_${val.value}`}
                                        className={"py-3 lg:text-base max-w-[calc(100vw-2rem)] sm:max-w-[37.5rem]"}>
                                {val.description}
                            </SelectItem>
                        ))}
                        {currentWordValue !== "-1" &&
                            <>
                                <SelectSeparator/>
                                <Button variant={"ghost"}
                                        className={"w-full justify-start lg:text-base font-normal gap-2 pl-2 h-12"}
                                        animation={false}
                                        onClick={() => {
                                            setCurrentWordValue("-1")
                                            const promptArr = form.getValues("prompt").split("\n")
                                            const prompt = promptArr.length > 0 ? promptArr[0] : ""
                                            form.setValue("prompt", prompt)
                                            setWordsSelectOpen(false)
                                        }}>
                                    <X size={20}/>
                                    {"選択をクリアする"}
                                </Button>
                            </>
                        }
                    </SelectContent>
                </Select>
            </div>

            <Form {...form}>
                <form className={"flex flex-col gap-3"} onSubmit={form.handleSubmit(handleSend)}>
                    <label
                        className={"flex items-center ml-1.5 gap-2.5 text-sm text-muted-foreground font-semibold"}>
                        <div className={"px-0.5 py-1 bg-muted-foreground/50"}/>
                        {"Prompt"}
                    </label>
                    <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder={"Use \"Quick Prompt\" or input prompt manually. The maximum token limit is 1000, please do not send prompts exceed it."}
                                        // value={requestPrompt}
                                        onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => event.stopPropagation()}
                                        // onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestPrompt(e.currentTarget.value)}
                                        rows={6}
                                        className={"resize-none px-4 2xl:px-5 py-3 text-base tracking-wide leading-[175%]"}/>
                                </FormControl>
                                <FormMessage className={"ml-1 py-0.5 text-xs"}/>
                            </FormItem>
                        )}
                    />
                    {isPending ?
                        <Button className={"px-6 rounded-lg shrink-0 sticky bottom-3 mt-4"} type={"button"}
                                variant={"destructive"}
                                onClick={handleSuspend}>
                            {"Suspend"}
                        </Button> :
                        <Button onClick={() => { setOpen && setOpen(false) }} 
                                className={"px-6 rounded-lg shrink-0 sticky bottom-3 mt-4"} type={"submit"}>
                            {"Generate"}
                        </Button>
                    }
                </form>
            </Form>
        </div>
    )
}