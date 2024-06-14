import { SaveCardsResults, UpdatePromiseCommonResult } from "@/types/ActionsResult";
import {
    EN2ENItem,
    PartOfSpeechLocal,
    RecordIndexDB,
    WordDataMerged,
    WordIndexDB,
    WordRemote
} from "@/types/WordIndexDB";
import { z } from "zod";
import { partOfSpeech, saveWordCardRequest } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import { openDB } from "@/app/lib/indexDB/indexDB";

export async function saveUserInfoToLocal(user: UserInfo): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const userInfo = {
            id: user.id,
            image: user.image,
            name: user.name,
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

export async function saveCardsToLocal(userId: string , cards: WordRemote[], forSync: boolean = true): Promise<SaveCardsResults> {
    return new Promise<SaveCardsResults>(async (resolve) => {
        const db = await openDB();
        const transaction = db.transaction(['words', 'records'], 'readwrite');
        const store = transaction.objectStore('words');
        const recordStore = transaction.objectStore('records');
        const results: SaveCardsResults = {
            isSuccess: false,
            successResults: [],
            errorResults: [],
            message: ""
        };

        for (const card of cards) {
            try {
                if (card.authorId === userId) {
                    const wordData: WordIndexDB = {
                        id: card.id,
                        phonetics: card?.phonetics || "",
                        word: card.word,
                        partOfSpeech: card?.partOfSpeechId || undefined,
                        definition: card.definition,
                        example: card?.example || "",
                        notes: card?.notes || "",
                        is_learned: card.is_learned,
                        created_at: card.created_at,
                        updated_at: card.updated_at,
                        synced_at: forSync ? new Date() : card.synced_at || undefined,
                        learned_at: card?.learned_at || undefined,
                        retention_rate: card.retention_rate || 0,
                        author: card.authorId,
                        is_deleted: card.is_deleted || false
                    }

                    const request = store.put(wordData);
                    card.records && card.records.map(record => {
                        recordStore.put(record);
                    })
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



export async function saveCardToLocal(
    userId: string | undefined,
    values: z.infer<typeof saveWordCardRequest>,
    forSync: boolean = false,
    isAdding: boolean = false
): Promise<UpdatePromiseCommonResult<WordDataMerged>> {

    if (values.author && userId !== values.author) {
        // 単語に作者が存在する、且つその作者は変更をリクエストした人ではない
        return {
            isSuccess: false,
            error: {
                message: "edit_permission_error",
                detail: "edit_permission_error"
            }
        }
    }

    const validatedFields = saveWordCardRequest.safeParse(values);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
                detail: validatedFields.error.errors
            },
        }
    }

    return new Promise<UpdatePromiseCommonResult<WordDataMerged>>(async (resolve, reject) => {
        try {
            const db = await openDB()
            const transaction = db.transaction(['words', 'partOfSpeech'], 'readwrite')
            const wordStore = transaction.objectStore('words')
            const partOfSpeechStore = transaction.objectStore('partOfSpeech')
            const wordData: WordIndexDB = {
                ...values,
                id: values.id ? values.id : createId(),
                partOfSpeech: values.partOfSpeech,
                created_at: isAdding ? new Date() : values.created_at as Date,
                updated_at: forSync ? values.updated_at as Date : new Date(),
                synced_at: values.synced_at,
                learned_at: values.learned_at,
                retention_rate: values.retention_rate || 0,
                author: values.author || userId,
                is_deleted: values.is_deleted || false
            }

            const wordRequest = wordStore.put(wordData)
            let partOfSpeechResult: PartOfSpeechLocal
            if (wordData.partOfSpeech) {
                const posRequest = partOfSpeechStore.get(wordData.partOfSpeech)
                posRequest.onsuccess = () => {
                    partOfSpeechResult = posRequest.result
                }
            }

            transaction.oncomplete = () => {
                if (wordRequest.result) {
                    const mergedData = {
                        ...wordData,
                        partOfSpeech: partOfSpeechResult,
                    }

                    console.log("IndexDBで整形したデータ：")
                    console.log(wordData)

                    resolve({
                        isSuccess: true,
                        data: mergedData
                    })
                } else {
                    reject({
                        isSuccess: false,
                        error: {
                            message: "データに不備があるようです",
                            detail: new Error("")
                        }
                    })
                }
            }

            // 確実にトランザクションが終了するのを待ちます

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
            console.error('データベース操作中にエラーが発生しました', error)
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

export function savePartOfSpeechToLocal(value: z.infer<typeof partOfSpeech>, forSync: boolean = false): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const validatedFields = partOfSpeech.safeParse(value);

        if (!validatedFields.success) {
            reject({
                isSuccess: false,
                error: {
                    message: validatedFields.error.message,
                    detail: validatedFields.error.message
                }

            })
        }

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
            synced_at: forSync ? new Date() : undefined
        }
        const request = store.put(data)

        request.onsuccess = () => {
            console.log("posを保存した：")
            console.log(request.result)
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

export function saveRecordToLocal(record: RecordIndexDB) {
    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['records'], 'readwrite')
        const store = transaction.objectStore('records')
        const request = store.put(record)

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
                    message: "レビュー記録を保存できませんでした",
                    detail: e
                }
            })
        }

        transaction.oncomplete = () => {}

        transaction.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Transaction error: ${(e.target as IDBTransaction).error?.message}`,
                    detail: e
                }
            })
        }
    })
}

export function saveEN2ENItemToLocal(en2enItem: EN2ENItem) {
    return new Promise<UpdatePromiseCommonResult<IDBValidKey>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['EN2ENDictionary'], 'readwrite')
        const store = transaction.objectStore('EN2ENDictionary')
        const request = store.put(en2enItem)

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
                    message: "辞書アイテムを保存できませんでした",
                    detail: e
                }
            })
        }

        transaction.oncomplete = () => {}

        transaction.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Transaction error: ${(e.target as IDBTransaction).error?.message}`,
                    detail: e
                }
            })
        }
    })
}