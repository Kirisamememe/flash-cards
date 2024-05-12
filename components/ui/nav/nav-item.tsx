import { Link, pathnames } from './navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSelectedLayoutSegment } from 'next/navigation';
import { ComponentProps } from 'react';

export default function NavItem<
    Pathname extends keyof typeof pathnames
>({href, className, ...rest}: ComponentProps<typeof Link<Pathname>>) {
    const selectedLayoutSegment = useSelectedLayoutSegment();
    const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';

    const isActive = pathname === href;

    return (
        <Button asChild className={cn("h-full rounded-none hover:bg-transparent", className)} variant={"ghost"}>
            <Link
                className={cn(isActive && "text-primary")}
                aria-current={isActive ? 'page' : undefined}
                href={href}
                {...rest}
            />
        </Button>
    )
}