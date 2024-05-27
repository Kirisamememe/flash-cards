import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from "@/app/lib/user";
import GitHub from "@auth/core/providers/github";
import { signInSchema } from "@/types";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from "@prisma/extension-accelerate";
import Google from "@auth/core/providers/google";

const prisma = new PrismaClient().$extends(withAccelerate())

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                // logic to salt and hash password
                const { email, password } = await signInSchema.parseAsync(credentials)

                const pwHash = await bcrypt.hash(credentials.password as string, 10)

                // logic to verify if user exists
                const user = await getUserByEmail(email)

                if (!user) {
                    // No user found, so this is their first attempt to login
                    // meaning this is also the place you could do registration
                    throw new Error("User not found.")
                }

                if (!user.password){
                    throw new Error("OAuthでログインしてください")
                }

                if (!await bcrypt.compare(password, user.password)) {
                    throw new Error("パスワードが正しくありません")
                }

                // return user object with the their profile data
                return user
            },
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        })
    ],
    // events: {
    //     async linkAccount({ user }) {
    //         await db.user.update({
    //             where: { id: user.id },
    //             data: { emailVerified: new Date() },
    //         });
    //     },
    // },
    // callbacks: {
    //     async session({ token, session }) {
    //         if (token.sub && session.user) {
    //             session.user.id = token.sub;
    //         }
    //         // if (token.role && session.user) {
    //         //     session.user.role = token.role as 1 | 2;
    //         // }
    //         return session;
    //     },
    //     async jwt({ token }) {
    //         if (!token.sub) return token;
    //         const existingUser = await getUserById(token.sub);
    //         // if (!existingUser) return token;
    //         // token.role = existingUser.roleId;
    //         return token;
    //     },
    // },
    // session: { strategy: 'jwt' },
})