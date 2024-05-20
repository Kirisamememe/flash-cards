"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {cn} from "@/app/lib/utils";
import {useEffect, useState} from "react";

export function ModeToggle({className}: {className?: string}) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null

    return (
        <div className={cn("flex justify-center items-center outline outline-1 outline-offset-2 outline-foreground/10 rounded-full gap-0.5 bg-background/20", className)}>
            <Button
                className={cn(`${theme === 'light' ? "bg-foreground/10 text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("light")}
            >
                <Sun className={cn("")} size={16}/>
            </Button>
            <Button
                className={cn(`${theme === 'system' ? "bg-foreground/10 text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("system")}
            >
                <Monitor className={""} size={16}/>
            </Button>
            <Button
                className={cn(`${theme === 'dark' ? "bg-foreground/10 text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("dark")}
            >
                <Moon className={""} size={16}/>
            </Button>
        </div>
    )
}
