"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";

export function ModeToggle({className}: {className?: string}) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null

    return (
        <div className={cn("flex justify-center items-center ring-1 ring-offset-2 ring-offset-background ring-border rounded-full gap-0.5", className)}>
            <Button
                className={cn(`${theme === 'light' ? "bg-accent text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("light")}
            >
                <Sun className={cn("")} size={16}/>
            </Button>
            <Button
                className={cn(`${theme === 'system' ? "bg-accent text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("system")}
            >
                <Monitor className={""} size={16}/>
            </Button>
            <Button
                className={cn(`${theme === 'dark' ? "bg-accent text-foreground" : "text-muted-foreground"} w-8 h-8 p-1 rounded-full`)}
                variant={"ghost"}
                onClick={() => setTheme("dark")}
            >
                <Moon className={""} size={16}/>
            </Button>
        </div>
    )
}
