import { GetPromiseCommonResult, UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { openDB } from "@/app/lib/indexDB/indexDB";
import { EN2ENItem, PartOfSpeechLocal, RecordIndexDB, TTSObj, WordDataMerged, WordIndexDB } from "@/types/WordIndexDB";

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
            // console.log(request.result)
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
    userId: string | undefined | null,
    useWhenLoggedOut: boolean = true,
    containDeleted: boolean = false
): Promise<GetPromiseCommonResult<WordDataMerged[]>>  {
    // この関数は基本的には未習得の単語だけを返す
    // 習得した場合、習得済み専用の配列にプッシュする

    return new Promise<GetPromiseCommonResult<WordDataMerged[]>>(async (resolve, reject) => {
        openDB().then(db => {
            const transaction = db.transaction(['words', 'partOfSpeech'], 'readonly');
            const wordsStore = transaction.objectStore('words');
            const partOfSpeechStore = transaction.objectStore('partOfSpeech');

            const wordsRequest = wordsStore.getAll();
            const partOfSpeechRequest = partOfSpeechStore.getAll();

            transaction.oncomplete = () => {
                const partOfSpeech = partOfSpeechRequest.result;

                // TODO ここのロジック再度チェック


                const filteredResults = containDeleted ?
                    wordsRequest.result : wordsRequest.result.filter(
                        card => !card.is_deleted && (
                            userId ? (
                                card.author === userId || card.author === undefined
                                // ログイン状態であれば、確実に自分が作ったカードと、誰が作ったかわからないカードを表示する
                            ) : (
                                useWhenLoggedOut ? true : card?.author === undefined
                                // 非ログイン状態であれば、まずuseWhenLoggedOutをチェックする。
                                // 非ログイン状態の時に渡されるuseWhenLoggedOutは、ローカルストレージから取得する
                                // useWhenLoggedOutが真：削除されていなければOK
                                // useWhenLoggedOutが偽：作者不明のカードしか取得しない
                            )
                        )
                        // Trueになる子要素が残る
                    )

                const combinedData = filteredResults.map(word => {
                    const correspondingPartOfSpeech = partOfSpeech.find(pos => pos.id === word.partOfSpeech);
                    return {
                        ...word,
                        partOfSpeech: correspondingPartOfSpeech || undefined
                    };
                });

                resolve({
                    isSuccess: true,
                    data: combinedData
                })
            }

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

export function getPartOfSpeechesFromLocal(userId: string | undefined | null) {
    return new Promise<GetPromiseCommonResult<PartOfSpeechLocal[]>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(["partOfSpeech"], 'readonly')
        const store = transaction.objectStore("partOfSpeech")
        const request = store.getAll()

        request.onsuccess = () => {
            const filteredResult = request.result.filter(pos => pos.author === userId || !pos.author).sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

            resolve({
                isSuccess: true,
                data: filteredResult
            })
        }

        request.onerror = (event) => {
            console.error(event)
            reject({
                isSuccess: false,
                error: {
                    message: `Error fetching card: ${(event.target as IDBRequest).error?.message}`,
                    detail: event
                }
            })
        }
    })
}

export function getRecordsFromLocal(wordId: string) {
    return new Promise<GetPromiseCommonResult<RecordIndexDB[]>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(["records"], 'readonly')
        const store = transaction.objectStore("records")
        const request = store.getAll()

        request.onsuccess = () => {
            const filteredResult: RecordIndexDB[] = request.result.filter(record => record.word_id === wordId).sort((a, b) => b.reviewed_at.getTime() - a.reviewed_at.getTime())

            resolve({
                isSuccess: true,
                data: filteredResult
            })
        }

        request.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Error fetching records: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }

        transaction.oncomplete = () => {}

        transaction.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Transaction Error: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }
    })
}

export function getEN2ENItemFromLocal(word: string) {
    return new Promise<GetPromiseCommonResult<EN2ENItem>>(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(["EN2ENDictionary"], 'readonly')
        const store = transaction.objectStore("EN2ENDictionary")
        const request = store.get(word)

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
                    message: `Error fetching item: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }

        transaction.oncomplete = () => {}

        transaction.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Transaction Error: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }
    })
}

export function getTTSFromLocal(wordId: string, type: "word" | "example") {
    return new Promise<GetPromiseCommonResult<TTSObj>>( async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['TTSStore'], 'readwrite')
        const store = transaction.objectStore('TTSStore')
        const request = store.get(`${type}_${wordId}`)

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
                    message: `Error fetching item: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }

        transaction.onerror = (e) => {
            reject({
                isSuccess: false,
                error: {
                    message: `Transaction Error: ${(e.target as IDBRequest).error?.message}`,
                    detail: e
                }
            })
        }
    })
}