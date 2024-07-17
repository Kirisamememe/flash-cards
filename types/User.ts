export interface UserInfo {
    id: string
    image: string | undefined | null
    name: string | undefined | null
    auto_sync: boolean
    blind_mode: boolean
    updated_at: Date
    synced_at: Date | undefined
    learning_lang?: LanguageCode
    trans_lang?: LanguageCode
}

export const languageList = {
    "EN": "English",
    "JA": "日本語",
    "ZH_CN": "简体中文",
    "ZH_TW": "繁體中文",
    "KO": "한국어",
    "VI": "Tiếng Việt",
    "FR": "Français",
    "DE": "Deutsch",
    "IT": "Italiano",
    "ES": "Español",
    "PT": "Português",
    "RU": "Русский"
} as const

export type LanguageCode = keyof typeof languageList


export interface UserInfoToRemote {
    id: string
    image: string | null
    name: string | null
    auto_sync: boolean
    blind_mode: boolean
    updated_at: Date
    synced_at: Date | null
    learning_lang: LanguageCode | null
    trans_lang: LanguageCode | null
}

export interface UserInfoFormRemote {
    id: string
    image: string | null
    name: string | null
    synced_at: Date | null,
    updated_at: Date
    auto_sync: boolean,
    blind_mode: boolean,
    learning_lang: LanguageCode | null
    trans_lang: LanguageCode | null
}

export interface MasteredWords {
    user_id: string
    updated_at: Date,
    synced_at?: Date,
    words: string[]
}
