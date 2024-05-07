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
    id: z.string().optional(),
    phonetics: z.string().max(80).optional(),
    word: z.string().min(1).max(20),
    partOfSpeech: z.string().optional(),
    definition: z.string().min(1).max(100),
    example: z.string().max(200).optional(),
    notes: z.string().max(500).optional(),
    is_learned: z.boolean(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
    synced_at: z.date().optional(),
    learned_at: z.date().optional(),
    retention_rate: z.number().optional(),
    author: z.string().optional(),
    is_deleted: z.boolean()
})

export const partOfSpeech = z.object({
    id: z.string().optional(),
    partOfSpeech: z.string().min(1).max(20),
    author: z.string().optional(),
    is_deleted: z.boolean()
})