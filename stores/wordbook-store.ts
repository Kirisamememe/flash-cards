import { createStore } from 'zustand/vanilla'
import { POS, WordData } from "@/types/WordIndexDB";
import { getCardsFromRemote, getMaterialsFromRemote, getUserInfoFromRemote } from "@/app/lib/remoteDB/getFromRemote";
import { UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { animateElement, sortWords, syncFailed } from "@/app/lib/utils";
import { MaterialIndexDB, ModelList } from "@/types/AIBooster";
import { IndexDB } from "@/app/lib/indexDB/indexDB";
import { LanguageCode, UserInfo } from "@/types/User";
import { initMasteredWords } from '@/types/static';
import { Toast, ToasterToast } from '@/components/ui/use-toast';
import { updateUserInfoToRemote, upsertCardToRemote, upsertMaterialToRemote } from '@/app/lib/remoteDB/saveToRemote';


export type WordbookState = {
    indexDB: IndexDB

    words: WordData[] | []
    learningCount: number
    currentIndex: number
    filterText: string
    filteredWords: WordData[] | []
    isEditing: boolean
    editDialogOpen: boolean

    userInfo: UserInfo | undefined
    blindMode: boolean
    loggedOutUse: boolean
    userInterval: number

    overlayIsOpen: boolean
    isTransition: boolean

    playTTS: boolean
    playSE: boolean

    materialHistory: MaterialIndexDB[]
    generatedMaterial: MaterialIndexDB
    atTop: boolean
    hideHeader: boolean
    carouselIndex: number

    masteredWords: Set<string>

    AIModel: ModelList
    isPending: boolean

    AIBoosterAudio: HTMLAudioElement | null

    progress: {
        isSyncing: boolean
        progress: number
        message: string
    }
}

export type WordbookActions = {
    setWords: (words: WordData[]) => void
    addWord: (word: WordData) => void
    setWord: (word: WordData) => void
    setWordToINDB: (word: WordData) => Promise<UpdatePromiseCommonResult<number>>
    deleteWord: (wordId: string) => void
    setUserInfo: (userInfo: UserInfo) => Promise<{ isSuccess: boolean }>
    setCurrentIndex: (num: number) => void
    setFilterText: (text: string) => void
    setIsEditing: (value: boolean) => void
    setBlindMode: (value: boolean) => void
    setLoggedOutUse: (value: boolean) => void
    setFilteredWords: () => void
    setUserInterval: (num: number) => void
    setOverlayIsOpen: (value: boolean) => void
    setIsTransition: (value: boolean) => void
    setPlayTTS: (value: boolean) => void
    setPlaySE: (value: boolean) => void
    setEditDialogOpen: (value: boolean) => void

    setMaterialHistory: (materials: MaterialIndexDB[]) => void
    addMaterialHistory: (material: MaterialIndexDB) => void
    upsertMaterialHistory: (material: MaterialIndexDB) => void
    setGeneratedMaterial: (material: MaterialIndexDB) => void
    setAtTop: (value: boolean) => void
    setHideHeader: (value: boolean) => void
    setCarouselIndex: (num: number) => void
    deleteMaterial: (id: string) => void

    setMasteredWords: (words: string[]) => void

    setAIModel: (model: ModelList) => void
    setIsPending: (value: boolean) => void
    setAIBoosterAudio: (audio: HTMLAudioElement) => void

    setProgress: (progress: { isSyncing: boolean, progress: number, message: string }) => void
    sync: (t: any, toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }) => Promise<void>
}

export type WordbookStore = WordbookState & WordbookActions

export const indexDB = new IndexDB()

