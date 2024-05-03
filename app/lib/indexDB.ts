import { z } from "zod"
import { wordCardSchema } from "@/schemas";
import {DeleteResult, SaveResult} from '@/types/ActionsResult';
import { handleError } from '@/lib/utils';

export interface RawWordInfo {
    word: string
    phonetics?: string
    definition: string
    example: string
    notes?: string
}

const dbName = 'flashcardsDB';
const storeName = 'cards';

function openDB():Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onerror = (event) => {
            reject(`Database error: ${(event.target as IDBOpenDBRequest).error?.message}`);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
    });
}


export async function saveCard(values: z.infer<typeof wordCardSchema>): Promise<SaveResult> {
    const validatedFields = wordCardSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            isSuccess: false,
            error: {
                message: validatedFields.error.message,
            },
        };
    }

    return new Promise<SaveResult>(async (resolve, reject) => {
        try {
            const db = await openDB();
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const { id, ...reqData } = values;
            const dataToStore = id === undefined ? reqData : values;
            const request = store.put(dataToStore);

            request.onsuccess = () => {
                const id = parseInt(request.result.toString());
                const actionType = values.id ? '編集' : '追加';
                console.log(`${actionType}された`, values);

                resolve({
                    isSuccess: true,
                    message: `カードが${actionType}されました。`,
                    data: {id, ...values}
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
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

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

export function getCardById(id: number) {
    return new Promise(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result)
        }

        request.onerror = (event) => {
            reject(`Error fetching card: ${(event.target as IDBRequest).error?.message}`);
        }
    })
}

export function deleteById(id: number): Promise<DeleteResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

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


// async function addCard(values: z.infer<typeof wordCardSchema>): Promise<ActionsResult> {
//     const validatedFields = wordCardSchema.safeParse(values);
//
//     if (!validatedFields.success) {
//         return {
//             isSuccess: false,
//             error: {
//                 message: validatedFields.error.message,
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
//                         message: 'カードが成功的に追加されました。',
//                         data: addedObjectRequest.result
//                     });
//                 };
//             };
//
//             request.onerror = (event) => {
//                 resolve({
//                     isSuccess: false,
//                     error: {
//                         message: `Error adding card: ${(event.target as IDBRequest).error?.message}`
//                     }
//                 });
//             };
//         } catch (error) {
//             handleError(error)
//
//             resolve({
//                 isSuccess: false,
//                 error: {
//                     message: `データベース操作中にエラーが発生しました'}`
//                 }
//             });
//         }
//     });
// }