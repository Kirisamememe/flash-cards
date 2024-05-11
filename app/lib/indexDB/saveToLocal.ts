import { Word } from "@prisma/client";
import { SaveCardsResults, UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { WordCard } from "@/types/WordCard";
import { z } from "zod";
import { partOfSpeech, wordCardSaveRequest } from "@/schemas";
import { createId } from "@paralleldrive/cuid2";
import { openDB } from "@/app/lib/indexDB/indexDB";

export async function saveUserInfoToLocal(user: UserInfo): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const userInfo = {
            id: user.id,
            auto_sync: user.auto_sync,
            use_when_loggedout: user.use_when_loggedout,
            blind_mode: user.blind_mode,
            synced_at: user.synced_at,
            updated_at: user.updated_at
        }

        const request = store.put(userInfo)

        request.onsuccess = () => {
            resolve({
                isSuccess: true,
                data: request.result
            })
        }

        request.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: "IndexDBにほぞんできませんでした",
                    detail: e
                }
            })
        }
    })
}

export async function saveCardsToLocal(userId: string , cards: Word[], forSync: boolean = true): Promise<SaveCardsResults> {
    return new Promise<SaveCardsResults>(async (resolve) => {
        const db = await openDB();
        const transaction = db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        const results: SaveCardsResults = {
            isSuccess: false,
            successResults: [],
            errorResults: [],
            message: ""
        };

        for (const card of cards) {
            try {
                if (card.authorId === userId) {
                    const wordData: WordCard = {
                        id: card.id,
                        phonetics: card.phonetics || undefined,
                        word: card.word,
                        partOfSpeech: card.partOfSpeechId || undefined,
                        definition: card.definition,
                        example: card.example || undefined,
                        notes: card.notes || undefined,
                        is_learned: card.is_learned,
                        created_at: card.created_at,
                        updated_at: card.updated_at,
                        synced_at: forSync ? new Date() : card.synced_at || undefined,
                        learned_at: card.learned_at || undefined,
                        retention_rate: card.retention_rate || 0,
                        author: card.authorId,
                        is_deleted: card.is_deleted || false
                    }

                    const request = store.put(wordData);
                    request.onsuccess = () => {
                        results.successResults.push({
                            isSuccess: true,
                            message: "The changes have been saved.",
                            data: wordData
                        })
                    }

                    request.onerror = (event) => {
                        results.errorResults.push({
                            isSuccess: false,
                            error: {
                                message: `Error saving card: ${(event.target as IDBRequest).error?.message}`
                            }
                        })
                    }
                }

            } catch (error) {
                console.error('Error processing card', error);
                results.errorResults.push({
                    isSuccess: false,
                    error: {
                        message: 'Error processing card'
                    }
                });
            }
        }

        transaction.oncomplete = () => {
            results.isSuccess = true
            resolve(results);
        };

        transaction.onerror = (event) => {
            results.message = `Transaction error: ${(event.target as IDBTransaction).error?.message}`
            resolve(results);
        };
    });
}

export async function saveCardToLocal(userId: string | undefined, values: z.infer<typeof wordCardSaveRequest>, forSync: boolean = false): Promise<UpdatePromiseCommonResult<WordCard>> {
    if (values.author !== undefined && userId !== values.author) {
        return {
            isSuccess: false,
            error: {
                message: "edit_permission_error",
                detail: "edit_permission_error"
            }
        }
    }

    const validatedFields = wordCardSaveRequest.safeParse(values);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
                detail: validatedFields.error.errors
            },
        };
    }

    return new Promise<UpdatePromiseCommonResult<WordCard>>(async (resolve) => {
        try {
            const db = await openDB();
            const transaction = db.transaction(['words'], 'readwrite');
            const store = transaction.objectStore('words');
            const wordData: WordCard = {
                id: values.id === undefined ? createId() : values.id,
                phonetics: values.phonetics,
                word: values.word,
                partOfSpeech: values.partOfSpeech,
                definition: values.definition,
                example: values.example,
                notes: values.notes,
                is_learned: values.is_learned,
                created_at: values.created_at || new Date(),
                updated_at: forSync ? values.updated_at : new Date(),
                synced_at: values.synced_at,
                learned_at: values.learned_at,
                retention_rate: values.retention_rate || 0,
                author: values.author,
                is_deleted: values.is_deleted || false
            }

            console.log(wordData)

            const request = store.put(wordData);
            request.onsuccess = () => {
                resolve({
                    isSuccess: true,
                    data: wordData
                });
            };

            request.onerror = (event) => {
                resolve({
                    isSuccess: false,
                    error: {
                        message: `Error editing card: ${(event.target as IDBRequest).error?.message}`,
                        detail: event
                    }
                });
            };

            // 確実にトランザクションが終了するのを待ちます
            transaction.oncomplete = () => {
                // 処理が成功的に完了
            };
            transaction.onerror = (event) => {
                resolve({
                    isSuccess: false,
                    error: {
                        message: `Transaction error: ${(event.target as IDBTransaction).error?.message}`,
                        detail: event
                    }
                });
            };
        } catch (error) {
            console.error('データベース操作中にエラーが発生しました', error);
            resolve({
                isSuccess: false,
                error: {
                    message: 'データベース操作中にエラーが発生しました',
                    detail: error
                }
            });
        }

    });
}

export function savePartOfSpeechToLocal(value: z.infer<typeof partOfSpeech>, forSync: boolean = false): Promise<UpdatePromiseCommonResult<IDBValidKey>> | UpdatePromiseCommonResult<IDBValidKey> {
    const validatedFields = partOfSpeech.safeParse(value);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
                detail: validatedFields.error.message
            }

        };
    }

    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['partOfSpeech'], 'readwrite')
        const store = transaction.objectStore('partOfSpeech')
        const data = {
            id: value.id || createId(),
            partOfSpeech: value.partOfSpeech,
            author: value.author,
            is_deleted: value.is_deleted,
            created_at: value.created_at || new Date(),
            updated_at: forSync ? value.updated_at : new Date(),
            synced_at: value.synced_at
        }
        const request = store.put(data)

        request.onsuccess = () => {
            resolve({
                isSuccess: true,
                data: request.result
            })
        }

        request.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: "品詞を保存できませんでした",
                    detail: e
                }

            })
        }
    })
}