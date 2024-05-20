export interface WordIndexDB { //IndexDBでの状態
    id: string
    word: string
    phonetics: string
    partOfSpeech: string | undefined
    definition: string
    example: string
    notes: string
    is_learned: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string | undefined
    is_deleted: boolean
}

export interface WordDataMerged {
    id: string
    word: string
    phonetics: string
    partOfSpeech: PartOfSpeechLocal | undefined
    definition: string
    example: string
    notes: string
    is_learned: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string | undefined
    is_deleted: boolean
}


export interface WordCardToRemote {
    id: string
    word: string
    phonetics: string | undefined
    partOfSpeech: PartOfSpeechLocal | undefined
    definition: string
    example: string | undefined
    notes: string | undefined
    is_learned: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string // DBと同期を取る時点でundefinedであってはならない
    is_deleted: boolean
}

export interface PartOfSpeechLocal {
    id: string
    partOfSpeech: string
    author: string | undefined
    is_deleted: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
}

export interface PartOfSpeechToRemote {
    id: string
    partOfSpeech: string
    author: string
    is_deleted: boolean
    created_at: Date
    updated_at: Date
    synced_at: Date | null
}