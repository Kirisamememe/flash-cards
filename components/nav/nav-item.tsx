import { Link, pathnames } from './navigation';
import { animateElement, cn } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import { useSelectedLayoutSegment } from 'next/navigation';
import React, { ComponentProps, SetStateAction, useEffect, useRef, useState } from 'react';
import { useWordbookStore } from "@/providers/wordbook-store-provider";
import { DebouncedState, useDebouncedCallback } from 'use-debounce';

const handlePageSwitchAnimation = (
    setIsComing: React.Dispatch<SetStateAction<boolean>>,
    setIsTransition:  DebouncedState<(value: boolean) => void>,
    linkRef: HTMLAnchorElement
) => {
    setIsComing(true)
    const container = document.getElementById("animation-container")

    if (container) {
        animateElement(container, [
            { opacity: '100%', transform: 'translateY(0)' },
            { opacity: '0', transform: 'translateY(50px)' }
        ],{
            duration: 200,
            easing: 'ease-in-out',
            fill: "forwards"
        }).then(res => {
            if (res.finish && linkRef) {
                setIsTransition(true)
                linkRef.click()
                // setTimeout(() => linkRef.click(), 1000)
            }
        })
    }
}

export function NavItemMobile<
    Pathname extends keyof typeof pathnames
>({href, className, disabled, children, }: ComponentProps<typeof Link<Pathname>> & { disabled?: boolean }) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

    const isActive = pathname === href;

    const [isComing, setIsComing] = useState(false)
    const setIsTransition = useWordbookStore((state) => state.setIsTransition)

    const linkRef = useRef<HTMLAnchorElement>(null)

    const setIsTransitionDebounced = useDebouncedCallback((value: boolean) => {
        if (!isActive) setIsTransition(value)
    }, 300)

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

    useEffect(() => {
        if (isActive) {
            setIsComing(false)
            if (isComing) setIsTransition(false)
        }

    }, [isActive, isComing, setIsTransition]);

    return (
        <>
            <Button disabled={disabled}
                    className={cn(
                        "h-full rounded-none active:bg-transparent active:text-primary",
                        isComing && "animate-pulse text-primary",
                        isActive ? "text-primary" : "text-muted-foreground",
                        disabled && "pointer-events-none text-muted",
                        className )}
                    variant={"ghost"}
                    onClick={(event) => {
                        event.currentTarget.animate(bounceAnimation, bounceTiming)
                        if (!isComing && !isActive && linkRef.current) {
                            handlePageSwitchAnimation(setIsComing, setIsTransitionDebounced, linkRef.current)
                        }
                    }}
            >
                {children}
            </Button>
            <Link ref={linkRef}
                className={"hidden"}
                aria-current={isActive ? 'page' : undefined}
                href={href}
                scroll={false}
            />
        </>
    )
}

export function NavItem<
    Pathname extends keyof typeof pathnames
>({ href, className, disabled, children, setOpen }: ComponentProps<typeof Link<Pathname>> & { disabled?: boolean, setOpen?: (value: boolean) => void }) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

    const setIsTransitionDebounced = useDebouncedCallback((value: boolean) => {
        if (!isActive) setIsTransition(value)
    }, 300)

    const isActive = pathname === href;
    const [isComing, setIsComing] = useState(false)
    const setIsTransition = useWordbookStore((state) => state.setIsTransition)


    const linkRef = useRef<HTMLAnchorElement>(null)


    useEffect(() => {
        if (isActive){
            setIsComing(false)
            if (isComing) setIsTransition(false)
        }
    }, [isActive, isComing, setIsTransition]);

    return (
        <>
            <Button className={cn(
                "h-full rounded-full flex gap-2",
                (isActive || isComing) && "text-primary bg-primary/10 hover:bg-primary/10 active:bg-primary/10 hover:text-primary active:text-primary",
                isComing && "animate-pulse",
                disabled && "pointer-events-none text-muted",
                className)}
                    variant={"ghost"}
                    onClick={() => {
                        if (setOpen && href === "/ai-booster") {
                            setOpen(true)
                            return
                        }

                        if (!isComing && !isActive && linkRef.current) {
                            handlePageSwitchAnimation(setIsComing, setIsTransitionDebounced, linkRef.current)
                        }
                    }}>
                {children}
            </Button>
            <Link ref={linkRef}
                  className={"hidden"}
                  aria-current={isActive ? 'page' : undefined}
                  href={href}
                  scroll={false}
            />
        </>
    )
}