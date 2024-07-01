import { createStore } from 'zustand/vanilla'
import { PartOfSpeechLocal, WordDataMerged } from "@/types/WordIndexDB";
import {
    getCardsFromLocal,
    getMaterialsFromLocal,
    getPartOfSpeechesFromLocal,
    getUserInfoFromLocal
} from "@/app/lib/indexDB/getFromLocal";
import { getUserInfoFromRemote } from "@/app/lib/remoteDB/getFromRemote";
import { saveCardToLocal, saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";
import { UpdatePromiseCommonResult } from "@/types/ActionsResult";
import { animateElement, sortWords } from "@/app/lib/utils";
import { exampleMaterial, Material, ModelList } from "@/types/AIBooster";


export type WordbookState = {
    words: WordDataMerged[] | []
    learningCount: number
    poses: PartOfSpeechLocal[] | []
    currentIndex: number
    filterText: string
    filteredWords: WordDataMerged[] | []
    isEditing: boolean

    userInfo: UserInfo | undefined
    blindMode: boolean
    loggedOutUse: boolean
    userInterval: number

    overlayIsOpen: boolean
    isTransition: boolean
    isAddingPos: boolean

    playTTS: boolean
    playSE: boolean

    generatedMaterial: Material
    atTop: boolean
    hideHeader: boolean
    carouselIndex: number

    AIModel: ModelList
}

export type WordbookActions = {
    setWords: (words: WordDataMerged[]) => void
    setPoses: (poses: PartOfSpeechLocal[]) => void
    addWord: (word: WordDataMerged) => void
    setWord: (word: WordDataMerged) => void
    setWordToINDB: (userId: string | undefined, word: WordDataMerged) => Promise<UpdatePromiseCommonResult<number>>
    deleteWord: (wordId: string) => void
    setPos: (pos: PartOfSpeechLocal) => void
    addPos: (pos: PartOfSpeechLocal) => void
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
    setIsAddingPos: (value: boolean) => void
    setPlayTTS: (value: boolean) => void
    setPlaySE: (value: boolean) => void

    setGeneratedMaterial: (material: Material) => void
    setAtTop: (value: boolean) => void
    setHideHeader: (value: boolean) => void
    setCarouselIndex: (num: number) => void

    setAIModel: (model: ModelList) => void
}

export type WordbookStore = WordbookState & WordbookActions

export const initWordbookStore = async (userId: string | undefined | null, url: string | undefined | null, userName: string | undefined | null): Promise<WordbookState> => {
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

    const fetchedWords = await getCardsFromLocal(userId, !loggedOutUseFromLocalStorage ? true : loggedOutUseFromLocalStorage === "1")
    if (!fetchedWords.isSuccess) {
        console.log("ZustandがローカルからWordsを取得できなかったわ")
    } else {
        words = sortWords(fetchedWords.data)
    }

    const fetchedPoses = await getPartOfSpeechesFromLocal(userId)
    if (!fetchedPoses.isSuccess) {
        console.log("Zustandがローカルからposesを取得できなかったわ")
    } else {
        poses = fetchedPoses.data
    }

    if (userId) {
        const fetchedUserInfo = await getUserInfoFromLocal(userId)
        if (!fetchedUserInfo.isSuccess || !fetchedUserInfo.data) {
            console.log("ZustandがローカルからuserInfoを取得できなかったわ")
            // userIdが存在するのにローカルから取得できなかったということは、ログインしたばかりで、まだIndexにデータがない

            const remoteUserInfo = await getUserInfoFromRemote(userId)
            if (remoteUserInfo.isSuccess && remoteUserInfo.data ) {
                // localStorage.setItem("loggedOutUse", remoteUserInfo.data.use_when_loggedout ? "1" : "0")
                localStorage.setItem("blindMode", remoteUserInfo.data.blind_mode ? "1" : "0")
                userInfo = {
                    ...remoteUserInfo.data,
                    image: url || remoteUserInfo.data.image || "",
                    name: userName || remoteUserInfo.data.name || "",
                    updated_at: remoteUserInfo.data.updatedAt,
                    synced_at:  remoteUserInfo.data.synced_at || undefined,
                }
                await saveUserInfoToLocal(userInfo).catch()
            }

        } else {
            //ローカルからゲットできた。つまり以前ログインしたことがある・ログインセッションがある。
            // localStorage.setItem("loggedOutUse", fetchedUserInfo.data.use_when_loggedout ? "1" : "0")
            localStorage.setItem("blindMode", fetchedUserInfo.data.blind_mode ? "1" : "0")
            userInfo = {
                ...fetchedUserInfo.data,
                image: url || fetchedUserInfo.data.image,
                name: userName || fetchedUserInfo.data.name,
            }
            await saveUserInfoToLocal(userInfo)
        }

    }

    console.log("initWordbookStoreが実行されたようだ")

    return {
        words: words || [],
        learningCount: words?.filter(word => !word.is_learned).length || 0,
        poses: poses || [],
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
        isAddingPos: false,
        playTTS: !!playTTSFromLocalStorage ? playTTSFromLocalStorage === "1" : false,
        playSE: !!playSEFromLocalStorage ? playSEFromLocalStorage === "1" : false,
        generatedMaterial: exampleMaterial,
        atTop: true,
        hideHeader: false,
        carouselIndex: 0,
        AIModel: localAIModel ? localAIModel as ModelList : "gemini-1.5-pro-latest" as ModelList
    }
}

export const defaultInitState: WordbookState = {
    words: [],
    learningCount: 0,
    poses: [],
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
    isAddingPos: false,
    playTTS: false,
    playSE: false,
    generatedMaterial: exampleMaterial,
    atTop: true,
    hideHeader: false,
    carouselIndex: 0,
    AIModel: "gemini-1.5-pro-latest" as ModelList
}

export const createWordbookStore = (initState: WordbookState = defaultInitState) => {
    return createStore<WordbookStore>()((set, getState) => ({
        ...initState,
        setWords: (words: WordDataMerged[]) => set(() => ({ words: words })),
        setPoses: (poses: PartOfSpeechLocal[]) => set(() => ({ poses: poses })),
        setWord: (word: WordDataMerged) => set((state) => ({ words: state.words?.map(prev => prev.id === word.id ? word : prev) })),
        setWordToINDB: (userId: string | undefined, word: WordDataMerged) => {
            return new Promise<UpdatePromiseCommonResult<number>>(async (resolve, reject) => {
                saveCardToLocal(userId, {
                    ...word,
                    phonetics: word.phonetics || "",
                    partOfSpeech: word.partOfSpeech?.id || "",
                    example: word.example || "",
                    notes: word.notes || "",
                }).then((res) => {
                    if (res.isSuccess) {
                        set((state) => ({ words: sortWords(state.words?.map(prev => prev.id === word.id ? word : prev)) }))
                        set((state) => ({ learningCount: state.words.filter(word => !word.is_learned).length }))

                        resolve({
                            isSuccess: true,
                            data: getState().words.findIndex(value => value.id === word.id)
                        })
                    }
                }).catch(error => {
                    reject({
                        isSuccess: false,
                        error: {
                            message: "IndexDBに保存できませんでした",
                            detail: error
                        }
                    })
                })
            })
        },
        addWord: (word: WordDataMerged) => set((state) => ({ words: [word, ...state.words] })),
        deleteWord: (wordId: string) => set((state) => ({ words: state.words.filter(val => val.id !== wordId)})),
        setPos: (pos: PartOfSpeechLocal) => set((state) => ({ poses: state.poses?.map(prev => prev.id === pos.id ? pos : prev) })) ,
        addPos: (pos: PartOfSpeechLocal) => set((state) => ({ poses: [pos, ...state.poses] })) ,
        setUserInfo: (userInfo: UserInfo) => {
            return new Promise(async (resolve, reject) => {
                await saveUserInfoToLocal(userInfo)
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
                await saveUserInfoToLocal(data)
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
        setIsAddingPos: (value: boolean) => set(() => ({ isAddingPos: value })),
        setPlayTTS: (value: boolean) => set(() => ({ playTTS: value })),
        setPlaySE: (value: boolean) => {
            localStorage.setItem("playSE", value ? "1" : "0")
            set(() => ({ playSE: value }))
        },
        setGeneratedMaterial: (material: Material) => {
            set(() => ({ generatedMaterial: material }))
        },
        setAtTop: (value: boolean) => set(() => ({ atTop: value })),
        setHideHeader: (value: boolean) => set(() => ({ hideHeader: value })),
        setCarouselIndex: (num: number) => set(() => ({ carouselIndex: num })),
        setAIModel: (model: ModelList) => {
            localStorage.setItem("AIModel", model)
            set(() => ({ AIModel: model }))
        }
    }))
}
