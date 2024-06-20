import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn, playSEAudio } from "@/app/lib/utils"
import { useState } from "react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/90",
                outline:
                    "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground",
                coloredOutline:
                    "text-primary ring-1 ring-primary/50 bg-transparent hover:bg-primary/5 hover:ring-primary hover:text-primary active:bg-primary/5 active:text-primary",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground active:text-accent-foreground active:bg-accent",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    animation?: boolean
    se?: string
}



const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, animation = true, se, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const [isMoving, setIsMoving] = useState(false)

        const handleTouchMove = () => {
            setIsMoving(true);
        }

        const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
            if (!isMoving) {
                event.preventDefault()
                event.currentTarget.click()
            }
            setIsMoving(false);
        }

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }), animation && "hover:scale-105 active:scale-95")}
                ref={ref}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => playSEAudio(se)}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
