'use server'

import { auth } from "@/app/lib/auth";
import { isEnglish } from "@/app/lib/utils";

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY || "",
        'X-RapidAPI-Host': process.env.RAPID_API_HOST || ""
    }
};


export const fetchFromWordsAPI = async (word: string) => {
    const session = await auth()
    if (!session || session?.user.role !== "ADMIN") throw new Error("権限がありません")
    if (!isEnglish(word)) throw new Error("英語ではありません")

    return fetch(`${process.env.WORDS_API_URL}${word}`, options)
        .then((res) => {
            console.log(`${process.env.WORDS_API_URL}${word}`)
            return res.json()
        })
}
