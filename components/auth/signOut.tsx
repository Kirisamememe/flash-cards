import { Button } from "@/components/ui/button";
import { signOutHandler } from "@/app/lib/sign-out";

export function SignOut({ text, className }: { text: any, className?: string }) {

    return (
        <form
            className={className}
            action={signOutHandler}
        >
            <Button variant={"outline"} type={"submit"}>{text}</Button>
        </form>
    )
}