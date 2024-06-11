import React from 'react';
import { cn } from "@/app/lib/utils";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TextareaProps } from "@/components/ui/textarea";

interface FloatTextareaProps extends TextareaProps {
    label: string;
    description?: string
    parentClass?: string
    labelClassName?: string
    limit: number
}

export const FloatTextarea = React.forwardRef<HTMLTextAreaElement, FloatTextareaProps>(
    ({ className, parentClass, labelClassName, value, rows = 2, limit, description, label, ...props }, ref) => {

        const { error } = useFormField()

        return (
            <FormItem className={parentClass}>
                <FormControl>
                    <div className={"relative"}>
                        <Textarea
                            className={cn(
                                "peer w-full h-full rounded-md bg-transparent ring-1 ring-border hover:ring-foreground/30 border-0 px-5 py-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:hover:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                                className
                            )}
                            ref={ref}
                            rows={rows}
                            value={value}
                            {...props}
                        />
                        <FormLabel
                            className={cn(
                                "absolute left-3 top-6 transform -translate-y-1/2 bg-background px-2 font-semibold text-base text-muted-foreground transition-all peer-focus:-top-0.5 peer-focus:text-base peer-focus:text-primary pointer-events-none rounded-full",
                                { "text-sm top-0": value || props.autoFocus, }
                            )}
                        >
                            {label}
                        </FormLabel>
                    </div>
                </FormControl>

                {!error ?
                    <div className={cn("flex justify-between mx-1 py-0.5 text-xs", labelClassName)}>
                        <FormDescription className={"text-xs text-foreground/20"}>
                            {description}
                        </FormDescription>
                        <p className={"text-foreground/20"}>{`${value ? value.toString().length : "0"} / ${limit}`}</p>
                    </div> :
                    <FormMessage className={"ml-1 py-0.5 text-xs"}/>
                }
            </FormItem>
        )
    }
);

FloatTextarea.displayName = "FloatTextarea";
