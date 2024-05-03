import {useLocale, useTranslations} from 'next-intl';
import LocaleSwitcherSelect from './localeSwitcherSelect';
import {locales} from '../config';
import {SelectItem} from "@/components/ui/select";
import * as React from "react";

export default function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    return (
        <LocaleSwitcherSelect defaultValue={locale} label={t('label')}>
            {locales.map((cur) => (
                <SelectItem key={cur} value={cur}>{t(cur)}</SelectItem>
            ))}
        </LocaleSwitcherSelect>
    );
}