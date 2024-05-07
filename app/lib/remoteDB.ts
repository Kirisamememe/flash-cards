'use server';

import { PrismaClient } from '@prisma/client/edge'
import {PartOfSpeech, PartOfSpeechRemote, WordCardToRemote} from "@/types/WordCard";
import { withAccelerate } from "@prisma/extension-accelerate";
import {GetCardsResult, GetPartOfSpeechesResult, UpsertCardResult} from "@/types/ActionsResult";


const prisma = new PrismaClient().$extends(withAccelerate())

export async function getSyncAt(userId: string) {
    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            synced_at: true
        }
    })
}

// TODO　品詞を取得
export async function getPartOfSpeechesFromRemote(): Promise<GetPartOfSpeechesResult> {
    try {
        const data = await prisma.partOfSpeech.findMany()
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }
}

// TODO　単語を取得
export async function getCardsFromRemote(): Promise<GetCardsResult> {
    try {
        const data = await prisma.word.findMany()
        return { isSuccess: true, data: data }
    } catch (e) {
        console.error(e)
        return { isSuccess: false, error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }

}


export async function updateSyncAt(userId: string) {
    try {
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                synced_at: new Date()
            }
        })
    } catch (e) {
        console.error(e)
        return { error: "データベースとの同期中にエラーが発生しました。", detail: e}
    } finally {
        await prisma.$disconnect()
    }
}

export async function upsertCard(flashcard: WordCardToRemote): Promise<UpsertCardResult> {
    try {
        return await prisma.word.upsert({
            where: {
                id: flashcard.id
            },
            update: {
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
                            }
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
            },
            create: {
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
                            }
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
        })
    } catch (e) {
        console.error(e)
        return { error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }
}

export async function upsertPartOfSpeech(partOfSpeech: PartOfSpeech): Promise<any> {
    try {
        return await prisma.partOfSpeech.upsert({
            where: {
                id: partOfSpeech.id
            },
            update: {
                part_of_speech: partOfSpeech.partOfSpeech,
                is_deleted: partOfSpeech.is_deleted,
            },
            create: {
                id: partOfSpeech.id,
                part_of_speech: partOfSpeech.partOfSpeech,
                author: { connect: {id: partOfSpeech.author } },
                is_deleted: partOfSpeech.is_deleted
            }
        })
    } catch (e) {
        console.error(e)
        return { error: "データベースとの同期中にエラーが発生しました。", detail: e}
    }

}
