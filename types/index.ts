import * as z from 'zod';
import { POS, POSList } from './WordIndexDB';

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

export const saveWordCardRequest = z.object({
    id: z.string().optional(),
    phonetics: z.string().min(0).max(80, 'phonetics_valid_max').trim().default(""),
    word: z.string({ required_error: "word_valid_min" }).min(1, 'word_valid_min').max(50, 'word_valid_max').trim(),
    pos: z.enum(POSList),
    definition: z.string({ required_error: "definition_valid_min" }).min(1, 'definition_valid_min').max(200, 'definition_valid_max').trim(),
    example: z.string().min(0).max(200, 'example_valid_max').trim().default(""),
    notes: z.string().min(0).max(500, 'notes_valid_max').trim().default(""),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
    synced_at: z.date().optional(),
    learned_at: z.date().optional(),
    retention_rate: z.number().max(100).default(0),
    author: z.union([z.string(),z.undefined()]),
    is_deleted: z.boolean().default(false)
})

export const addWordCardRequest = z.object({
    phonetics: z.string().min(0).max(80, 'phonetics_valid_max').trim().default(""),
    word: z.string({ required_error: "word_valid_min" }).min(1, 'word_valid_min').max(20, 'word_valid_max').trim(),
    partOfSpeech: z.string().optional(),
    definition: z.string({ required_error: "definition_valid_min" }).min(1, 'definition_valid_min').max(200, 'definition_valid_max').trim(),
    example: z.string().min(0).max(200, 'example_valid_max').trim().default(""),
    notes: z.string().min(0).max(500, 'notes_valid_max').trim().default(""),
    author: z.string().optional(),
})

export const partOfSpeech = z.object({
    id: z.optional(z.string()),
    partOfSpeech: z.string().min(1, "partOfSpeech_valid_min").max(20, "partOfSpeech_valid_max"),
    author: z.optional(z.string()),
    is_deleted: z.boolean(),
    created_at: z.date().default(new Date()),
    updated_at: z.date().default(new Date()),
    synced_at: z.union([z.date(), z.undefined()])
})

export const promptRequest = z.object({
    prompt: z.string().max(200, "prompt_valid_max").default("")
})