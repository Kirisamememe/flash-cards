import UserButton from "@/components/ui/nav/userButton";
import NavBar from "@/components/ui/nav/nav-bar";
import { NextIntlClientProvider, useMessages } from "next-intl";
import pick from "lodash/pick";

export default function Nav({
    isLogin,
    userId,
    avatar,
    userName
}: {
    isLogin: boolean
    userId: string | undefined
    avatar: string
    userName: string
}) {
    const messages = useMessages();

    return (
        <NextIntlClientProvider messages={pick(messages, 'LocaleSwitcher', 'User')}>
            <NavBar isLogin={isLogin}>
                <UserButton
                    isLogin={isLogin}
                    userId={userId || undefined}
                    avatar={avatar || ""}
                    userName={userName || "User"}
                />
            </NavBar>
        </NextIntlClientProvider>


    )
}