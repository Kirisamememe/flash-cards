import { FormControl, FormDescription, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";

export default function FormSelect({
    fieldValue,
    onChange,
}: {
    fieldValue: string | undefined,
    onChange: (value: string) => void
    newPOS: string
    setNewPOS: React.Dispatch<SetStateAction<string>>
}) {
    console.log("fieldValue:")
    console.log(fieldValue)

    const t = useTranslations('WordSubmitForm')

    const setIsAddingPos = useWordbookStore((state) => state.setIsAddingPos)


    console.log("WordFormがレンダリングされたようだ")


    const poses = useWordbookStore((state) => state.poses)

    return (
        <div className={"flex w-full gap-3 justify-between items-start"}>
            <FormItem className={"w-full"}>
                {/*<FormLabel className={"ml-1"}>{t('part_of_speech')}</FormLabel>*/}
                <FormControl>
                    <Select
                        value={fieldValue} // この値は、実際に下に存在する値しか入らないようになっている
                        onValueChange={onChange}
                    >
                        <SelectTrigger disabled={poses.length <= 0}
                                       className={cn("w-full h-12 lg:h-14 px-5 rounded-lg border-0 ring-1 ring-border hover:bg-muted/20 focus:ring-offset-0 focus:ring-2 focus:outline-none font-semibold", !fieldValue && "text-foreground/40")}>
                            <SelectValue
                                placeholder={poses.length > 0 ? t('part_of_speech_selector') : t('no_part_of_speech')}/>
                        </SelectTrigger>
                        {poses.length > 0 && <SelectContent className={"w-full"}>
                            {poses.map((value) => (
                                <SelectItem
                                    key={value.id}
                                    value={value.id}
                                    className={"h-10"}
                                >
                                    {value.partOfSpeech}
                                </SelectItem>
                            ))}
                        </SelectContent>}
                    </Select>
                </FormControl>
                <FormDescription className={"ml-1 py-0.5 text-xs text-foreground/15"}>
                    {poses.length > 0 ? t('part_of_speech') : t('no_part_of_speech')}
                </FormDescription>
                <FormMessage className={"ml-2"}/>
            </FormItem>
            <Button className={"h-12 lg:h-14"} onClick={() => setIsAddingPos(true)} variant={"outline"}
                    type={"button"}>{t("add")}
            </Button>
        </div>

    )
}