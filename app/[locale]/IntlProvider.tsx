import { NextIntlClientProvider, useMessages } from 'next-intl';
import pick from "lodash/pick";

export default function IntlProvider({ children }: { children: React.ReactNode }) {
    const messages = useMessages();

    return (
        <NextIntlClientProvider messages={pick(messages, 'Index', 'LocaleSwitcher', 'WordSubmitForm', 'IndexDB', 'User', 'WordsBook')}>
            {children}
        </NextIntlClientProvider>
    )
}