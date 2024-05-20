import React from 'react';
import { cn } from "@/app/lib/utils";
import { FormControl, FormItem, FormLabel, FormMessage, FormDescription, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputProps } from "@/components/ui/input";

interface FloatInputProps extends InputProps {
    label: string;
    labelClassName?: string
    description?: string
    limit: number
}

export const FloatInput = React.forwardRef<HTMLInputElement, FloatInputProps>(
    ({ className, value, labelClassName, limit, description, type = "text", label, ...props }, ref) => {

        const { error } = useFormField()

        return (
            <FormItem>
                <FormControl>
                    <div className="relative">
                        <Input
                            type={type}
                            className={cn(
                                "peer h-10 w-full rounded-md bg-transparent ring-1 ring-border hover:ring-foreground/30 border-0 px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:hover:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                                className
                            )}
                            ref={ref}
                            value={value}
                            {...props}
                        />
                        <FormLabel
                            className={cn(
                                "absolute left-3 top-1/2 transform -translate-y-1/2 bg-background px-2 font-semibold text-base text-muted-foreground transition-all peer-focus:top-0 peer-focus:text-base peer-focus:text-primary pointer-events-none rounded-full", labelClassName,
                                { "text-sm top-0": value || props.autoFocus, }
                            )}
                        >
                            {label}
                        </FormLabel>
                    </div>
                </FormControl>

                {!error ?
                    <div className={"flex justify-between mx-1 py-0.5 text-xs"}>
                        <FormDescription className={"text-xs text-foreground/20"}>
                            {description}
                        </FormDescription>
                        <p className={"text-foreground/20"}>{`${value ? value.toString().length : "0"} / ${limit}`}</p>
                    </div>
                      :
                    <FormMessage className={"ml-1 py-0.5 text-xs"}/>
                }
            </FormItem>
        )
    }
);

FloatInput.displayName = "FloatInput";
