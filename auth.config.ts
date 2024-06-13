// import bcrypt from 'bcryptjs';
// import type { NextAuthConfig } from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import { signInSchema } from './types';
//
// export default {
//     providers: [
//         Credentials({
//             async authorize(credentials) {
//                 const validatedFields = signInSchema.safeParse(credentials);
//
//                 if (validatedFields.success) {
//                     const { email, password } = validatedFields.data;
//
//                     const user: any = await getUserByEmail(email);
//                     if (!user) {
//                         return null
//                     }else {
//                         const passwordsMatch = await bcrypt.compare(password, user.password);
//
//                         if (passwordsMatch) return user;
//                     }
//                 }
//                 return null;
//             },
//         }),
//     ],
// } satisfies NextAuthConfig;