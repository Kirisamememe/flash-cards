'use server'

import { UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { WordCardToRemote } from "@/types/WordIndexDB";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Word } from "@prisma/client";
import { auth } from "@/app/lib/auth";
import { UserInfoToRemote } from "@/types/User";
import { createId } from "@paralleldrive/cuid2";
import { MaterialIndexDB } from "@/types/AIBooster";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function upsertCardToRemote(flashcard: WordCardToRemote) {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    console.log(flashcard.word)

    return await prisma.$transaction(async (trx) => {
        try {
            // 現在のレコードを検索する
            const existingCard = await trx.word.findUnique({
                where: { id: flashcard.id },
                include: {
                    records: true
                }
            })

            // console.log(existingCard)

            let result;

            // カードが存在するかどうかに応じて、適切な処理を行う
            if (existingCard) {
                // 現在のレコードがあり、且つ更新日時が問題なければ更新処理を行う
                if (existingCard.updated_at < flashcard.updated_at) {
                    result = await trx.word.update({
                        where: { id: flashcard.id },
                        data: {
                            word: flashcard.word,
                            phonetics: flashcard.phonetics,
                            pos: flashcard.pos,
                            definition: flashcard.definition,
                            example: flashcard.example,
                            notes: flashcard.notes,
                            updated_at: flashcard.updated_at,
                            synced_at: new Date(),
                            learned_at: flashcard.learned_at,
                            retention_rate: flashcard.retention_rate,
                            is_deleted: flashcard.is_deleted,
                            records: {
                                create: flashcard.records.map((val) => ({
                                    id: createId(),
                                    is_correct: val.is_correct,
                                    reviewed_at: val.reviewed_at,
                                    time: val.time,
                                    synced_at: new Date()
                                }))
                            }
                        }, include: {
                            records: true
                        }
                    })
                }

            } else {
                // 現在のレコードがない場合は作成処理を行う
                result = await trx.word.create({
                    data: {
                        id: flashcard.id,
                        word: flashcard.word,
                        phonetics: flashcard.phonetics,
                        pos: flashcard.pos,
                        definition: flashcard.definition,
                        example: flashcard.example,
                        notes: flashcard.notes,
                        created_at: flashcard.created_at,
                        updated_at: flashcard.updated_at,
                        synced_at: new Date(),
                        learned_at: flashcard.learned_at,
                        retention_rate: flashcard.retention_rate,
                        author: { connect: { id: flashcard.author } },
                        ...(flashcard.records.length > 0 && {
                            records: {
                                create: flashcard.records.map((val) => ({
                                    id: createId(),
                                    is_correct: val.is_correct,
                                    reviewed_at: val.reviewed_at,
                                    time: val.time,
                                    synced_at: new Date()
                                }))
                            }
                        })
                    }, include: {
                        records: true
                    }
                })
            }

            if (!result && flashcard.records.length > 0) {
                await trx.record.createMany({
                    data: (flashcard.records.map(record => ({
                        id: createId(),
                        word_id: flashcard.id,
                        is_correct: record.is_correct,
                        reviewed_at: record.reviewed_at,
                        time: record.time,
                        synced_at: new Date()
                    })))
                })
            }

            if (!result) {
                if (existingCard) {
                    return { isSuccess: true, data: existingCard }
                } else {
                    return { isSuccess: false, error: { message: "データを取得できませんでした。", detail: "" } };
                }
            }

            console.log("Result: ")
            console.log(result)
            return { isSuccess: true, data: result };
        } catch (e) {
            console.log("Error: ")
            console.error(e);
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました。", detail: e } };
        }
    })
}

export async function updateUserInfoToRemote(userInfo: UserInfoToRemote) {
    const session = await auth()
    if (!session) throw new Error("権限がありません")
    if (userInfo.id !== session.user.id) throw new Error("不正なリクエストです")
    if (userInfo.trans_lang === userInfo.learning_lang) throw new Error("")

    return await prisma.$transaction(async (trx) => {
        try {
            const existingData = await trx.user.findUnique({
                where: { id: userInfo.id },
                select: { updated_at: true }
            })

            let result

            if (existingData) {
                if (existingData.updated_at < userInfo.updated_at) {
                    result = await trx.user.update({
                        where: { id: userInfo.id },
                        data: {
                            image: userInfo.image,
                            name: userInfo.name,
                            updated_at: userInfo.updated_at,
                            synced_at: new Date(),
                            auto_sync: userInfo.auto_sync,
                            blind_mode: userInfo.blind_mode,
                            learning_lang: userInfo?.learning_lang || null,
                            trans_lang: userInfo?.trans_lang || null
                        }
                    })
                }
            } else {
                return {
                    isSuccess: false,
                    error: { message: "ユーザーが存在しません", detail: new Error("ユーザーが存在しません") }
                }
            }

            console.log(result)
            return { isSuccess: true, data: result }
        } catch (e) {
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました", detail: e } }
        }
    })
}

export async function upsertMaterialToRemote(material: MaterialIndexDB) {
    const session = await auth()
    if (!session) throw new Error("権限がありません")
    if (material.author !== session.user.id) throw new Error("不正なリクエストです")

    return await prisma.$transaction(async (trx) =>{
        try {
            const existingMaterial = await trx.material.findUnique({
                where: { id: material.id },
                select: { updated_at: true }
            })

            if (existingMaterial) {
                if (existingMaterial.updated_at < material.updated_at) {
                    await trx.material.update({
                        where: { id: material.id },
                        data: {
                            trans_lang: material.translation.lang,
                            translation: material.translation.text.join("\n"),
                            bookmarked_at: material.bookmarked_at,
                            updated_at: material.updated_at,
                            synced_at: new Date()
                        }
                    })
                }
            } else {
                await trx.material.create({
                    data: {
                        id: material.id,
                        title: material.title,
                        content: material.content.join("\n"),
                        trans_lang: material.translation.lang,
                        translation: material.translation.text.join("\n"),
                        generated_by: material.generated_by,
                        author: { connect: { id: material.author } },
                        created_at: material.created_at,
                        bookmarked_at: material.bookmarked_at,
                        updated_at: material.updated_at,
                        deleted_at: material.deleted_at,
                        synced_at: new Date()
                    }
                })
            } 

            return { isSuccess: true }
        } catch (error) {
            console.error(error)
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました", detail: error } }
        }
    })
}