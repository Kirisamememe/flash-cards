import { createStore } from 'zustand/vanilla'
import { PartOfSpeechLocal, WordDataMerged } from "@/types/WordIndexDB";
import { getCardsFromLocal, getPartOfSpeechesFromLocal, getUserInfoFromLocal } from "@/app/lib/indexDB/getFromLocal";
import { getUserInfoFromRemote } from "@/app/lib/remoteDB/getFromRemote";
import { saveUserInfoToLocal } from "@/app/lib/indexDB/saveToLocal";


export type WordbookState = {
    words: WordDataMerged[] | []
    poses: PartOfSpeechLocal[] | []
    userInfo: UserInfo | undefined
    currentIndex: number
    filterText: string
    isEditing: boolean
    blindMode: boolean
    loggedOutUse: boolean
    filteredWords: WordDataMerged[] | []
    userInterval: number
    overlayIsOpen: boolean
    isTransition: boolean
    isAddingPos: boolean
    testStart: boolean
}

export type WordbookActions = {
    setWords: (words: WordDataMerged[]) => void
    setPoses: (poses: PartOfSpeechLocal[]) => void
    addWord: (word: WordDataMerged) => void
    setWord: (word: WordDataMerged) => void
    deleteWord: (wordId: string) => void
    setPos: (pos: PartOfSpeechLocal) => void
    addPos: (pos: PartOfSpeechLocal) => void
    setUserInfo: (userInfo: UserInfo) => void
    setCurrentIndex: (num: number) => void
    setFilterText: (text: string) => void
    setIsEditing: (value: boolean) => void
    setBlindMode: (value: boolean, userInfo?: UserInfo) => void
    setLoggedOutUse: (value: boolean) => void
    setFilteredWords: () => void
    setUserInterval: (num: number) => void
    setOverlayIsOpen: (value: boolean) => void
    setIsTransition: (value: boolean) => void
    setIsAddingPos: (value: boolean) => void
    setTestStart: (value: boolean) => void
}

export type WordbookStore = WordbookState & WordbookActions

export const initWordbookStore = async (userId: string | undefined | null, url: string | undefined | null, userName: string | undefined | null): Promise<WordbookState> => {
    let words
    let poses
    let userInfo

    const loggedOutUseFromLocalStorage = localStorage.getItem("loggedOutUse")
    const blindModeFromLocalStorage = localStorage.getItem("blindMode")
    const localInterval = localStorage.getItem("interval")

    const fetchedWords = await getCardsFromLocal(userId, !loggedOutUseFromLocalStorage ? true : loggedOutUseFromLocalStorage === "1")
    if (!fetchedWords.isSuccess) {
        console.log("ZustandがローカルからWordsを取得できなかったわ")
    } else {
        words = fetchedWords.data
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
        poses: poses || [],
        userInfo: userInfo,
        currentIndex: 0,
        filterText: "",
        isEditing: false,
        blindMode: userInfo?.blind_mode || blindModeFromLocalStorage === "1" || false,
        loggedOutUse: loggedOutUseFromLocalStorage === "1",
        filteredWords: [],
        userInterval: localInterval && parseInt(localInterval) || 500,
        overlayIsOpen: false,
        isTransition: false,
        isAddingPos: false,
        testStart: false
    }
}

export const defaultInitState: WordbookState = {
    words: [],
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
    testStart: false
}

export const createWordbookStore = (initState: WordbookState = defaultInitState) => {
    return createStore<WordbookStore>()((set) => ({
        ...initState,
        setWords: (words: WordDataMerged[]) => set(() => ({ words: words })),
        setPoses: (poses: PartOfSpeechLocal[]) => set(() => ({ poses: poses })),
        setWord: (word: WordDataMerged) => set((state) => ({ words: state.words?.map(prev => prev.id === word.id ? word : prev) })),
        addWord: (word: WordDataMerged) => set((state) => ({ words: [word, ...state.words] })),
        deleteWord: (wordId: string) => set((state) => ({ words: state.words.filter(val => val.id !== wordId)})),
        setPos: (pos: PartOfSpeechLocal) => set((state) => ({ poses: state.poses?.map(prev => prev.id === pos.id ? pos : prev) })) ,
        addPos: (pos: PartOfSpeechLocal) => set((state) => ({ poses: [pos, ...state.poses] })) ,
        setUserInfo: (userInfo: UserInfo) => set(() => ({ userInfo: userInfo })),
        setCurrentIndex: (num: number) => set(() => ({ currentIndex: num })),
        setFilterText: (text: string) => set(() => ({ filterText: text })),
        setIsEditing: (value: boolean) => set(() => ({ isEditing: value })),
        setBlindMode: async (value: boolean, userInfo?: UserInfo) => {
            //イベントハンドラーかuseEffect内でしか実行できないから要注意！
            if (userInfo) {
                localStorage.setItem("blindMode", value ? "1" : "0")

                const data: UserInfo = { ...userInfo, blind_mode: value, updated_at: new Date() }
                await saveUserInfoToLocal(data).then()

                set(() => ({userInfo: data}))
            }
            else {
                localStorage.setItem("blindMode", value ? "1" : "0")
            }

            set(() => ({ blindMode: value }))
        } ,
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
        setUserInterval: (num: number) => set(() => ({ userInterval: num })),
        setOverlayIsOpen: (value: boolean) => set(() => ({ overlayIsOpen: value })),
        setIsTransition: (value: boolean) => set(() => ({ isTransition: value })),
        setIsAddingPos: (value: boolean) => set(() => ({ isAddingPos: value })),
        setTestStart: (value: boolean) => set(() => ({ testStart: value }))
    }))
}