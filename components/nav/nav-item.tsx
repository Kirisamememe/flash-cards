import { Link, pathnames } from './navigation';
import { cn } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import { useSelectedLayoutSegment } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';
import { useWordbookStore } from "@/providers/wordbook-store-provider";

export function NavItemMobile<
    Pathname extends keyof typeof pathnames
>({href, className, disabled, ...rest}: ComponentProps<typeof Link<Pathname>> & { disabled?: boolean }) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

    const isActive = pathname === href;

    const isTransition = useWordbookStore((state) => state.isTransition)
    const setIsTransition = useWordbookStore((state) => state.setIsTransition)

    const bounceAnimation = [
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)', offset: 0.3 },
        { transform: 'scale(1.2)', offset: 0.6 },
        { transform: 'scale(1)' }
    ];

    const bounceTiming = {
        duration: 500,
        easing: 'ease'
    }

    useEffect(() => {
        if (isActive) {
            setIsTransition(false)
        }

    }, [isActive]);


    return (
        <Button disabled={disabled} asChild className={cn("h-full rounded-none active:bg-transparent active:text-primary", className, isTransition && "animate-bounce text-primary")} variant={"ghost"}
                onClick={(event) => {
                    event.currentTarget.animate(bounceAnimation, bounceTiming)
                    if (!isTransition && !isActive) setIsTransition(true)
                }}
        >
            <Link
                className={cn(isActive ? "text-primary" : "text-muted-foreground", disabled && "pointer-events-none text-muted")}
                aria-current={isActive ? 'page' : undefined}
                href={href}
                scroll={false}
                {...rest}
            />
        </Button>
    )
}

export function NavItem<
    Pathname extends keyof typeof pathnames
>({href, className, disabled, ...rest}: ComponentProps<typeof Link<Pathname>> & { disabled?: boolean }) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

    const isActive = pathname === href;
    const [isComing, setIsComing] = useState(false)
    const isTransition = useWordbookStore((state) => state.isTransition)
    const setIsTransition = useWordbookStore((state) => state.setIsTransition)

    useEffect(() => {
        if (isActive){
            setIsTransition(false)
            setIsComing(false)
            // setTimeout(() => {
            //     setIsTransition(false)
            //     setIsComing(false)
            // }, 1500)
        }
    }, [isActive, isTransition, setIsTransition]);

    return (
        <Button asChild className={cn("h-full rounded-full flex gap-2", ((isActive && !isTransition) || isComing) && "bg-primary/10 hover:bg-primary/10 active:bg-primary/10 hover:text-primary active:text-primary", className)} variant={"ghost"}>
            <Link
                className={cn(((isActive && !isTransition) || isComing) && "text-primary", disabled && "pointer-events-none text-muted")}
                aria-current={isActive ? 'page' : undefined}
                href={href}
                scroll={false}
                onClick={() => {
                    if (!isTransition) {
                        setIsComing(true)
                        setIsTransition(true)
                    }
                }}
                {...rest}
            />
        </Button>
    )
}