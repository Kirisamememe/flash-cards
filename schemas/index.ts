import * as z from 'zod';



export const signUpSchema = z.object({
    email: z.string().email({
        message: 'メールアドレスは必須です。',
    }),
    password: z.string().min(6, {
        message: 'パスワードは6文字以上です。',
    }),
    nickname: z.string().min(1, {
        message: 'ニックネームは必須です。',
    }),
});

export const signInSchema = z.object({
    email: z.string().email({
        message: 'メールアドレスは必須です。',
    }),
    password: z.string().min(6, {
        message: 'パスワードは6文字以上です。',
    }),
});

export const wordCardSaveRequest = z.object({
    // IndexDBにインサートする時の状態
    id: z.string().cuid2().optional(),
    phonetics: z.string().max(80).trim().optional(),
    word: z.string().min(1).max(20).trim(),
    partOfSpeech: z.string().optional(),
    definition: z.string().min(1).max(100).trim(),
    example: z.string().max(200).trim().optional(),
    notes: z.string().max(500).trim().optional(),
    is_learned: z.boolean().default(false),
    created_at: z.date().default(new Date()),
    updated_at: z.date(),
    synced_at: z.date().optional(),
    learned_at: z.date().optional(),
    retention_rate: z.number().max(100).default(0),
    author: z.string().cuid2().optional(),
    is_deleted: z.boolean().default(false)
})

export const partOfSpeech = z.object({
    // IndexDBにインサートする時の状態
    id: z.string().optional(),
    partOfSpeech: z.string().min(1).max(20),
    author: z.string().optional(),
    is_deleted: z.boolean(),
    created_at: z.date(),
    updated_at: z.date(),
    synced_at: z.date().optional()
})