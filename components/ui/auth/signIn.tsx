'use client'

// import {SignInForm} from "@/components/ui/auth/signInForm";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {Social} from "@/components/ui/auth/socialButtons";
import {useTranslations} from "next-intl";

export default function SignIn(){
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('User')

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
            >
                {t("signIn")}
            </Button>

            {isOpen &&
                <div className={"absolute top-0 left-0 bg-black/50 w-svw h-svh bottom-6 flex justify-center items-center z-10"}>
                    <div className={"max-w-[25rem] w-full p-6 bg-background rounded-4 dark:shadow-primary/10 dark:ring-primary/20 shadow-2xl ring-1 ring-foreground/[0.05]"}>
                        <Social/>
                        {/*<SignInForm text={text}>*/}
                        {/*</SignInForm>*/}
                        <Button
                            className={"w-full mt-4"}
                            type={"button"}
                            variant={"secondary"}
                            onClick={() => setIsOpen(false)}
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </div>}
        </>

    )
}