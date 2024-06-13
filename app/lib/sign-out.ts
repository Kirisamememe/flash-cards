'use server'

import { signOut } from "@/app/lib/auth"

export async function signOutHandler() {
    await signOut({ redirectTo:"/", redirect: true })
}