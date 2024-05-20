"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/app/lib/utils"

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, children, ...props }, ref) => {
    return (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(
                "relative flex w-full touch-none select-none items-center",
                className
            )}
            {...props}
        >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
                <SliderPrimitive.Range className="absolute h-full bg-primary"/>
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
                className="group block size-7 sm:size-5 m-2 sm:m-0 rounded-full border-2 border-primary bg-background ring-offset-background hover:scale-105 hover:shadow-md hover:shadow-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing active:scale-125 transition-all"
            >
                <div className={"fixed w-14 h-8 bottom-8 -left-5 rounded-4 bg-card ring-2 ring-primary items-center font-semibold justify-center text-sm hidden group-hover:flex group-active:flex group-focus-visible:flex transition-all"}>
                    {children}
                </div>
            </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
    )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
