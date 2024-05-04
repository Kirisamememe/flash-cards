'use client';

import {useParams} from 'next/navigation';
import {ChangeEvent, ReactNode, useState, useTransition} from 'react';
import {useRouter, usePathname} from '../navigation';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import * as React from "react";

type Props = {
    children: ReactNode;
    defaultValue: string;
    label: string;
};

export default function LocaleSwitcherSelect({
    children,
    defaultValue,
    label
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const params = useParams();

    const [open, setOpen] = useState(false)

    function onSelectChange(value: string) {
        const nextLocale = value;
        startTransition(() => {
            router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                // are used in combination with a given `pathname`. Since the two will
                // always match for the current route, we can skip runtime checks.
                {pathname, params},
                {locale: nextLocale}
            );
        });
    }

    return (
        <>
            <Select
                open={open}
                onOpenChange={setOpen}
                defaultValue={defaultValue}
                disabled={isPending}
                onValueChange={onSelectChange}
            >
                <SelectTrigger
                    onMouseEnter={() => setTimeout(() => setOpen(true), 100)}
                    className="w-[140px]"
                >
                    <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent

                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                >
                    {children}
                </SelectContent>
            </Select>
        </>

    );
}
