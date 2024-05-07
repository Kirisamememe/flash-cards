'use server'

import { signOut } from "@/auth"

export async function signOutHandler() {
    await signOut()
}