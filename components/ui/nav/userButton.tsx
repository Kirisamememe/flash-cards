import {NextIntlClientProvider, useMessages} from 'next-intl';
import AvatarMenu from "@/components/ui/nav/avatarMenu";
import SignIn from "@/components/ui/auth/signIn";
import pick from 'lodash/pick';

// このコンポーネントは、i18n用のテキストを渡すためだけに存在する
export default function UserButton({
    isLogin,
    userId,
    avatar,
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
                <AvatarMenu userId={userId} url={avatar} userName={userName} /> :
                <SignIn />}
        </NextIntlClientProvider>
    )
}