import { Button } from "@/components/ui/button";
import { Social } from "@/components/ui/auth/socialButtons";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog/dialog";
import { Separator } from "@/components/ui/separator";

export default function SignIn(){
    const t = useTranslations('User')

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant={"coloredOutline"} size={"sm"}>
                        {t("signIn")}
                    </Button>
                </DialogTrigger>
                <DialogContent className={"max-w-[25rem] w-full p-6 rounded-4 dark:shadow-primary/10 dark:ring-primary/20 shadow-2xl ring-1 ring-foreground/[0.05]"}>
                    <DialogHeader>
                        <DialogTitle>{t("signIn")}</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <Social/>
                    <Separator className={"my-2"}/>
                    <DialogClose>
                        <Button
                            className={"w-full"}
                            type={"button"}
                            variant={"secondary"}
                        >
                            {t("cancel")}
                        </Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>
        </>

    )
}