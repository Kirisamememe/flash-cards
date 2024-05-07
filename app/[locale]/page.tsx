import CardContainer from "@/components/cardContainer";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import pick from "lodash/pick";
import SessionProvider from "@/components/ui/auth/sessionProvider";

export default function Index() {
    const messages = useMessages();

    return (
        <NextIntlClientProvider messages={pick(messages, 'Index', 'WordSubmitForm', 'IndexDB')}>
            <SessionProvider />
        </NextIntlClientProvider>
    )
}
