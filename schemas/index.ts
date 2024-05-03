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

export const wordCardSchema = z.object({
    id: z.number().optional(),
    phonetics: z.string().min(0).max(50),
    word: z.string().min(2,"単語は必須です").max(20, "単語は20文字以下で入力してください"),
    definition: z.string().min(1, "定義は必須です").max(50, "定義は50文字以下で入力してください"),
    example: z.string().max(150, "150文字以内で入力してください"),
    notes: z.string().max(200, "200文字以内でにゅうりょくしてください"),
})