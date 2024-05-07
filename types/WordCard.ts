export interface WordCard {
    id: string
    word: string
    phonetics: string | undefined
    partOfSpeech: string | undefined
    definition: string
    example: string | undefined
    notes: string | undefined
    is_learned: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date  | undefined
    retention_rate: number
    author: string | undefined
    is_deleted: boolean
}

export interface SyncData {
    userId: string
    synced_at: Date
    words: WordCardToRemote[]
}

export interface WordCardToRemote {
    id: string
    word: string
    phonetics: string | undefined
    partOfSpeech: PartOfSpeech | null
    definition: string
    example: string | undefined
    notes: string | undefined
    is_learned: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string | undefined
    is_deleted: boolean
}

export interface PartOfSpeech {
    id: string
    partOfSpeech: string
    author: string
    is_deleted: boolean
}

export interface PartOfSpeechRemote {
    id: string
    part_of_speech: string
    authorId: string
    is_deleted: boolean
}

export interface RawWordInfo {
    word: string
    phonetics?: string
    definition: string
    example?: string
    notes?: string
}