import {
    createLocalizedPathnamesNavigation,
    Pathnames
} from 'next-intl/navigation';

export const defaultLocale = 'en';

export const locales = ['en', 'ja', 'zh-cn', 'zh-tw'] as const;

export const localePrefix =
    process.env.NEXT_PUBLIC_LOCALE_PREFIX === 'never' ? 'never' : 'as-needed';

export const pathnames = {
    '/': '/',
    '/words': '/words',
    '/ai': '/ai'
} satisfies Pathnames<typeof locales>;

export const {Link, redirect, usePathname, useRouter} =
    createLocalizedPathnamesNavigation({
        locales,
        localePrefix,
        pathnames
    });