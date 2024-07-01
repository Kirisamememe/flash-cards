export interface Material {
    title?: string
    content: string[] // translationもここに
    author: string
}

export interface MaterialIndexDB extends Material{
    id: string
    translation?: {
        lang: "en" | "ja" | "zh-cn" | "zh-tw" | "kr" | string,
        text: string
    }[]
    created_at: Date
    updated_at: Date
    synced_at?: Date
    bookmarked_at?: Date
    words?: string[]
    is_deleted: boolean
}

export interface Prompt {
    description: string
    prompt: string
}

export const numberOfWordsOption = [5, 10]
export const wordCountOfOutputOption = [100, 150, 200, 300]

export const selectWords = [
    {
        value: "recent",
        description: "直近に追加した単語（10個）"
    },
    {
        value: "random",
        description: "ランダムな単語（10個）"
    },
    {
        value: "mostForgettable",
        description: "忘れた回数が一番多い単語（10個）"
    },
]

export const prompts: Prompt[] = [
    {
        description: "小説風のストーリーを生成",
        prompt: "Please write a story of about 150 words using the following words:"
    },
    {
        description: "会話がメインのストーリーを生成",
        prompt: "Please write a scenario of about 150 words using the following words:"
    },
    {
        description: "変なフェイクニュースを生成",
        prompt: "Please write a FAKE NEWS of about 150 words using the following words:"
    },
    {
        description: "それぞれの例文を生成",
        prompt: "Please write some sentence of about 150 words using the following words:"
    }
]

export const tabValues = [
    {
        value: "0",
        title: "Generate",
    },
    {
        value: "1",
        title: "History",
    },
    {
        value: "2",
        title: "Bookmark",
    },
]

export const exampleMaterial = {
    id: "",
    created_at: new Date(),
    updated_at: new Date(),
    author: "ADMIN",
    title: "[Example] Why we need generated material?",
    content: [
        "\"This is an example of the text that I can generate for you.\"",
        "The world of language learning is being transformed by the power of generative AI...",
        "\"Imagine having access to an unlimited source of custom-designed vocabulary lists, perfectly tailored to your interests and current language level.\"",
        "Need to brush up on a tricky grammar point?!",
        "Generative AI can create exercises, dialogues, and even short stories that allow you to engage with the language in a meaningful and memorable way…",
        "While nothing can replace the guidance and feedback of a human teacher, AI-powered tools can serve as a powerful supplement, providing learners with engaging and personalized practice opportunities.",
        "This makes language learning more accessible, enjoyable, and ultimately, more effective for learners of all levels."
    ],
    bookmarked: false,
    is_deleted: false,
}

export const sentenceEndingRegex = /(?<=[.!?…])(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|Inc\.|Ltd\.|Co\.|Corp\.|etc\.|vs\.|e\.g\.|i\.e\.|a\.m\.|p\.m\.|U\.S\.|U\.K\.|B\.C\.|A\.D\.)(?=\s+[A-Z"]|\s*$|\s*")/g;

export type AppTouchEvent = TouchEvent

export const modelListTuple = [
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "calude-3-5-sonnet-20240620",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo"
] as const

export const onlyProUserModelListTuple = [
    "calude-3-5-sonnet-20240620",
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo"
] as const

export const freeModelListTuple = [
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest",
    "gemini-pro",
] as const

export type ProModelList = typeof onlyProUserModelListTuple[number]
export type FreeModelList = typeof freeModelListTuple[number]
export type ModelList = FreeModelList & ProModelList
// as constは配列の値を固定するために使う

