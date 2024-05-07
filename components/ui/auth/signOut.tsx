import { signOut } from "@/auth"
import {Button} from "@/components/ui/button";

export function SignOut({ text }: { text: any }) {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <Button>{text.signOut}</Button>
        </form>
    )
}