export const initWordbookStore = async (userId: string | undefined | null, url: string | undefined | null, userName: string | undefined | null): Promise<WordbookState> => {
    await indexDB.initialize()

    let words
    let poses
    let userInfo

    const loggedOutUseFromLocalStorage = localStorage.getItem("loggedOutUse")
    const blindModeFromLocalStorage = localStorage.getItem("blindMode")
    const playTTSFromLocalStorage = localStorage.getItem("playTTS")
    const playSEFromLocalStorage = localStorage.getItem("playSE")
    const localInterval = localStorage.getItem("interval")
    const localAIModel = localStorage.getItem("AIModel")

    if (!playTTSFromLocalStorage) localStorage.setItem("playTTS", "0")
    if (!playSEFromLocalStorage) localStorage.setItem("playSE", "0")
    if (!localInterval) localStorage.setItem("interval", "10000")
    if (!localAIModel) localStorage.setItem("AIModel", "models/gemini-1.5-pro-latest")

    const fetchedWords = await indexDB.getAllWordsOfUser(userId)
    if (!fetchedWords.isSuccess) {
        console.log("ZustandがローカルからWordsを取得できなかったわ")
    } else {
        words = sortWords(fetchedWords.data)
    }

    const fetchedPoses = await indexDB.getAllWordsOfUser(userId)
    if (!fetchedPoses.isSuccess) {
        console.log("Zustandがローカルからposesを取得できなかったわ")
    } else {
        poses = fetchedPoses.data
    }

    if (userId) {
        const localUserInfo = await indexDB.getUserInfo(userId)
        

        console.log(localUserInfo)
        indexDB.initMasteredWords(userId)

        if (!localUserInfo.isSuccess || !localUserInfo.data[0]) {
            // userIdが存在するのにローカルから取得できなかったということは、ログインしたばかりで、まだIndexにデータがない
            const remoteUserInfo = await getUserInfoFromRemote(userId)

            if (remoteUserInfo.isSuccess && remoteUserInfo.data ) {
                localStorage.setItem("blindMode", remoteUserInfo.data.blind_mode ? "1" : "0")
                userInfo = {
                    ...remoteUserInfo.data,
                    image: url || remoteUserInfo.data.image || "",
                    name: userName || remoteUserInfo.data.name || "",
                    updated_at: remoteUserInfo.data.updated_at,
                    synced_at:  remoteUserInfo.data.synced_at || undefined,
                    learning_lang: remoteUserInfo.data?.learning_lang || undefined,
                    trans_lang: remoteUserInfo.data?.trans_lang || undefined
                }
                // TODO リモートからMasteredWordsを取得し、ローカルに挿入
                await indexDB.saveUserInfo(userInfo).catch()
            }

        } else {
            //ローカルからゲットできた。つまり以前ログインしたことがある・ログインセッションがある。
            // localStorage.setItem("loggedOutUse", fetchedUserInfo.data.use_when_loggedout ? "1" : "0")
            localStorage.setItem("blindMode", localUserInfo.data[0].blind_mode ? "1" : "0")
            userInfo = {
                ...localUserInfo.data[0],
                image: url || localUserInfo.data[0].image,
                name: userName || localUserInfo.data[0].name,
            }
            await indexDB.saveUserInfo(userInfo).catch()
        }

    } else {
        indexDB.initMasteredWords("-1")
    }

    console.log(userInfo)
    console.log("initWordbookStoreが実行されたようだ")

    return {
        indexDB: indexDB,
        words: words || [],
        learningCount: words?.filter(word => !word.learned_at).length || 0,
        userInfo: userInfo,
        currentIndex: 0,
        filterText: "",
        isEditing: false,
        blindMode: userInfo?.blind_mode || blindModeFromLocalStorage === "1" || false,
        loggedOutUse: loggedOutUseFromLocalStorage === "1",
        filteredWords: [],
        userInterval: localInterval && parseInt(localInterval) || 10000,
        overlayIsOpen: false,
        isTransition: false,
        playTTS: !!playTTSFromLocalStorage ? playTTSFromLocalStorage === "1" : false,
        playSE: !!playSEFromLocalStorage ? playSEFromLocalStorage === "1" : false,
        materialHistory: [],
        generatedMaterial: { 
            id: "",
            title: "", 
            content: [], 
            translation: { lang: userInfo?.trans_lang || "JA", text: [] }, 
            author: userInfo?.id || "",
            generated_by: localAIModel ? localAIModel as ModelList : "gemini-1.5-pro-latest" as ModelList,
            created_at: new Date(),
            updated_at: new Date(),
        },
        atTop: true,
        hideHeader: false,
        carouselIndex: 0,
        masteredWords: new Set(),
        AIModel: localAIModel ? localAIModel as ModelList : "gemini-1.5-pro-latest" as ModelList,
        isPending: false,
        AIBoosterAudio: null,
        editDialogOpen: false,
        progress: {
            isSyncing: false,
            progress: 0,
            message: ""
        }
    }
}

