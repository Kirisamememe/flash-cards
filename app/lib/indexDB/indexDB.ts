import { z } from "zod"
import { wordCardSaveRequest } from "@/schemas";
import { DeleteResult } from '@/types/ActionsResult';

const dbName = 'flashcards_db';

export function openDB():Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 3);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('words')) {
                db.createObjectStore('words', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('partOfSpeech')) {
                db.createObjectStore('partOfSpeech', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'id' });
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

export function deleteByIdFromLocal(values: z.infer<typeof wordCardSaveRequest>): Promise<DeleteResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['words'], 'readwrite')
        const store = transaction.objectStore('words')
        values.is_deleted = true
        values.updated_at = new Date()
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



