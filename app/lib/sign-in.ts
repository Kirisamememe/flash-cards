// 'use server';
//
// import { signIn as signInByAuthJS } from '@/app/lib/auth';
// import {z} from "zod";
// import {signInSchema} from "@/types";
// import {SignResult} from "@/types/ActionsResult";
// import {getUserByEmail} from "@/app/lib/user";
// import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
// import {AuthError} from "next-auth";
//
// export const signIn = async (
//     values: z.infer<typeof signInSchema>
// ): Promise<SignResult> => {
//     const validatedFields = signInSchema.safeParse(values);
//
//     if (!validatedFields.success) {
//         return {
//             isSuccess: false,
//             error: {
//                 message: validatedFields.error.message,
//             },
//         };
//     }
//
//     const { email, password } = validatedFields.data;
//
//     const existingUser = await getUserByEmail(email);
//
//     if (!existingUser) {
//         return {
//             isSuccess: false,
//             error: {
//                 message: 'Invalid credentials!',
//             },
//         };
//     }
//
//     try {
//         await signInByAuthJS('credentials', {
//             email,
//             password,
//             redirectTo: DEFAULT_LOGIN_REDIRECT,
//         });
//
//         return {
//             isSuccess: true,
//             message: 'ログインに成功しました。',
//         };
//     } catch (error) {
//         if (error instanceof AuthError) {
//             switch (error.type) {
//                 case 'CredentialsSignin':
//                     return {
//                         isSuccess: false,
//                         error: {
//                             message: 'メールアドレスまたはパスワードが間違っています。',
//                         },
//                     };
//                 default:
//                     return {
//                         isSuccess: false,
//                         error: {
//                             message: 'ログインに失敗しました。',
//                         },
//                     };
//             }
//         }
//
//         throw error;
//     }
// };