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

export function deleteByIdFromLocal(wordId: string): Promise<DeleteResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['words'], 'readwrite')
        const store = transaction.objectStore('words')
        const request = store.get(wordId)

        request.onsuccess = () => {

            const deleteData = {
                ...request.result,
                is_deleted: true,
                updated_at: new Date()
            }
            const save = store.put(deleteData)

            save.onsuccess = () => {
                resolve({
                    isSuccess: true,
                    message: "削除しました"
                })
            }

            save.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: `削除できませんでした: ${(event.target as IDBRequest).error?.message}`
                    }
                })
            }
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



