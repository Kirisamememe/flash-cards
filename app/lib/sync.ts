// import React, { SetStateAction } from "react";
// import { WordData } from "@/types/WordIndexDB";
// import {
//     updateUserInfoToRemote,
//     upsertCardToRemote,
// } from "@/app/lib/remoteDB/saveToRemote";
// import {
//     getCardsFromRemote,
//     getUserInfoFromRemote
// } from "@/app/lib/remoteDB/getFromRemote";
// import { Toast, ToasterToast } from "@/components/ui/use-toast";
// import { sortWords } from "@/app/lib/utils";
// import { UserInfo, UserInfoToRemote } from "@/types/User";
// import { indexDB } from "@/stores/wordbook-store";

// export async function sync (
//     words: WordData[],
//     setWords: (words: WordData[]) => void,
//     userInfo: UserInfo,
//     setUserInfo: (userInfo: UserInfo) => Promise<{ isSuccess: boolean }>,
//     setProgressMessage: React.Dispatch<SetStateAction<string>>,
//     setProgressVal: React.Dispatch<SetStateAction<number>>,
//     t: any,
//     toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }
// ) {

//     // 同期開始 ========================================================================================
//     let userInfoFlg = false
//     let posesFlg = false
//     let wordsFlg = false

//     let progress = 0;
//     setProgressMessage(t('syncing'))

//     // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//     // フェーズ 1-1
//     // ローカルからユーザー設定などの情報を取得
//     // このコンポーネントにアクセスできている時点で、userIdは必ず存在する。
//     // ユーザーの設定情報に関しては、ログイン済みのユーザーであれば、IndexDBに存在すべきである
//     const userInfoFromLocal = await indexDB.getUserInfo(userInfo.id)

//     // フェーズ 1-2
//     //ローカルにユーザーデータが存在する場合それをリモートにプッシュ
//     // ！！！！！！！！！！！！！
//     // 注意！！！ データベースの仕様上、何も帰ってこなくてもSuccessになるので、dataも一緒にチェックしないといけない
//     // ！！！！！！！！！！！！！
//     if (userInfoFromLocal.isSuccess && userInfoFromLocal.data) {
//         console.log("ローカルユーザーの情報ゲットしたぜ")
//         const userInfoToRemote: UserInfoToRemote = {
//             ...userInfoFromLocal.data[0],
//             image: userInfoFromLocal.data[0].image || null,
//             name: userInfoFromLocal.data[0].name || null,
//             updated_at: userInfoFromLocal.data[0].updated_at,
//             synced_at: userInfoFromLocal.data[0].synced_at || new Date(),
//             learning_lang: userInfoFromLocal.data[0].learning_lang || null,
//             trans_lang: userInfoFromLocal.data[0].trans_lang || null
//         }
//         console.log(userInfoToRemote)

//         const result =　await updateUserInfoToRemote(userInfoToRemote)
//         //リモートへの同期が失敗した場合、同期を中断
//         if (!result.isSuccess) {
//             console.error(result.error.detail)
//             syncFailed(toast, t, "syncErr_userInfo")
//             return
//         }
//     }

//     console.log("＊＊＊＊　同期ログ：ローカルからユーザーデータを取得しました　＊＊＊＊")

//     // フェーズ 1-3
//     // リモートからユーザー情報を取得
//     const userInfoFromRemote = await getUserInfoFromRemote(userInfo.id)
//     if (userInfoFromRemote.isSuccess && userInfoFromRemote.data) {
//         const userInfoToLocal: UserInfo = {
//             ...userInfoFromRemote.data,
//             updated_at: userInfoFromRemote.data.updatedAt,
//             synced_at: new Date(),
//             learning_lang: userInfoFromRemote.data?.learning_lang || undefined,
//             trans_lang: userInfoFromRemote.data?.trans_lang || undefined
//         }

//         // フェーズ 1-4
//         // リモートから取得したユーザー情報をローカルに保存
//         const result = await setUserInfo(userInfoToLocal)

//         if (!result.isSuccess) {
//             syncFailed(toast, t, "syncErr_userInfo")
//             return
//         }
//     }
//     userInfoFlg = true
//     progress += 10
//     setProgressVal(progress)

//     console.log("＊＊＊＊　同期ログ：リモートにユーザーデータをプッシュしました　＊＊＊＊")
//     // フェーズ 1 終了
//     // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//     // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//     // フェーズ 3-1
//     // setProgressMessage(t('sync_words'))

