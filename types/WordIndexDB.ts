
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

export interface RecordIndexDB {
    id: string
    word_id: string
    is_correct: boolean
    reviewed_at: Date
    time: number
    synced_at: Date | undefined
}

export interface WordDataMerged {
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
    author: string | undefined
    is_deleted: boolean
    ttsUrl?: string
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
    records: RecordIndexDB[]
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

export interface EN2ENItem {
    word: string
    pronunciation?: {
        all: string
    }
    frequency?: number
    results: EN2ENResult[]
    syllables?: {
        count: number
        list: string[]
    }
}

interface EN2ENResult {
    definition: string
    partOfSpeech?: string
    examples?: string[]
}

export interface TTSObj {
    id: string
    binary: Uint8Array
}

export interface WordRemote {
    id: string
    word: string
    phonetics: string | null
    definition: string
    example: string | null
    notes: string | null
    is_learned: boolean
    created_at: Date
    updated_at: Date
    learned_at: Date | null
    synced_at: Date | null
    retention_rate: number
    authorId: string
    partOfSpeechId: string | null
    is_deleted: boolean
    records?: RecordIndexDB[] | []
}