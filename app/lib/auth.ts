import NextAuth from "next-auth"
import "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from "@/app/lib/user";
import GitHub from "@auth/core/providers/github";
import { signInSchema } from "@/types";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from "@prisma/extension-accelerate";
import Google from "@auth/core/providers/google";
import Twitter from "@auth/core/providers/twitter";

const prisma = new PrismaClient().$extends(withAccelerate())

declare module "next-auth" {
    interface Session {
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
    }
}

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
        }),
        Twitter({
            clientId: process.env.AUTH_TWITTER_ID,
            clientSecret: process.env.AUTH_TWITTER_SECRET,
            // version: "2.0", // opt-in to Twitter OAuth 2.0
        })
    ],
    callbacks: {
        authorized({ request, auth }) {
            const { pathname } = request.nextUrl
            if (pathname === "/user") return !!auth
            return true
        },
        jwt({ token, trigger, session, account }) {
            if (trigger === "update") token.name = session.user.name
            if (account?.provider === "keycloak") {
                return { ...token, accessToken: account.access_token }
            }
            return token
        },
        async session({ session, token }) {
            if (token?.accessToken) {
                session.accessToken = token.accessToken
            }
            return session
        },
    },
    experimental: {
        enableWebAuthn: true,
    }
})

