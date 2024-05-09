import RightMenu from "@/components/ui/nav/right-menu";
import { NextIntlClientProvider, useMessages } from "next-intl";
import pick from "lodash/pick";

export default function MenuWrapper() {
    const messages = useMessages();

    return (
        <NextIntlClientProvider messages={pick(messages, 'LocaleSwitcher')}>
            <RightMenu />
        </NextIntlClientProvider>
    )
}