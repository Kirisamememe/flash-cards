'use client'

import { type ReactNode, createContext, useRef, useContext, useState, useEffect } from 'react'
import { type StoreApi, useStore } from 'zustand'

import {
    type WordbookStore,
    createWordbookStore,
    initWordbookStore,
} from '@/stores/wordbook-store'
import Loading from "@/components/ui/loading";

export const WordbookStoreContext = createContext<StoreApi<WordbookStore> | null>(
    null,
)

export interface WordbookStoreProviderProps {
    children: ReactNode
    userId: string | undefined | null
    url: string | undefined | null
    userName: string | undefined | null
}

export const WordbookStoreProvider = ({
    children, userId, url, userName
}: WordbookStoreProviderProps) => {
    const storeRef = useRef<StoreApi<WordbookStore> | null>(null)
    // const [store, setStore] = useState<StoreApi<WordbookStore> | null>(null);
    const [_, setRerender] = useState(false);
    // console.log(`WordbookStoreProvider: userId > ${userId}`)
    // console.log(`WordbookStoreProvider: url > ${url}`)
    // console.log(`WordbookStoreProvider: userName > ${userName}`)

    useEffect(() => {
        // let isMounted = true;
        let cancelled = false; // This flag is to prevent state update after unmount

        const initialize = async (userId: string | undefined | null, url: string | undefined | null, userName: string | undefined | null) => {
            // ユーザーがログアウトしても、storeRef.currentは存在するので、
            // storeは更新されず、userInfoは引き続き保持されてしまう。
            // それを避けるために、userIdがundefinedになった場合も再度イニシャライズを行う
            // ただ、これは一時的な対策であり、ログアウト時にページは強制的にリロードされるべきだ
            if (!storeRef.current || (storeRef.current && userId === undefined)) {
                const initializedStore = await initWordbookStore(userId, url, userName);
                if (!cancelled) {
                    storeRef.current = createWordbookStore(initializedStore);
                    setRerender(p => !p)
                }
                // console.log(initializedStore)
            }
        }
        console.log("※※※※※※※※※※※※※※※WordbookStoreProvider内のuseEffectが実行されたようだ※※※※※※※※※※※※※※※")

        initialize(userId, url, userName).catch(e => console.error(e))

        return () => {
            cancelled = true
            // isMounted = false
        }
    }, [url, userId, userName])

    if (!storeRef.current) {
        return (
            <Loading className={"fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"}/>
        )
    }

    return (
        <WordbookStoreContext.Provider value={storeRef.current}>
            {children}
        </WordbookStoreContext.Provider>
    );
}

export const useWordbookStore = <T,>(
    selector: (store: WordbookStore) => T,
): T => {
    const wordbookStoreContext = useContext(WordbookStoreContext)

    if (!wordbookStoreContext) {
        throw new Error(`useWordbookStore must be use within WordbookStoreProvider`)
    }

    return useStore(wordbookStoreContext, selector)
}