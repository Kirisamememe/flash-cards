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

    const [isComing, setIsComing] = useState(false)

    const bounceAnimation = [
        { transform: 'scale(1)' },
        { transform: 'scale(0.9)', offset: 0.3 },
        { transform: 'scale(1.2)', offset: 0.6 },
        { transform: 'scale(1)' }
    ]

    const bounceTiming = {
        duration: 500,
        easing: 'ease'
    }

    // const loadingBounce = [
    //     { transform: 'translateY(0)', opacity: 1, easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)' },
    //     { transform: 'translateY(-10px)', opacity: 0.7, easing: 'cubic-bezier(0.5, 0.35, 0.75, 0.5)', offset: 0.4 },
    //     { transform: 'translateY(-10px)', opacity: 0.7, easing: 'cubic-bezier(0.5, 0.35, 0.75, 0.5)', offset: 0.5 },
    //     { transform: 'translateY(0)', opacity: 1, easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)' }
    // ]
    //
    // const loadingBounceTiming = {
    //     duration: 1000,
    //     iterations: 1
    // }


    useEffect(() => {
        if (isActive) {
            setIsComing(false)
        }

    }, [isActive]);


    return (
        <Button disabled={disabled} asChild className={cn("h-full rounded-none active:bg-transparent active:text-primary", className, isComing && "animate-pulse text-primary")} variant={"ghost"}
                onClick={(event) => {
                    event.currentTarget.animate(bounceAnimation, bounceTiming)
                    if (!isComing && !isActive) {
                        setIsComing(true)
                    }
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

    useEffect(() => {
        if (isActive){
            setIsComing(false)
            // setTimeout(() => {
            //     setIsTransition(false)
            //     setIsComing(false)
            // }, 1500)
        }
    }, [isActive]);

    return (
        <Button asChild className={cn("h-full rounded-full flex gap-2", (isActive || isComing) && "bg-primary/10 hover:bg-primary/10 active:bg-primary/10 hover:text-primary active:text-primary", isComing && "animate-pulse", className)} variant={"ghost"}>
            <Link
                className={cn((isActive || isComing) && "text-primary", disabled && "pointer-events-none text-muted")}
                aria-current={isActive ? 'page' : undefined}
                href={href}
                scroll={false}
                onClick={() => {
                    if (!isComing) {
                        setIsComing(true)
                    }
                }}
                {...rest}
            />
        </Button>
    )
}