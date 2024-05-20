'use server'

import {auth} from "@/app/lib/auth";

export default async function getUserId() {
    const session = await auth()

    return 
}