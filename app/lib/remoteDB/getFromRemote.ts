'use server'

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function getUserInfoFromRemote(userId: string) {
    try {
        const result = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                image: true,
                synced_at: true,
                auto_sync: true,
                updated_at: true,
                blind_mode: true,
                learning_lang: true,
                trans_lang: true
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

// 単語を取得
export async function getCardsFromRemote(userId: string) {
    try {
        const data = await prisma.word.findMany({
            where: {
                authorId: userId
            },
            include: {
                records: true
            }
        })
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。", detail: e } }
    } finally {
        prisma.$disconnect
    }
}

export async function getMaterialsFromRemote(userId: string) {
    try {
        const data = await prisma.material.findMany({
            where: {
                authorId: userId
            }
        })
        return { isSuccess: true, data: data }
    } catch (error) {
        console.error(error)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。", detail: error } }
    } finally {
        prisma.$disconnect
    }
}