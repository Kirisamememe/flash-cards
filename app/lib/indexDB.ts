import { z } from "zod"
import { partOfSpeech, wordCardSaveRequest } from "@/schemas";
import { DeleteResult, SaveCardsResults, SavePOSResult, SaveResult } from '@/types/ActionsResult';
import { createId } from '@paralleldrive/cuid2';
import { WordCard } from "@/types/WordCard";
import { Word } from "@prisma/client";
// import { handleError } from '@/lib/utils';

const dbName = 'flashcards_db';

function openDB():Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('words')) {
                db.createObjectStore('words', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('partOfSpeech')) {
                db.createObjectStore('partOfSpeech', { keyPath: 'id' });
            }
        };

        request.onerror = (event) => {
            reject(`データベースに繋がりませんでした: ${(event.target as IDBOpenDBRequest).error?.message}`);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
    });
}

export async function getCardCount(userId: string) {
    return new Promise<number | undefined>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['words'], 'readwrite');
        const store = transaction.objectStore('words');
        const request = store.getAll();

        request.onsuccess = () => {
            const filteredResults = request.result.filter(card => !card.is_deleted)
            resolve(filteredResults.length)
        }

        request.onerror = (event) => {
            reject({
                result: undefined,
                error: event
            })
        }
    })
}

export async function saveCards(cards: Word[]): Promise<SaveCardsResults> {
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
                    synced_at: card.synced_at || new Date(),
                    learned_at: card.learned_at || undefined,
                    retention_rate: card.retention_rate || 0,
                    author: card.authorId,
                    is_deleted: card.is_deleted || false
                };

                const request = store.put(wordData);
                request.onsuccess = () => {
                    results.successResults.push({
                        isSuccess: true,
                        message: "The changes have been saved.",
                        data: wordData
                    });
                };

                request.onerror = (event) => {
                    results.errorResults.push({
                        isSuccess: false,
                        error: {
                            message: `Error saving card: ${(event.target as IDBRequest).error?.message}`
                        }
                    });
                };
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

export async function saveCard(values: z.infer<typeof wordCardSaveRequest>): Promise<SaveResult> {
    const validatedFields = wordCardSaveRequest.safeParse(values);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
            },
        };
    }

    return new Promise<SaveResult>(async (resolve) => {
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
                updated_at: new Date(),
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
                    message: "The changes have been saved.",
                    data: wordData
                });
            };

            request.onerror = (event) => {
                resolve({
                    isSuccess: false,
                    error: {
                        message: `Error editing card: ${(event.target as IDBRequest).error?.message}`
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
                        message: `Transaction error: ${(event.target as IDBTransaction).error?.message}`
                    }
                });
            };
        } catch (error) {
            console.error('データベース操作中にエラーが発生しました', error);
            resolve({
                isSuccess: false,
                error: {
                    message: 'データベース操作中にエラーが発生しました'
                }
            });
        }

    });
}

export function getCards() {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const request = store.getAll();

        request.onsuccess = () => {
            const filteredResults = request.result.filter(card => !card.is_deleted)
                // .filter(card => card.author === userId)
            resolve(filteredResults)
            console.log("取得した")
            console.log(filteredResults)
        }

        request.onerror = (event) => {
            reject(`Error fetching card: ${(event.target as IDBRequest).error?.message}`)
        };
    });
}

// export function getCardById(id: number) {
//     return new Promise(async (resolve, reject) => {
//         const db = await openDB();
//         const transaction = db.transaction([storeName], 'readonly');
//         const store = transaction.objectStore(storeName);
//         const request = store.get(id);
//
//         request.onsuccess = () => {
//             resolve(request.result)
//         }
//
//         request.onerror = (event) => {
//             reject(`Error fetching card: ${(event.target as IDBRequest).error?.message}`);
//         }
//     })
// }

export function deleteById(values: z.infer<typeof wordCardSaveRequest>): Promise<DeleteResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['words'], 'readwrite')
        const store = transaction.objectStore('words')
        values.is_deleted = true
        const request = store.put(values)

        request.onsuccess = () => {
            resolve({
                isSuccess: true,
                message: "削除しました"
            })
        }

        request.onerror = (event) => {
            reject({
                isSuccess: false,
                error: {
                    message: `削除できませんでした: ${(event.target as IDBRequest).error?.message}`
                }
            })
        }
    })
}

export function savePartOfSpeech(value: z.infer<typeof partOfSpeech>): Promise<SavePOSResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['partOfSpeech'], 'readwrite')
        const store = transaction.objectStore('partOfSpeech')
        const data = {
            id: value.id || createId(),
            partOfSpeech: value.partOfSpeech,
            author: value.author,
            is_deleted: value.is_deleted
        }
        const request = store.put(data)

        request.onsuccess = () => {
            resolve({
                isSuccess: true,
                message: "品詞を保存しました",
                data: request.result
            })
        }

        request.onerror = () => {
            reject({
                isSuccess: false,
                message: "品詞を保存できませんでした"
            })
        }
    })
}

export function getPartOfSpeeches() {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(["partOfSpeech"], 'readonly')
        const store = transaction.objectStore("partOfSpeech")
        const request = store.getAll()

        request.onsuccess = () => {
            resolve(request.result)
            console.log("取得した")
            console.log(request.result)
        }

        request.onerror = (event) => {
            reject(`Error fetching card: ${(event.target as IDBRequest).error?.message}`)
        };
    });
}

// async function addCard(values: z.infer<typeof wordCardSchema>): Promise<ActionsResult> {
//     const validatedFields = wordCardSchema.safeParse(values);
//
//     if (!validatedFields.success) {
//         return {
//             isSuccess: false,
//             error: {
//                 messages: validatedFields.error.messages,
//             },
//         };
//     }
//
//     //存在しなければ追加、存在していれば修正
//
//     return new Promise<ActionsResult>(async (resolve, reject) => {
//         try {
//             const db = await openDB();
//             const transaction = db.transaction([storeName], 'readwrite');
//             const store = transaction.objectStore(storeName);
//             const request = store.add(values);
//
//             request.onsuccess = () => {
//                 const id = request.result;
//                 const addedObjectRequest = store.get(id);
//
//                 addedObjectRequest.onsuccess = () => {
//                     console.log("追加した", addedObjectRequest.result);
//                     resolve({
//                         isSuccess: true,
//                         messages: 'カードが成功的に追加されました。',
//                         data: addedObjectRequest.result
//                     });
//                 };
//             };
//
//             request.onerror = (event) => {
//                 resolve({
//                     isSuccess: false,
//                     error: {
//                         messages: `Error adding card: ${(event.target as IDBRequest).error?.messages}`
//                     }
//                 });
//             };
//         } catch (error) {
//             handleError(error)
//
//             resolve({
//                 isSuccess: false,
//                 error: {
//                     messages: `データベース操作中にエラーが発生しました'}`
//                 }
//             });
//         }
//     });
// }