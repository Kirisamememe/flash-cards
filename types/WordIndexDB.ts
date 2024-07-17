
export interface WordIndexDB { //IndexDBでの状態
    id: string
    word: string
    phonetics: string
    pos: POS
    definition: string
    example: string
    notes: string
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string | undefined
    is_deleted: boolean
    deleted_at?: Date
}

export interface Record {
    word_id: string
    records: AnswerRecord[]
}

export interface AnswerRecord {
    reviewed_at: Date
    is_correct: boolean
    time: number
    synced_at: Date | undefined
}

export interface RecordIndexDB {
    id: string
    word_id: string
    is_correct: boolean
    reviewed_at: Date
    time: number
    synced_at: Date | undefined
}

export interface WordData {
    id: string
    word: string
    phonetics: string | undefined
    pos: POS
    definition: string
    example: string | undefined
    notes: string | undefined
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
    pos: POS
    definition: string
    example: string | undefined
    notes: string | undefined
    created_at: Date
    updated_at: Date
    synced_at: Date | undefined
    learned_at: Date | undefined
    retention_rate: number
    author: string // DBと同期を取る時点でundefinedであってはならない
    is_deleted: boolean
    records: AnswerRecord[]
}

export type POS = (typeof POSList)[number]

export const POSList = [
    "NOUN",
    "VERB",
    "TRANSITIVE_VERB",
    "INTRANSITIVE_VERB",
    "ADJECTIVE",
    "ADVERB",
    "PREPOSITION",
    "CONJUNCTION",
    "PHRASE",
    "IDIOM",
    "OTHER",
    "UNDEFINED"
] as const


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