export const defaultInitState: WordbookState = {
    words: [],
    learningCount: 0,
    userInfo: undefined,
    currentIndex: 0,
    filterText: "",
    isEditing: false,
    blindMode: false,
    loggedOutUse: true,
    filteredWords: [],
    userInterval: 5000,
    overlayIsOpen: false,
    isTransition: false,
    playTTS: false,
    playSE: false,
    materialHistory: [],
    generatedMaterial: { 
        id: "",
        title: "", 
        content: [], 
        translation: { lang: "JA", text: [] }, 
        author: "",
        generated_by: "gemini-1.5-flash-latest" as ModelList,
        created_at: new Date(),
        updated_at: new Date(),
    },
    atTop: true,
    hideHeader: false,
    carouselIndex: 0,
    masteredWords: new Set(),
    AIModel: "gemini-1.5-pro-latest" as ModelList,
    isPending: false,
    indexDB: indexDB,
    AIBoosterAudio: null,
    editDialogOpen: false,
    progress: {
        isSyncing: false,
        progress: 0,
        message: ""
    }
}

export const createWordbookStore = (initState: WordbookState = defaultInitState) => {
    return createStore<WordbookStore>()((set, getState) => ({
        ...initState,
        setWords: (words: WordData[]) => set(() => ({ words: words })),
        setWord: (word: WordData) => set((state) => ({ words: state.words?.map(prev => prev.id === word.id ? word : prev) })),
        setWordToINDB: async (word: WordData) => {
            try {
                const indexDB = getState().indexDB
                const userId = getState().userInfo?.id
                if (!indexDB) return { isSuccess: false, error: { message: "IndexDBが存在しません" } }
                if (word.author && userId !== word.author) return { isSuccess: false, error: { message: "edit_permission_error" } }

                const request = await indexDB.saveCardAndReturn({
                    ...word,
                    phonetics: word.phonetics || "", 
                    pos: word.pos || "",
                    example: word.example || "",
                    notes: word.notes || "",
                })

                if (!request.isSuccess) {
                    return request
                }

                set((state) => ({ words: sortWords(state.words?.map(prev => prev.id === word.id ? word : prev)) }))
                set((state) => ({ learningCount: state.words.filter(word => !word.learned_at).length }))

                return {
                    isSuccess: true,
                    data: getState().words.findIndex(value => value.id === word.id)
                }

            } catch (error) {
                return {
                    isSuccess: false,
                    error: {
                        message: "IndexDBに保存できませんでした",
                        detail: error
                    }
                }
            }
        },
        addWord: (word: WordData) => set((state) => ({ words: [word, ...state.words] })),
        deleteWord: (wordId: string) => set((state) => ({ words: state.words.filter(val => val.id !== wordId)})),
        setUserInfo: (userInfo: UserInfo) => {
            return new Promise(async (resolve, reject) => {
                await getState().indexDB.saveUserInfo(userInfo)
                    .then((res) => {
                        if (res.isSuccess) {
                            set(() => ({ userInfo: userInfo }))
                            resolve({ isSuccess: true })
                        }
                    })
                    .catch((err) => {
                        alert(`Index Database Error: ${err.error?.detail}`)
                        reject({ isSuccess: false })
                    })
            })
        },
        setCurrentIndex: (num: number) => set(() => ({ currentIndex: num })),
        setFilterText: (text: string) => set(() => ({ filterText: text, currentIndex: 0 })),
        setIsEditing: (value: boolean) => set(() => ({ isEditing: value })),
        setBlindMode: async (value: boolean) => {
            //イベントハンドラーかuseEffect内でしか実行できないから要注意！
            const userInfo = getState().userInfo
            if (userInfo) {
                localStorage.setItem("blindMode", value ? "1" : "0")

                const data: UserInfo = { ...userInfo, blind_mode: value, updated_at: new Date() }
                await getState().indexDB.saveUserInfo(data)
                    .then((res) => {
                    if (res.isSuccess) {
                        set(() => ({ userInfo: data }))
                    }
                    })
                    .catch((err) => {
                        alert(`Index Database Error: ${err.error?.detail}`)
                    })
            }
            else {
                localStorage.setItem("blindMode", value ? "1" : "0")
            }

            set(() => ({ blindMode: value }))
        },
        setLoggedOutUse: (value: boolean) => {
            localStorage.setItem("loggedOutUse", value ? "1" : "0")
            set(() => ({ loggedOutUse: value }))
        },
        setFilteredWords: () => {
            set((state) => ({
                filteredWords: state.words.filter(word => word.word
                    .startsWith(state.filterText.toLowerCase()) || word.word.startsWith(state.filterText.toUpperCase()))
                    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
                // TODO 日本語のカタカナ・ひらがな対応
            }))
        },
        setUserInterval: (num: number) => {
            set(() => ({ userInterval: num }))
            console.log(`userInterval: ${num}`)
        },
        setOverlayIsOpen: (value: boolean) => set(() => ({ overlayIsOpen: value })),
        setIsTransition: (value: boolean) => {
            if (value) {
                set(() => ({ isTransition: value }))
            } else {
                const loadingDiv = document.getElementById("loading-div")
                if (loadingDiv) {
                    animateElement(loadingDiv, [
                        { opacity: '100%' },
                        { opacity: '0' }
                    ],{
                        duration: 200,
                        easing: 'ease-in-out',
                    }).finally(() => {
                        set(() => ({ isTransition: value }))
                    })
                }
            }
        },
        setPlayTTS: (value: boolean) => set(() => ({ playTTS: value })),
        setPlaySE: (value: boolean) => {
            localStorage.setItem("playSE", value ? "1" : "0")
            set(() => ({ playSE: value }))
        },
        setMaterialHistory: (materials: MaterialIndexDB[]) => set(() => ({ materialHistory: materials})),
        setGeneratedMaterial: (material: MaterialIndexDB) => {
            set(() => ({ generatedMaterial: material }))
        },
        setAtTop: (value: boolean) => set(() => ({ atTop: value })),
        setHideHeader: (value: boolean) => set(() => ({ hideHeader: value })),
        setCarouselIndex: (num: number) => set(() => ({ carouselIndex: num })),
        setMasteredWords: (words: string[]) => set(() => ({ masteredWords: new Set(words) })),
        setAIModel: (model: ModelList) => {
            localStorage.setItem("AIModel", model)
            set(() => ({ AIModel: model }))
        },
        setIsPending: (value: boolean) => set(() => ({ isPending: value })),
        deleteMaterial: (id: string) => {
            const indexDB = getState().indexDB
            indexDB?.deleteMaterial(id)
            set(() => ({ materialHistory: getState().materialHistory.filter(material => material.id !== id) }))
        },
        addMaterialHistory: (material: MaterialIndexDB) => {
            set((state) => ({ materialHistory: [material, ...state.materialHistory] }))
        },
        upsertMaterialHistory: (material: MaterialIndexDB) => {
            set((state) => ({ materialHistory: state.materialHistory.map(prev => prev.id === material.id ? material : prev) }))
        },
        setAIBoosterAudio: (audio: HTMLAudioElement) => {
            set(() => ({ AIBoosterAudio: audio }))
        },
        setEditDialogOpen: (value: boolean) => {
            set(() => ({ editDialogOpen: value }))
        },
        setProgress: (progress: { isSyncing: boolean, progress: number, message: string }) => {
            set(() => ({ progress: progress }))
        },
        sync: async (t: any, toast: ({ ...props }: Toast) => { id: string, dismiss: () => void, update: (props: ToasterToast) => void }) => {
            set(() => ({ progress: { isSyncing: true, progress: 0, message: "同期を開始します" } }))
            
            // ユーザー情報
            const userId = getState().userInfo?.id
            if (!userId) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "ユーザー情報が存在しません" } }))
                return
            }

            const userInfoFromLocal = await indexDB.getUserInfo(userId)
            if (!userInfoFromLocal.isSuccess || !userInfoFromLocal.data.length) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "ユーザー情報の取得に失敗しました" } }))
                return
            }

            const pushUserInfoToRemote =　await updateUserInfoToRemote({
                id: userId,
                name: userInfoFromLocal.data[0].name || "",
                image: userInfoFromLocal.data[0].image || "",
                blind_mode: userInfoFromLocal.data[0].blind_mode,
                learning_lang: userInfoFromLocal.data[0].learning_lang || null,
                trans_lang: userInfoFromLocal.data[0].trans_lang || null,
                auto_sync: userInfoFromLocal.data[0].auto_sync,
                updated_at: userInfoFromLocal.data[0].updated_at,
                synced_at: new Date(),
            })

            if (!pushUserInfoToRemote.isSuccess) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "ユーザー情報の同期に失敗しました" } }))
                syncFailed(toast, t, "syncErr_userInfo")
                return
            }
            
            const fetchUserInfoFromRemote = await getUserInfoFromRemote(userId)
            if (!fetchUserInfoFromRemote.isSuccess || !fetchUserInfoFromRemote.data) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "ユーザー情報の取得に失敗しました" } }))
                syncFailed(toast, t, "syncErr_userInfo")
                return
            }

            const userInfo = {
                ...fetchUserInfoFromRemote.data,
                id: fetchUserInfoFromRemote.data.id,
                name: fetchUserInfoFromRemote.data.name || "",
                image: fetchUserInfoFromRemote.data.image || "",
                learning_lang: fetchUserInfoFromRemote.data.learning_lang || undefined,
                trans_lang: fetchUserInfoFromRemote.data.trans_lang || undefined,
                synced_at: new Date(),
            }

            const setUserInfoToLocal = await indexDB.saveUserInfo(userInfo)

            if (!setUserInfoToLocal.isSuccess) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "ユーザー情報の同期に失敗しました" } }))
                syncFailed(toast, t, "syncErr_userInfo")
                return
            }

            set(() => ({ userInfo: userInfo }))
            set(() => ({ progress: { isSyncing: true, progress: 10, message: "ユーザー情報の同期が完了しました" } }))

            // 単語帳プッシュ
            const getWordsFromLocal = await indexDB.getAllWordsOfUser(userId)
            if (!getWordsFromLocal.isSuccess) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "単語帳の取得に失敗しました" } }))
                syncFailed(toast, t, "syncErr_words")
                return
            }

            const upsertWordsToRemote = await Promise.all(getWordsFromLocal.data.map(async (word) => {
                const getRecords = await indexDB.getAllRecordsOfWord(word.id)
                if (!getRecords.isSuccess) {
                    return getRecords
                }

                const upsertWord = await upsertCardToRemote({ 
                    ...word,
                    author: userId,
                    records: getRecords.data[0] ? getRecords.data[0].records.filter((val) => !val.synced_at) : [],
                })

                if (!upsertWord.isSuccess) {
                    return upsertWord
                }
            
                set((state) => ({ progress: { isSyncing: true, progress: state.progress.progress + (1 / getWordsFromLocal.data.length) * 25, message: "単語帳を同期中……" } }))
                return {
                    isSuccess: true,
                    data: word.id
                }
            }))

            if (upsertWordsToRemote.length && upsertWordsToRemote.every(res => !res.isSuccess)) { //全ての単語が同期に失敗した場合
                set(() => ({ progress: { isSyncing: true, progress: 0, message: "単語帳の同期に失敗しました" } }))
                console.error("単語帳の同期に失敗しました")
                syncFailed(toast, t, "syncErr_words")
                return
            }

            // 単語帳フェッチ
            const fetchWordsFromRemote = await getCardsFromRemote(userId)
            if (!fetchWordsFromRemote.isSuccess || !fetchWordsFromRemote.data) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "単語帳の取得に失敗しました" } }))
                syncFailed(toast, t, "syncErr_words")
                return
            }

            // 単語帳インサート
            const setWordsToLocal = await Promise.all(fetchWordsFromRemote.data.map(async (word) => {
                const setWord = await indexDB.saveCardAndReturn({
                    ...word,
                    word: word.word,
                    pos: word.pos as POS,
                    phonetics: word.phonetics || "",
                    definition: word.definition || "",
                    example: word.example || "",
                    notes: word.notes || "",
                    synced_at: new Date(),
                    learned_at: word.learned_at || undefined,
                    author: word.authorId,
                }, true)

                if (!setWord.isSuccess) {
                    return setWord
                }

                const saveRecords = await indexDB.saveRecords(word.id, word.records.map(record => ({
                    synced_at: record.synced_at || new Date(),
                    time: record.time,
                    is_correct: record.is_correct,
                    reviewed_at: record.reviewed_at,
                })))

                if (!saveRecords.isSuccess) {
                    return saveRecords
                }

                if (!setWord.data.is_deleted) {
                    set((state) => ({
                        words: state.words.some(prev => prev.id === setWord.data.id)
                            ? state.words.map(prev => prev.id === setWord.data.id ? setWord.data : prev)
                            : sortWords([...state.words, setWord.data])
                    }))
                } else {
                    set((state) => ({
                        words: state.words.filter(prev => prev.id !== setWord.data.id)
                    }))
                }

                set((state) => ({ progress: { isSyncing: true, progress: state.progress.progress + (1 / getWordsFromLocal.data.length) * 25, message: "単語帳を同期中……" } }))

                return { isSuccess: true }
            }))
            
            if (setWordsToLocal.length && !setWordsToLocal.every(res => res.isSuccess)) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "単語帳の同期に失敗しました" } }))
                syncFailed(toast, t, "syncErr_words")
                return
            }

            set(() => ({ progress: { isSyncing: true, progress: 60, message: "単語帳の同期が完了しました" } }))

            // マテリアル
            const getMaterialsFromLocal = await indexDB.getAllMaterials(userId)
            if (!getMaterialsFromLocal.isSuccess) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "マテリアルの取得に失敗しました" } }))
                syncFailed(toast, t, "syncErr_material")
                return
            }

            const upsertMaterialsToRemote = await Promise.all(getMaterialsFromLocal.data.map(async (material) => {
                const upsertMaterial = await upsertMaterialToRemote(material)
                if (!upsertMaterial.isSuccess) {
                    return upsertMaterial
                }

                set((state) => ({ progress: { isSyncing: true, progress: state.progress.progress + (1 / getMaterialsFromLocal.data.length) * 20, message: "マテリアルを同期中……" } }))
                return { isSuccess: true }
            }))

            if (upsertMaterialsToRemote.length && !upsertMaterialsToRemote.every(res => res.isSuccess)) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "マテリアルの同期に失敗しました" } }))
                syncFailed(toast, t, "syncErr_material")
                return
            }

            const fetchMaterialsFromRemote = await getMaterialsFromRemote(userId)
            if (!fetchMaterialsFromRemote.isSuccess || !fetchMaterialsFromRemote.data) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "マテリアルの取得に失敗しました" } }))
                syncFailed(toast, t, "syncErr_material")
                return
            }

            const setMaterialsToLocal = await Promise.all(fetchMaterialsFromRemote.data.map(async (material) => {
                const materialToLocal: MaterialIndexDB = {
                    ...material,
                    content: material.content?.split("\n") || [],
                    translation: {
                        lang: material.trans_lang || "JA" as LanguageCode,
                        text: material.translation?.split("\n") || [],
                    },
                    sync_at: new Date(),
                    bookmarked_at: material.bookmarked_at || undefined,
                    deleted_at: material.deleted_at || undefined,
                    generated_by: material.generated_by as ModelList,
                    author: material.authorId,
                }

                const setMaterial = await indexDB.saveMaterial(materialToLocal)
                if (!setMaterial.isSuccess) {
                    return setMaterial
                }

                if (!materialToLocal.deleted_at) {
                    set((state) => ({
                        materialHistory: state.materialHistory.some(prev => prev.id === material.id)
                            ? state.materialHistory.map(prev => prev.id === material.id ? materialToLocal : prev)
                            : [...state.materialHistory, materialToLocal]
                    }))
                } else {
                    set((state) => ({
                        materialHistory: state.materialHistory.filter(prev => prev.id !== materialToLocal.id)
                    }))
                }

                set((state) => ({ progress: { isSyncing: true, progress: state.progress.progress + (1 / getMaterialsFromLocal.data.length) * 20, message: "マテリアルを同期中……" } }))
                return { isSuccess: true }
            }))

            if (setMaterialsToLocal.length && !setMaterialsToLocal.every(res => res.isSuccess)) {
                set(() => ({ progress: { isSyncing: false, progress: 0, message: "マテリアルの同期に失敗しました" } }))
                syncFailed(toast, t, "syncErr_material")
                return
            }

            set((state) => state.materialHistory.length ? ({ generatedMaterial: state.materialHistory[0] }) : {})

            set(() => ({ progress: { isSyncing: false, progress: 0, message: "同期が完了しました" } }))

            toast({
                title: t('sync_success'),
                description: t('sync_success')
            })
        }
    }))
}
