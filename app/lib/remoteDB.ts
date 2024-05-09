'use server';

import { PrismaClient } from '@prisma/client/edge'
import { PartOfSpeechLocal, WordCardToRemote } from "@/types/WordCard";
import { withAccelerate } from "@prisma/extension-accelerate";
import {
    GetCardsResult,
    GetPartOfSpeechesResult,
    GetUserInfoFromRemoteResult, UpdatePromiseCommonResult,
    UpsertCardResult, UpsertPartOfSpeechResult
} from "@/types/ActionsResult";


const prisma = new PrismaClient().$extends(withAccelerate())

export async function getUserInfoFromRemote(userId: string): Promise<GetUserInfoFromRemoteResult> {
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
        return {isSuccess: false, error: "データベースとの同期中にエラーが発生しました。", detail: e}
    } finally {
        prisma.$disconnect
    }

}

// 品詞を取得
export async function getPartOfSpeechesFromRemote(userId: string): Promise<GetPartOfSpeechesResult> {
    try {
        const data = await prisma.partOfSpeech.findMany({
            where: {
                authorId: userId
            }
        })
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }
}

// 単語を取得
export async function getCardsFromRemote(userId: string): Promise<GetCardsResult> {
    try {
        const data = await prisma.word.findMany({
            where: {
                authorId: userId
            }
        })
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }
}


export async function updateRemoteUserInfo(userInfo: UserInfoToRemote): Promise<UpdatePromiseCommonResult> {
    try {
        const result = await prisma.user.update({
            where: {
                id: userInfo.id
            },
            data: {
                synced_at: userInfo.synced_at,
                auto_sync: userInfo.auto_sync,
                use_when_loggedout: userInfo.use_when_loggedout,
                blind_mode: userInfo.blind_mode
            },
            select: {
                synced_at: true,
                auto_sync: true,
                use_when_loggedout: true,
                blind_mode: true
            }
        })

        return { isSuccess: true, data: result }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: { message: "データベースとの同期中にエラーが発生しました。", detail: e } }
    } finally {
        await prisma.$disconnect()
    }
}

export async function upsertCardToRemote(flashcard: WordCardToRemote): Promise<UpsertCardResult> {
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
                if (existingCard.updated_at <= flashcard.updated_at) {
                    result = await trx.word.update({
                        where: { id: flashcard.id },
                        data: {
                            word: flashcard.word,
                            phonetics: flashcard.phonetics,
                            ...(flashcard.partOfSpeech?.id ? { part_of_speech: {
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
                                }} : {}),
                            definition: flashcard.definition,
                            example: flashcard.example,
                            notes: flashcard.notes,
                            is_learned: flashcard.is_learned,
                            updated_at: flashcard.updated_at,
                            synced_at: new Date(),
                            learned_at: flashcard.learned_at,
                            retention_rate: flashcard.retention_rate,
                            is_deleted: flashcard.is_deleted,
                        }
                    });
                }
                // else {
                //     // 更新日時が古い場合はエラーを投げるか？
                //     throw new Error("既存のレコードが新しく、更新はスキップされました。");
                // }
            } else {
                // 現在のレコードがない場合は作成処理を行う
                result = await trx.word.create({
                    data: {
                        id: flashcard.id,
                        word: flashcard.word,
                        phonetics: flashcard.phonetics,
                        ...(flashcard.partOfSpeech?.id ? { part_of_speech: {
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
                            }} : {}),
                        definition: flashcard.definition,
                        example: flashcard.example,
                        notes: flashcard.notes,
                        created_at: flashcard.created_at,
                        updated_at: flashcard.updated_at,
                        synced_at: new Date(),
                        learned_at: flashcard.learned_at,
                        retention_rate: flashcard.retention_rate,
                        author: {connect: {id: flashcard.author}},
                        is_deleted: flashcard.is_deleted,
                    }
                });
            }
            return { isSuccess: true, data: result };
        } catch (e) {
            console.error(e);
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました。", detail: e } };
        }
    });



    // try {
    //     return await prisma.word.upsert({
    //         where: { id: flashcard.id },
    //         update: {
    //             word: flashcard.word,
    //             phonetics: flashcard.phonetics,
    //             ...(flashcard.partOfSpeech?.id ? { part_of_speech: {
    //                 connectOrCreate: {
    //                     where: {
    //                         id: flashcard.partOfSpeech.id,
    //                     },
    //                     create: {
    //                         id: flashcard.partOfSpeech.id,
    //                         part_of_speech: flashcard.partOfSpeech?.partOfSpeech,
    //                         author: {
    //                             connect: {
    //                                 id: flashcard.author
    //                             }
    //                         },
    //                         created_at: flashcard.partOfSpeech.created_at,
    //                         updated_at: flashcard.partOfSpeech.updated_at,
    //                         synced_at: new Date()
    //                     }
    //                 }
    //             }} : {}),
    //             definition: flashcard.definition,
    //             example: flashcard.example,
    //             notes: flashcard.notes,
    //             is_learned: flashcard.is_learned,
    //             updated_at: flashcard.updated_at,
    //             synced_at: new Date(),
    //             learned_at: flashcard.learned_at,
    //             retention_rate: flashcard.retention_rate,
    //             is_deleted: flashcard.is_deleted,
    //         },
    //         create: {
    //             id: flashcard.id,
    //             word: flashcard.word,
    //             phonetics: flashcard.phonetics,
    //             ...(flashcard.partOfSpeech?.id ? { part_of_speech: {
    //                 connectOrCreate: {
    //                     where: {
    //                         id: flashcard.partOfSpeech.id,
    //                     },
    //                     create: {
    //                         id: flashcard.partOfSpeech.id,
    //                         part_of_speech: flashcard.partOfSpeech?.partOfSpeech,
    //                         author: {
    //                             connect: {
    //                                 id: flashcard.author
    //                             }
    //                         },
    //                         created_at: flashcard.partOfSpeech.created_at,
    //                         updated_at: flashcard.partOfSpeech.updated_at,
    //                         synced_at: new Date()
    //                     }
    //                 }
    //             }} : {}),
    //             definition: flashcard.definition,
    //             example: flashcard.example,
    //             notes: flashcard.notes,
    //             created_at: flashcard.created_at,
    //             updated_at: flashcard.updated_at,
    //             synced_at: new Date(),
    //             learned_at: flashcard.learned_at,
    //             retention_rate: flashcard.retention_rate,
    //             author: {connect: {id: flashcard.author}},
    //             is_deleted: flashcard.is_deleted,
    //         }
    //     })
    // } catch (e) {
    //     console.error(e)
    //     return { error: "データベースとの同期中にエラーが発生しました。", detail: e}
    // }
}

