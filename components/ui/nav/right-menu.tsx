'use client'

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    // NavigationMenuLink,
    // NavigationMenuIndicator,
    // NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { locales } from "@/components/config";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/components/navigation";
import { useTransition } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {　Check　} from 'lucide-react';
import { Languages } from 'lucide-react';


export default function RightMenu() {
    const t = useTranslations('LocaleSwitcher')
    const locale = useLocale();

    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const params = useParams();

    function onSelectChange(e: React.MouseEvent<HTMLButtonElement>) {
        const nextLocale = e.currentTarget.value;
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
        <NavigationMenu className={"rounded-xl"}>
            <NavigationMenuList className={"rounded-xl"}>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className={"pl-3 pr-2"}>
                        <Languages size={20} />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className={"flex flex-co m-0 rounded-xl"}>
                        <div className={"flex flex-col w-36 p-1"}>
                            {locales.map((cur) => (
                                <Button
                                    className={"flex pl-3 h-9 gap-3 justify-start rounded-2 active:scale-[93%]"}
                                    animation={false}
                                    key={cur}
                                    value={cur}
                                    variant={"ghost"}
                                    onClick={onSelectChange}
                                    disabled={isPending}
                                >
                                    <div className={"flex justify-center items-center w-4 h-4"}>
                                        {locale === cur && <Check />}
                                    </div>
                                    {t(cur)}
                                </Button>
                            ))}
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

    )
}