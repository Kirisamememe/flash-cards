import SignIn from "@/components/ui/auth/signIn";
import * as React from "react";
import UserSaver from "@/components/ui/nav/user-saver";

export default function UserButton({
    isLogin,
    userName,
}: {
    isLogin: boolean
    userId: string | undefined
    avatar: string
    userName: string
}) {

    return (
        <>
            {isLogin ?
                <UserSaver userName={userName}/> :
                <SignIn />}
        </>
    )
}