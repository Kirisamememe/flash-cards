'use client'

import {SignInForm} from "@/components/ui/auth/signInForm";
import {Button} from "@/components/ui/button";
import {useState} from "react";

export default function SignUp({text}: {text: any}){
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                variant={"coloredOutline"}
                onClick={() => setIsOpen(true)}
            >
                {text.signUp}
            </Button>

            {isOpen &&
            <div className={"absolute top-0 left-0 bg-black/50 w-svw h-svh bottom-6 flex justify-center items-center z-10"}>
                <SignInForm text={text}>
                    <Button
                        className={"w-full"}
                        type={"button"}
                        variant={"secondary"}
                        onClick={() => setIsOpen(false)}
                    >
                        {text.cancel}
                    </Button>
                </SignInForm>
            </div>}
        </>

    )
}