'use server'

import { UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { PartOfSpeechLocal, WordCardToRemote } from "@/types/WordIndexDB";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PartOfSpeech, Word } from "@prisma/client";
import { auth } from "@/app/lib/auth";

const prisma = new PrismaClient().$extends(withAccelerate())

export async function upsertCardToRemote(flashcard: WordCardToRemote): Promise<UpdatePromiseCommonResult<Word | undefined>> {
    // const session = await auth()
    // if (!session?.user) throw new Error("権限がありません")

    return await prisma.$transaction(async (trx) => {
        try {
            // 現在のレコードを検索する
            const existingCard = await trx.word.findUnique({
                where: { id: flashcard.id },
                select: { updated_at: true } // updated_at のみを取得する
            });

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
                            ...(flashcard.partOfSpeech?.id ? {
                                part_of_speech: {
                                    connectOrCreate: {
                                        where: {
                                            id: flashcard.partOfSpeech.id,
                                        },
                                        create: {
                                            id: flashcard.partOfSpeech.id,
                                            part_of_speech: flashcard.partOfSpeech?.partOfSpeech,
                                            author: {
                                                connect: {
                                                    id: flashcard.author
                                                }
                                            },
                                            created_at: flashcard.partOfSpeech.created_at,
                                            updated_at: flashcard.partOfSpeech.updated_at,
                                            synced_at: new Date()
                                        }
                                    }
                                }
                            } : {}),
                            definition: flashcard.definition,
                            example: flashcard.example,
                            notes: flashcard.notes,
                            is_learned: flashcard.is_learned,
                            updated_at: flashcard.updated_at,
                            synced_at: new Date(),
                            learned_at: flashcard.learned_at,
                            retention_rate: flashcard.retention_rate,
                            is_deleted: flashcard.is_deleted,
                            records: {
                                create: flashcard.records.map((record) => ({
                                    id: record.id,
                                    // word: {
                                    //     connect: {
                                    //         id: record.word_id
                                    //     }
                                    // },
                                    // word_id: record.word_id,
                                    is_correct: record.is_correct,
                                    reviewed_at: record.reviewed_at,
                                    time: record.time,
                                    synced_at: new Date()
                                }))
                            }
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
                        ...(flashcard.partOfSpeech?.id ? {
                            part_of_speech: {
                                connectOrCreate: {
                                    where: {
                                        id: flashcard.partOfSpeech.id,
                                    },
                                    create: {
                                        id: flashcard.partOfSpeech.id,
                                        part_of_speech: flashcard.partOfSpeech?.partOfSpeech,
                                        author: {
                                            connect: {
                                                id: flashcard.author
                                            }
                                        },
                                        created_at: flashcard.partOfSpeech.created_at,
                                        updated_at: flashcard.partOfSpeech.updated_at,
                                        synced_at: new Date()
                                    }
                                }
                            }
                        } : {}),
                        definition: flashcard.definition,
                        example: flashcard.example,
                        notes: flashcard.notes,
                        created_at: flashcard.created_at,
                        updated_at: flashcard.updated_at,
                        synced_at: new Date(),
                        learned_at: flashcard.learned_at,
                        retention_rate: flashcard.retention_rate,
                        author: { connect: { id: flashcard.author } },
                        is_deleted: flashcard.is_deleted,
                        ...(flashcard.records.length > 0 && {
                            records: {
                                create: flashcard.records.map((record) => ({
                                    id: record.id,
                                    // word: {
                                    //     connect: {
                                    //         id: record.word_id
                                    //     }
                                    // },
                                    // word_id: record.word_id,
                                    is_correct: record.is_correct,
                                    reviewed_at: record.reviewed_at,
                                    time: record.time,
                                    synced_at: new Date()
                                }))
                            }
                        })
                    }
                })
            }

            if (!result && flashcard.records.length > 0) {
                await trx.record.createMany({
                    data: (flashcard.records.map(record => ({
                        id: record.id,
                        word_id: record.word_id,
                        is_correct: record.is_correct,
                        reviewed_at: record.reviewed_at,
                        time: record.time,
                        synced_at: new Date()
                    })))
                })
            }

            console.log("Result: ")
            console.log(result)
            return { isSuccess: true, data: result };
        } catch (e) {
            console.log("Error: ")
            console.error(e);
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました。", detail: e } };
        }
    });
}

export async function upsertPartOfSpeechToRemote(partOfSpeech: PartOfSpeechLocal): Promise<UpdatePromiseCommonResult<PartOfSpeech | undefined>> {
    // const session = await auth()
    // if (!session) throw new Error("権限がありません")

    return await prisma.$transaction(async (trx) => {
        try {
            const existingData = await trx.partOfSpeech.findUnique({
                where: { id: partOfSpeech.id },
                select: { updated_at: true }
            })

            let result;

            if (existingData) {
                if (existingData.updated_at < partOfSpeech.updated_at) {
                    result = await trx.partOfSpeech.update({
                        where: { id: partOfSpeech.id },
                        data: {
                            part_of_speech: partOfSpeech.partOfSpeech,
                            is_deleted: partOfSpeech.is_deleted,
                            updated_at: partOfSpeech.updated_at,
                            synced_at: new Date()
                        }
                    })
                }
            } else {
                result = await trx.partOfSpeech.create({
                    data: {
                        id: partOfSpeech.id,
                        part_of_speech: partOfSpeech.partOfSpeech,
                        author: { connect: { id: partOfSpeech.author } },
                        is_deleted: partOfSpeech.is_deleted,
                        created_at: partOfSpeech.created_at,
                        updated_at: partOfSpeech.updated_at,
                        synced_at: new Date()
                    }
                })
            }

            console.log(`${result && result.id}挿入したよん＝＝＝＝＝＝＝＝＝＝＝＝`)
            return { isSuccess: true, data: result };

        } catch (e) {
            console.error(e)
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました。", detail: e } }
        }
    })
}

export async function updateUserInfoToRemote(userInfo: UserInfoToRemote): Promise<UpdatePromiseCommonResult<UserInfoFormRemote | undefined>> {
    const session = await auth()
    if (!session) throw new Error("権限がありません")

    return await prisma.$transaction(async (trx) => {
        try {
            const existingData = await trx.user.findUnique({
                where: { id: userInfo.id },
                select: { updatedAt: true }
            })

            let result

            if (existingData) {
                if (existingData.updatedAt < userInfo.updatedAt) {
                    result = await trx.user.update({
                        where: { id: userInfo.id },
                        data: {
                            image: userInfo.image,
                            name: userInfo.name,
                            updatedAt: userInfo.updatedAt,
                            synced_at: new Date(),
                            auto_sync: userInfo.auto_sync,
                            use_when_loggedout: userInfo.use_when_loggedout,
                            blind_mode: userInfo.blind_mode
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

// export async function saveRecordToRemote(record: RecordIndexDB): Promise<UpdatePromiseCommonResult<RecordIndexDB | undefined>> {
//     const session = await auth()
//     if (!session) throw new Error("権限がありません")
//
//     return await prisma.$transaction(async (trx) => {
//         try {
//
//
//
//             return { isSuccess: true, data: result }
//         } catch (e) {
//             return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました", detail: e } }
//         }
//     })
// }