export async function upsertPartOfSpeechToRemote(partOfSpeech: PartOfSpeechLocal): Promise<UpsertPartOfSpeechResult> {
    return await prisma.$transaction(async (trx) => {
        try {
            const existingData = await trx.partOfSpeech.findUnique({
                where: { id: partOfSpeech.id },
            })


            if (existingData) {
                if (existingData.updated_at <= partOfSpeech.updated_at) {
                    const updatedData = trx.partOfSpeech.update({
                        where: { id: partOfSpeech.id },
                        data: {
                            part_of_speech: partOfSpeech.partOfSpeech,
                            is_deleted: partOfSpeech.is_deleted,
                            updated_at: partOfSpeech.updated_at,
                            synced_at: new Date()
                        }
                    })

                    return { isSuccess: true, data: updatedData };
                }
                else {
                    return { isSuccess: true, data: existingData }
                }
            }
            else {
                const createdData = trx.partOfSpeech.create({
                    data: {
                        id: partOfSpeech.id,
                        part_of_speech: partOfSpeech.partOfSpeech,
                        author: { connect: {id: partOfSpeech.author } },
                        is_deleted: partOfSpeech.is_deleted,
                        created_at: partOfSpeech.created_at,
                        updated_at: partOfSpeech.updated_at,
                        synced_at: new Date()
                    }
                })

                return { isSuccess: true, data: createdData };
            }

        } catch (e) {
            console.error(e)
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました。", detail: e } }
        }
    })
}

export async function updateUserInfoToRemote(userInfo: UserInfoToRemote): Promise<UpdatePromiseCommonResult> {
    return await prisma.$transaction(async (trx) => {
        try {
            const existingData = await trx.user.findUnique({
                where: { id: userInfo.id },
                select: { updatedAt: true }
            })

            let result

            if (existingData) {
                if (existingData.updatedAt <= userInfo.updatedAt) {
                    result = await trx.user.update({
                        where: { id: userInfo.id },
                        data: {
                            updatedAt: userInfo.updatedAt,
                            synced_at: new Date(),
                            auto_sync: userInfo.auto_sync,
                            use_when_loggedout: userInfo.use_when_loggedout,
                            blind_mode: userInfo.blind_mode
                        }
                    })
                }
            }else {
                return { isSuccess: false, error: { message: "ユーザーが存在しません", detail: new Error("ユーザーが存在しません")} }
            }

            return { isSuccess: true, data: result }
        } catch (e) {
            return { isSuccess: false, error: { message: "トランザクション処理中にエラーが発生しました", detail: e } }
        }
    })
}
