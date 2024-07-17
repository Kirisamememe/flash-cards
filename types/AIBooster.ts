import { freeModelListTuple, onlyProUserModelListTuple } from "@/types/static";
import { LanguageCode } from "@/types/User";

export interface Material {
    id: string
    title: string
    content: string[] // translationもここに
    author: string
    translation: {
        lang: LanguageCode
        text: string[]
    }
    generated_by?: ModelList
}

export interface MaterialIndexDB extends Material{
    updated_at: Date
    synced_at?: Date
    bookmarked_at?: Date
    words?: string[]
    deleted_at?: Date
    created_at: Date
    sync_at?: Date
}

export interface Prompt {
    description: string
    prompt: string
}

export type AppTouchEvent = TouchEvent

export type ProModelList = typeof onlyProUserModelListTuple[number]
export type FreeModelList = typeof freeModelListTuple[number]
export type ModelList = FreeModelList & ProModelList & "AIModel"
// as constは配列の値を固定するために使う

export interface AIDicData {
    word: string
    pronunciation: string
    results: {
        partOfSpeech: string
        definition: string
        example: {
            text: string
            translation: string
        }
        similarTo: string[]
    }[],
    generatedAt: Date
    generated_by: ModelList
    transLang?: LanguageCode,
}
