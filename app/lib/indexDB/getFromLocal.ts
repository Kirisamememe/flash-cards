import { GetPromiseCommonResult, UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { openDB } from "@/app/lib/indexDB/indexDB";
import { WordDataMerged, WordIndexDB } from "@/types/WordIndexDB";

export async function getUserInfoFromLocal(userId: string): Promise<UpdatePromiseCommonResult<UserInfo>> {
    return new Promise<UpdatePromiseCommonResult<UserInfo>>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(userId)

        request.onsuccess = () => {
            resolve({
                isSuccess: true,
                data: request.result
            })
            console.log(request.result)
        }

        request.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: "データベース通信中にエラーが発生しました",
                    detail: e
                }
            })
        }

    })
}

export function getCardsFromLocal(
    userId: string | undefined,
    useWhenLoggedOut: boolean = true,
    containDeleted: boolean = false
): Promise<GetPromiseCommonResult<WordDataMerged[]>>  {
    return new Promise<GetPromiseCommonResult<WordDataMerged[]>>(async (resolve, reject) => {
        openDB().then(db => {
            console.log("チェック0")
            const transaction = db.transaction(['words', 'partOfSpeech'], 'readonly');
            const wordsStore = transaction.objectStore('words');
            const partOfSpeechStore = transaction.objectStore('partOfSpeech');

            const wordsRequest = wordsStore.getAll();
            const partOfSpeechRequest = partOfSpeechStore.getAll();

            console.log("チェック1")

            transaction.oncomplete = () => {
                const partOfSpeech = partOfSpeechRequest.result;
                const filteredResults = containDeleted ?
                    wordsRequest.result : wordsRequest.result.filter(
                        card => !card.is_deleted && (
                            userId ? (
                                card.author === userId || undefined
                                // ログイン状態であれば、確実に自分が作ったカードと、誰が作ったかわからないカードを表示する
                            ) : (
                                useWhenLoggedOut ? true : card.author === undefined
                                // 非ログイン状態であれば、まずuseWhenLoggedOutをチェックする。
                                // 非ログイン状態の時に渡されるuseWhenLoggedOutは、ローカルストレージから取得する
                                // useWhenLoggedOutが真：削除されていなければOK
                                // useWhenLoggedOutが偽：作者不明のカードしか取得しない
                            )
                        )
                        // Trueになる子要素が残る
                    )
                console.log("チェック2")

                const combinedData = filteredResults.map(word => {
                    const correspondingPartOfSpeech = partOfSpeech.find(pos => pos.id === word.partOfSpeech);
                    return {
                        ...word,
                        partOfSpeech: correspondingPartOfSpeech || undefined
                    };
                });

                console.log(combinedData)

                resolve({
                    isSuccess: true,
                    data: combinedData
                });
            };

            transaction.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: `Transaction failed.`,
                        detail: event
                    }
                });
            };
        }).catch(error => {
            reject({
                isSuccess: false,
                error: {
                    message: `Failed to open database.`,
                    detail: error
                }
            });
        })
    });
}

export function getCardsFromLocalToRemote(
    userId: string | undefined,
): Promise<GetPromiseCommonResult<WordIndexDB[]>>  {
    return new Promise<GetPromiseCommonResult<WordIndexDB[]>>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const request = store.getAll();

        request.onsuccess = () => {
            const filteredResults = request.result.filter(
                    card => card.author === userId || undefined
                    // Trueになる子要素が残る
                )
            resolve({
                isSuccess: true,
                data: filteredResults
            })
            console.log("取得した")
            console.log(filteredResults)
        }

        request.onerror = (event) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Error fetching card: ${(event.target as IDBRequest).error?.message}`,
                    detail: event
                }
            })
        };
    });
}

export async function getCardCountFromLocal(userId: string) {
    return new Promise<number | undefined>(async (resolve, reject) => {
        const db = await openDB();
        const transaction = db.transaction(['words'], 'readonly');
        const store = transaction.objectStore('words');
        const request = store.getAll();

        request.onsuccess = () => {
            const filteredResults: WordIndexDB[] = request.result.filter(card => !card.is_deleted)
                .filter(card => card.author === userId || undefined)

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

export function getPartOfSpeechesFromLocal() {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(["partOfSpeech"], 'readonly')
        const store = transaction.objectStore("partOfSpeech")
        const request = store.getAll()

        request.onsuccess = () => {
            resolve(request.result)
            console.log(request.result)
        }

        request.onerror = (event) => {
            console.error(event)
            reject(`Error fetching card: ${(event.target as IDBRequest).error?.message}`)
        };
    });
}