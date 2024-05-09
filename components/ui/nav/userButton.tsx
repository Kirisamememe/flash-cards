import { NextIntlClientProvider, useMessages } from 'next-intl';
import SignIn from "@/components/ui/auth/signIn";
import pick from 'lodash/pick';
import * as React from "react";
import UserSaver from "@/components/ui/nav/user-saver";

// このコンポーネントは、i18n用のテキストを渡すためだけに存在する
export default function UserButton({
    isLogin,
    userName,
}: {
    isLogin: boolean
    userId: string | undefined
    avatar: string
    userName: string
}) {

    const messages = useMessages();


    return (
        <NextIntlClientProvider
            messages={pick(messages, 'User')}
        >
            {isLogin ?
                <UserSaver userName={userName}/> :
                <SignIn />}
        </NextIntlClientProvider>
    )
}