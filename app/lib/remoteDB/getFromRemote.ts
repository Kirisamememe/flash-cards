'use server'

import { GetPromiseCommonResult, } from "@/types/ActionsResult";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PartOfSpeech, Word } from "@prisma/client";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function getUserInfoFromRemote(userId: string): Promise<GetPromiseCommonResult<UserInfoFormRemote | null>> {
    try {
        const result = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                synced_at: true,
                auto_sync: true,
                updatedAt: true,
                use_when_loggedout: true,
                blind_mode: true
            }
        })

        return { isSuccess: true, data: result }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。" , detail: e} }
    } finally {
        prisma.$disconnect
    }
}

// 品詞を取得
export async function getPartOfSpeechesFromRemote(userId: string): Promise<GetPromiseCommonResult<PartOfSpeech[]>> {
    try {
        const data = await prisma.partOfSpeech.findMany({
            where: {
                authorId: userId
            }
        })
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。", detail: e } }
    }
}

// 単語を取得
export async function getCardsFromRemote(userId: string): Promise<GetPromiseCommonResult<Word[]>> {
    try {
        const data = await prisma.word.findMany({
            where: {
                authorId: userId
            }
        })
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。", detail: e } }
    }
}