//     // // ローカルから単語データを取得
//     // const fetchedWords = await getCardsFromLocal(userInfo.id, false, true).then()
//     // if (!fetchedWords.isSuccess) {
//     //     console.error(fetchedWords.error?.detail)
//     //     syncFailed(toast, t, "syncErr_words")
//     //     return
//     // }

//     // // フェーズ 3-2
//     // // ローカルに単語データがある場合、それをリモートにプッシュ
//     // if (fetchedWords.data.length > 0){
//     //     console.log("ローカルからフェッチしたデータ＝＝＝＝＝")
//     //     console.log(fetchedWords.data)
//     //     const promiseResults = await Promise.all(fetchedWords.data.map((word, index) => {
//     //         return new Promise<{ isSuccess: boolean }>( async (resolve, reject) => {
//     //             //Promise.allを使うことによって、words.mapの処理が全部終わってから次へ進むことを約束(Promise)してくれる
//     //             const fetchedRecords = await getRecordsFromLocal(word.id)
//     //             await upsertCardToRemote({
//     //                 ...word,
//     //                 author: userInfo.id,
//     //                 records: fetchedRecords.isSuccess ? fetchedRecords.data.filter(record => !record.synced_at) : []
//     //             }).then((result) => {
//     //                 if (result.isSuccess) {
//     //                     progress += Math.floor((index + 1) / words.length * 30);
//     //                     setProgressVal(progress)
//     //                     resolve({ isSuccess: true })
//     //                 } else {
//     //                     console.error("未知のエラーが発生しました")
//     //                     reject({ isSuccess: false })
//     //                 }
//     //             }).catch(result => {
//     //                 console.error(result.error?.detail);
//     //                 console.error(`同期に失敗：${word}`)
//     //                 reject({ isSuccess: false })
//     //             })
//     //         })
//     //     }))

//     //     let allSuccess = true
//     //     promiseResults.forEach(result => allSuccess = result.isSuccess && allSuccess)
//     //     if (!allSuccess) {
//     //         syncFailed(toast, t, "syncErr_words")
//     //         return
//     //     }

//     //     console.log("＊＊＊＊　同期ログ：ローカルの単語データをリモートにプッシュしました　＊＊＊＊")
//     // } else {
//     //     progress += 30
//     //     setProgressVal(progress)
//     // }

//     // // フェーズ 3-3
//     // // リモートデータベースから単語を取得
//     // const cardsFromRemote = await getCardsFromRemote(userInfo.id)
//     // if (!cardsFromRemote.isSuccess) {
//     //     //取得が失敗した場合、同期を中断
//     //     console.error(cardsFromRemote.error.detail)
//     //     syncFailed(toast, t, "syncErr_words")
//     //     return
//     // }
//     // progress += 20
//     // setProgressVal(progress)

//     // console.log("＊＊＊＊　同期ログ：リモートから単語データを取得しました　＊＊＊＊")

//     // // フェーズ 3-4
//     // // 取得したデータをローカルに保存
//     // const results = await saveCardsToLocal(userInfo.id, cardsFromRemote.data)

//     // if (!results.isSuccess) {
//     //     console.error(results.message)
//     //     syncFailed(toast, t, "syncErr_words")
//     //     return
//     // }

//     // console.log("＊＊＊＊　同期ログ：単語データをローカルに挿入しました　＊＊＊＊")

//     // const cardsFromLocal = await getCardsFromLocal(userInfo.id, false)
//     // if (!cardsFromLocal.isSuccess) {
//     //     console.error(cardsFromLocal.error.message)
//     //     syncFailed(toast, t, "syncErr_words")
//     //     return
//     // }
//     // console.log("＊＊＊＊　同期ログ：コンテキストへの設置を開始します　＊＊＊＊")

//     // setWords(sortWords(cardsFromLocal.data))
//     // progress += 20
//     // setProgressVal(progress)

//     // wordsFlg = true
//     // console.log("＊＊＊＊　同期ログ：コンテキストに設置しました　＊＊＊＊")
//     // フェーズ 3 終了
//     // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//     // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//     // フェーズ 4
//     // 結果をチェック

//     if (userInfoFlg && posesFlg && wordsFlg) {
//         setProgressVal(0)

//         toast({
//             title: t('sync_success'),
//             description: t('sync_success')
//         })
//     } else {
//         toast({
//             variant: "destructive",
//             title: t('sync_error'),
//             description: t('sync_error')
//         })
//     }

//     console.log("======================================================");
// }

// function syncFailed(
//     toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void },
//     t: any,
//     error: string
// ) {
//     toast({
//         variant: "destructive",
//         title: t('sync_error'),
//         description: t(error)
//     })
// }