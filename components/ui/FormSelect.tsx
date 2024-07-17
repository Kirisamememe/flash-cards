import { FormControl, FormDescription, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";
import { POSList } from "@/types/WordIndexDB";

export default function FormSelect({
    fieldValue,
    onChange,
}: {
    fieldValue: string | undefined,
    onChange: (value: string) => void
}) {
    const t = useTranslations()

    return (
        <div className={"flex w-full gap-3 justify-between items-start"}>
            <FormItem className={"w-full"}>
                {/*<FormLabel className={"ml-1"}>{t('part_of_speech')}</FormLabel>*/}
                <FormControl>
                    <Select
                        value={fieldValue} // この値は、実際に下に存在する値しか入らないようになっている
                        onValueChange={onChange}
                    >
                        <SelectTrigger
                            className={cn("w-full h-12 lg:h-14 px-5 rounded-lg border-0 ring-1 ring-border hover:bg-muted/20 focus:ring-offset-0 focus:ring-2 focus:outline-none font-semibold", !fieldValue && "text-foreground/40")}>
                            <SelectValue
                                placeholder={t('WordSubmitForm.part_of_speech_selector')}/>
                        </SelectTrigger>
                        <SelectContent className={"w-full"}>
                            {POSList.map((value) => (
                                <SelectItem
                                    key={value}
                                    value={value}
                                    className={"h-10"}
                                >
                                    {t(`POS.${value}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormControl>
                <FormDescription className={"ml-1 py-0.5 text-xs text-foreground/15"}>
                    {t('WordSubmitForm.part_of_speech')}
                </FormDescription>
                <FormMessage className={"ml-2"}/>
            </FormItem>
        </div>

    )
}