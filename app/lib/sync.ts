import React, { SetStateAction } from "react";
import { PartOfSpeechLocal, WordDataMerged } from "@/types/WordIndexDB";
import { getCardsFromLocal, getPartOfSpeechesFromLocal, getUserInfoFromLocal } from "@/app/lib/indexDB/getFromLocal";
import {
    updateUserInfoToRemote,
    upsertCardToRemote,
    upsertPartOfSpeechToRemote
} from "@/app/lib/remoteDB/saveToRemote";
import {
    getCardsFromRemote,
    getPartOfSpeechesFromRemote,
    getUserInfoFromRemote
} from "@/app/lib/remoteDB/getFromRemote";
import { saveCardsToLocal, savePartOfSpeechToLocal, saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";
import { Toast, ToasterToast } from "@/components/ui/use-toast";

export async function sync (
    words: WordDataMerged[],
    setWords: (words: WordDataMerged[]) => void,
    userInfo: UserInfo,
    setProgressMessage: React.Dispatch<SetStateAction<string>>,
    setProgressVal: React.Dispatch<SetStateAction<number>>,
    t: any,
    toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }
) {

    // 同期開始 ========================================================================================
    let progress = 0;
    setProgressMessage(t('sync_partOfSpeech'))

    // フェーズ 1-1
    // ローカルから品詞を取得

    const partOfSpeeches = await getPartOfSpeechesFromLocal(userInfo.id)
    if (!partOfSpeeches.isSuccess) {
        return
    }
    const partOfSpeechesToRemote: PartOfSpeechLocal[] = [...partOfSpeeches.data.map(value => {
        value.author = userInfo.id
        return value
    })]

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // フェーズ 1-2
    // ローカルにデータがある場合、「Synced_atがリモートよりも新しいデータ」だけをリモートにプッシュ
    if (partOfSpeeches.data.length > 0) {
        await Promise.all(partOfSpeechesToRemote.map(async (value, index) => {
            const result = await upsertPartOfSpeechToRemote(value)

            if (!result?.isSuccess) {
                console.error(result.error.detail);
                console.error(`同期に失敗：${value}`)
            } else {
                progress += Math.floor((index + 1) / partOfSpeechesToRemote.length * 10)
                setProgressVal(progress);
            }
        }))
    } else {
        progress += 10;
        setProgressVal(progress)
    }

    // フェーズ 1-3
    // リモートデータベースから品詞を取得
    const parOfSpeechFromRemote = await getPartOfSpeechesFromRemote(userInfo.id)
    if (!parOfSpeechFromRemote.isSuccess) {
        //取得が失敗した場合、同期を中断
        console.error(parOfSpeechFromRemote.error.detail)
        return
    }

    // フェーズ 1-4
    // 取得した品詞を一個ずつローカルに保存
    parOfSpeechFromRemote.data.map(async (value) => {
        const data: PartOfSpeechLocal = {
            ...value,
            partOfSpeech: value.part_of_speech,
            author: value.authorId
        }
        await savePartOfSpeechToLocal(data, true)
    })

    progress += 10;
    setProgressVal(progress)
    setProgressMessage(t('sync_words'))
    // フェーズ 1 終了
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // フェーズ 2-1
    // ローカルから単語データを取得
    const fetchedWords = await getCardsFromLocal(userInfo.id, false, true).then()
    if (!fetchedWords.isSuccess) {
        console.error(fetchedWords.error.detail)
        return
    }

    // フェーズ 2-2
    // ローカルに単語データがある場合、それをリモートにプッシュ
    if (fetchedWords.data.length > 0){
        console.log("ローカルからフェッチしたデータ＝＝＝＝＝")
        console.log(fetchedWords.data)
        await Promise.all(fetchedWords.data.map(async (word, index) => {
            //Promise.allを使うことによって、words.mapの処理が全部終わってから次へ進むことを約束(Promise)してくれる
            const result = await upsertCardToRemote({ ...word, author: userInfo.id })

            if (!result.isSuccess) {
                console.error(result.error.detail);
                console.error(`同期に失敗：${word}`)
            } else {
                progress += Math.floor((index + 1) / words.length * 30);
                setProgressVal(progress);
            }
        }))
    } else {
        progress += 30
        setProgressVal(progress)
    }

    // フェーズ 2-3
    // リモートデータベースから単語を取得
    const cardsFromRemote = await getCardsFromRemote(userInfo.id)
    if (!cardsFromRemote.isSuccess) {
        //取得が失敗した場合、同期を中断
        console.error(cardsFromRemote.error.detail)
        return
    }
    progress += 20
    setProgressVal(progress)

    // フェーズ 2-4
    // 取得したデータをローカルに保存
    const results = await saveCardsToLocal(userInfo.id, cardsFromRemote.data)

    if (!results.isSuccess) {
        console.error(results.message)
        return
    }

    const cardsFromLocal = await getCardsFromLocal(userInfo.id, false)
    if (!cardsFromLocal.isSuccess) {
        console.error(cardsFromLocal.error.message)
        return
    }

    setWords(cardsFromLocal.data)
    progress += 20
    setProgressVal(progress)
    // フェーズ 2 終了
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // フェーズ 3-1
    // ローカルからユーザー設定などの情報を取得
    // このコンポーネントにアクセスできている時点で、userIdは必ず存在する。
    // ユーザーの設定情報に関しては、ログイン済みのユーザーであれば、IndexDBに存在すべきである
    const userInfoFromLocal = await getUserInfoFromLocal(userInfo.id)

    // フェーズ 3-2
    //ローカルにユーザーデータが存在する場合それをリモートにプッシュ
    // ！！！！！！！！！！！！！
    // 注意！！！ データベースの仕様上、何も帰ってこなくてもSuccessになるので、dataも一緒にチェックしないといけない
    // ！！！！！！！！！！！！！
    if (userInfoFromLocal.isSuccess && userInfoFromLocal.data) {
        console.log("ユーザーの情報ゲットしたぜ")
        const userInfoToRemote: UserInfoToRemote = {
            ...userInfoFromLocal.data,
            image: userInfoFromLocal.data.image || null,
            name: userInfoFromLocal.data.name || null,
            updatedAt: userInfoFromLocal.data.updated_at,
            synced_at: userInfoFromLocal.data.synced_at || new Date()
        }

        const result =　await updateUserInfoToRemote(userInfoToRemote)
        //リモートへの同期が失敗した場合、同期を中断
        if (!result.isSuccess) {
            console.error(result.error.detail)
            return
        }
    }

    // フェーズ 3-3
    // リモートからユーザー情報を取得
    const userInfoFromRemote = await getUserInfoFromRemote(userInfo.id)
    if (userInfoFromRemote.isSuccess && userInfoFromRemote.data) {
        const userInfoToLocal: UserInfo = {
            ...userInfoFromRemote.data,
            updated_at: userInfoFromRemote.data.updatedAt,
            synced_at: new Date()
        }

        // フェーズ 3-4
        // リモートから取得したユーザー情報をローカルに保存
        const result = await saveUserInfoToLocal(userInfoToLocal)

        if (!result.isSuccess) {
            console.error(result.error.detail)
        }
    }
    progress += 10
    setProgressVal(progress)
    // フェーズ 3 終了
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // フェーズ 4
    // 結果をチェック
    if (progress < 100) {
        toast({
            variant: "destructive",
            title: t('sync_error'),
            description: t('sync_error')
        });

        return
    }

    console.log("======================================================");

    setProgressVal(0)


    toast({
        title: t('sync_success'),
        description: t('sync_success')
    })
}