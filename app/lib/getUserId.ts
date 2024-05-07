'use server'

import {auth} from "@/auth";

export default async function getUserId() {
    const session = await auth()

    return 
}