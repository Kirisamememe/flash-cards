import { saveWordCardRequest } from '@/types';
import { DeleteResult, GetPromiseCommonResult, UpdatePromiseCommonResult } from '@/types/ActionsResult';
import { AIDicData, Material, MaterialIndexDB } from '@/types/AIBooster';
import { initMasteredWords } from '@/types/static';
import { MasteredWords, UserInfo } from '@/types/User';
import { AnswerRecord, EN2ENItem, Record, TTSObj, WordData, WordIndexDB } from '@/types/WordIndexDB';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';

const dbName = 'flashcards_db';

export class IndexDB {
    static dbName = 'flashcards_db'
    static version = 19
    static stores = [
        'words', 
        'users',
        'EN2ENDictionary', 
        'answerRecords',
        'TTSStore', 
        'materials', 
        'masteredWords', 
        'generatedDicData'
    ] as const
    
    private db: IDBDatabase | undefined

    public async initialize() {
        try {
            await this.openDB()
        } catch (error) {
            console.error("データベースの初期化に失敗しました:", error)
        }
    }

    private openDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("openDBを実行")
            const request = indexedDB.open(IndexDB.dbName, IndexDB.version)

            request.onupgradeneeded = (event) => {
                console.log("openDBアップデート")
                const db = (event.target as IDBOpenDBRequest).result
                this.createObjectStores(db)
            }

            request.onerror = (event) => {
                console.log("openDBを実行失敗")
                reject(`データベースに繋がりませんでした: ${(event.target as IDBOpenDBRequest).error?.message}`)
            }   

            request.onsuccess = (event) => {
                console.log("openDBを実行成功")
                this.db = (event.target as IDBOpenDBRequest).result
                resolve()
            }
        })
    }

    private createObjectStores(db: IDBDatabase): void {
        IndexDB.stores.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
                db.createObjectStore(store, 
                    { 
                        keyPath: store === 'EN2ENDictionary' || store === 'generatedDicData' ? 
                        'word' : store === 'masteredWords' ? 
                        'user_id' : store === 'answerRecords' ? 'word_id' : 'id' 
                    }
                )
            }
        })
    }

    private saveRequest(
        transactionArr: typeof IndexDB.stores[number][], 
        data: (UserInfo | WordData | Record | EN2ENItem | MaterialIndexDB | AIDicData | TTSObj | MasteredWords)[]
    ): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject({
                    isSuccess: false,
                    error: {
                        message: "データベースが開かない"
                    }
                })
                return
            }

            const transaction = this.db.transaction(transactionArr, "readwrite")
            const stores = transactionArr.map(trans => transaction.objectStore(trans))
            const requests = stores.map((store, index) => store.put(data[index]))

            transaction.oncomplete = () => {
                resolve({ 
                    isSuccess: true, 
                    data: requests.map(request => request.result)
                })
            }

            transaction.onerror = (event) => {
                reject({ 
                    isSuccess: false, 
                    error: { 
                        message: (event.target as IDBTransaction).error?.message
                    } 
                })
            }
        })
    }


    private getAll(transactionArr: ['words']): Promise<GetPromiseCommonResult<[WordIndexDB[]]>>
    private getAll(transactionArr: ['materials']): Promise<GetPromiseCommonResult<[MaterialIndexDB[]]>>
    private getAll(transactionArr: ['answerRecords']): Promise<GetPromiseCommonResult<[Record[]]>>
    private getAll(transactionArr: ['generatedDicData']): Promise<GetPromiseCommonResult<[AIDicData[]]>>

    private getAll(transactionArr: typeof IndexDB.stores[number][]): Promise<GetPromiseCommonResult<any[]>> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject({
                    isSuccess: false,
                    error: {
                        message: "データベースが開かない"
                    }
                })
                return
            }

            const transaction = this.db.transaction(transactionArr, "readonly")
            const stores = transactionArr.map(trans => transaction.objectStore(trans))
            const requests = stores.map(store => store.getAll())

            transaction.oncomplete = () => {
                resolve({ 
                    isSuccess: true, 
                    data: requests.map(request => request.result)
                })
            }

            transaction.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: (event.target as IDBTransaction).error?.message
                    }
                })
            }
        })
    }

    private get(transactionArr: ['words'], key: string[]): Promise<GetPromiseCommonResult<[WordData]>>
    private get(transactionArr: ['materials'], key: string[]): Promise<GetPromiseCommonResult<[MaterialIndexDB]>>
    private get(transactionArr: ['EN2ENDictionary'], key: string[]): Promise<GetPromiseCommonResult<[EN2ENItem]>>
    private get(transactionArr: ['TTSStore'], key: string[]): Promise<GetPromiseCommonResult<[TTSObj]>>
    private get(transactionArr: ['generatedDicData'], key: string[]): Promise<GetPromiseCommonResult<[AIDicData]>>
    private get(transactionArr: ['users'], key: string[]): Promise<GetPromiseCommonResult<[UserInfo]>>
    private get(transactionArr: ['answerRecords'], key: string[]): Promise<GetPromiseCommonResult<[Record]>>
    private get(transactionArr: ['masteredWords'], key: string[]): Promise<GetPromiseCommonResult<[MasteredWords]>>

    private get(
        transactionArr: typeof IndexDB.stores[number][], 
        key: string[]
    ): Promise<GetPromiseCommonResult<any>> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject({
                    isSuccess: false,
                    error: {
                        message: "データベースが開かない"
                    }
                })
                return
            }

            const transaction = this.db.transaction(transactionArr, "readonly")
            const stores = transactionArr.map(trans => transaction.objectStore(trans))
            const requests = stores.map((store, index) => store.get(key[index]))

            transaction.oncomplete = () => {
                resolve({
                    isSuccess: true, 
                    data: requests.map(request => request.result)
                })
            }

            transaction.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: (event.target as IDBTransaction).error?.message
                    }
                })
            }
        })
    }


    private delete(
        transactionArr: typeof IndexDB.stores[number][], 
        key: string[]
    ): Promise<DeleteResult> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject({
                    isSuccess: false,
                    error: {
                        message: "データベースが開かない"
                    }
                })
                return
            }
            const transaction = this.db.transaction(transactionArr, "readwrite")
            const stores = transactionArr.map(trans => transaction.objectStore(trans))
            stores.map((store, index) => store.delete(key[index]))

            transaction.oncomplete = () => {
                resolve({ 
                    isSuccess: true,
                    message: "削除しました"
                })
            }

            transaction.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: (event.target as IDBTransaction).error?.message
                    }
                })
            }
        })
    }

    private deleteMany(
        transactionArr: typeof IndexDB.stores[number][], 
        key: string[][]
    ): Promise<DeleteResult> {
        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject({
                    isSuccess: false,
                    error: {
                        message: "データベースが開かない"
                    }
                })
                return
            }

            const transaction = this.db.transaction(transactionArr, "readwrite")
            const stores = transactionArr.map(trans => transaction.objectStore(trans))
            stores.map((store, index) => key[index].map(k => store.delete(k)))

            transaction.oncomplete = () => {
                resolve({ 
                    isSuccess: true,
                    message: "削除しました"
                })
            }

            transaction.onerror = (event) => {
                reject({
                    isSuccess: false,
                    error: {
                        message: (event.target as IDBTransaction).error?.message
                    }
                })
            }
        })
    }

    // Save
    public saveUserInfo(userInfo: UserInfo) {
        return this.saveRequest(['users'], [userInfo])
    }

    public saveMasteredWords(masteredWords: MasteredWords) {
        return this.saveRequest(['masteredWords'], [masteredWords])
    }

    public async initMasteredWords(userId: string) {
        const getMasteredWords = await this.get(['masteredWords'], [userId])
        if (!getMasteredWords.isSuccess) {
            return getMasteredWords
        }

        if (!getMasteredWords.data[0]) {
            return this.saveMasteredWords({
                user_id: userId,
                words: initMasteredWords.words,
                updated_at: new Date()
            })
        }

        return { 
            isSuccess: true,
            data: null
        }
    }

    public async updateMasteredWords(masteredWords: MasteredWords): Promise<UpdatePromiseCommonResult<IDBValidKey | null>> {
        const getMasteredWords = await this.get(['masteredWords'], [masteredWords.user_id])
        if (!getMasteredWords.isSuccess) {
            return getMasteredWords
        }

        if (!getMasteredWords.data.length || getMasteredWords.data[0].updated_at < masteredWords.updated_at) {
            return this.saveMasteredWords({...masteredWords, updated_at: new Date()})
        }

        return {
            isSuccess: true,
            data: null
        }
    }

    public async pushWordToMasteredWords(userId: string, word: string): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
        const masteredWords = await this.get(['masteredWords'], [userId])
        if (!masteredWords.isSuccess) {
            return masteredWords
        }

        const modifiedWords: MasteredWords = {
            ...masteredWords.data[0],
            words: [...masteredWords.data[0].words, word],
            updated_at: new Date()
        }

        return this.saveMasteredWords(modifiedWords)
    }

    public saveCard(word: WordData) {
        return this.saveRequest(['words'], [word])
    }

    public async saveRecord(wordId: string, record: AnswerRecord): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
        try {
            const recordReq = await this.get(['answerRecords'], [wordId])
            if (!recordReq.isSuccess) {
                return recordReq
            }

            const modifiedRecord: Record = {
                ...recordReq.data[0],
                records: [...recordReq.data[0].records, record]
            }

            return this.saveRequest(['answerRecords'], [modifiedRecord])
        } catch (error) {
            return {
                isSuccess: false,
                error: {
                    message: "レコードの保存に失敗しました",
                    detail: error
                }
            }
        }
    }

    public saveRecords(wordId: string, records: AnswerRecord[]) {
        return this.saveRequest(['answerRecords'], [{
            word_id: wordId,
            records: records
        }])
    }

    public saveEN2ENItem(item: EN2ENItem) {
        return this.saveRequest(['EN2ENDictionary'], [item])
    }

    public saveTTS(ttsObj: TTSObj ) {
        return this.saveRequest(['TTSStore'], [ttsObj])
    }

    public async createMaterial(material: Material) {
        const materialToIDB: MaterialIndexDB = {
            ...material,
            id: createId(),
            created_at: new Date(),
            updated_at: new Date(),
        }

        const saveRequest = await this.saveRequest(['materials'], [materialToIDB])

        if (!saveRequest.isSuccess) {
            return saveRequest
        }

        return this.get(['materials'], [materialToIDB.id])
    }

    public async updateMaterial(material: MaterialIndexDB) {
        const materialToIDB: MaterialIndexDB = {
            ...material,
            updated_at: new Date(),
        }

        const saveRequest = await this.saveRequest(['materials'], [materialToIDB])

        if (!saveRequest.isSuccess) {
            return saveRequest
        }

        return this.get(['materials'], [materialToIDB.id])
    }

    public saveMaterial(material: MaterialIndexDB) {
        return this.saveRequest(['materials'], [material])
    }

    public saveGeneratedDicData(dicData: AIDicData): Promise<UpdatePromiseCommonResult<IDBValidKey>> {
        return this.saveRequest(['generatedDicData'], [dicData])
    }


    public async saveCardAndReturn(
        word: z.infer<typeof saveWordCardRequest>, 
        forSync: boolean = false
    ): Promise<UpdatePromiseCommonResult<WordData>> {
        try {
            const validatedFields = saveWordCardRequest.safeParse(word)
            if (!validatedFields.success) {
                return { 
                    isSuccess: false, 
                    error: {
                        message: validatedFields.error.message
                    }
                }
            }

            const wordData: WordData = {
                ...word,
                id: word.id || createId(),
                created_at: word.created_at || new Date(),
                updated_at: forSync ? word.updated_at as Date : new Date(),
                synced_at: forSync ? new Date() : word.created_at,
                pos: word.pos,
                learned_at: word?.learned_at,
                retention_rate: word.retention_rate || 0,
                author: word.author,
                is_deleted: word.is_deleted,
            }

            const wordRequest = await this.saveCard(wordData)
            if (!wordRequest.isSuccess) {
                return wordRequest
            }

            return {
                isSuccess: true,
                data: wordData
            }
        } catch (error: any) {
            return {
                isSuccess: false,
                error: {
                    message: error.message,
                }
            }
        }
    }

    // Get All
    public async getAllWordsOfUser(userId: string | undefined | null, includeDeleted: boolean = false): Promise<GetPromiseCommonResult<WordIndexDB[]>> {
        const words = await this.getAll(['words'])
        if (!words.isSuccess) {
            return words
        }

        const filteredResults = words.data[0].filter(word => 
            (word.author === userId || word.author === undefined) &&
            (includeDeleted ? true : !word.is_deleted)
        )

        return {
            isSuccess: true,
            data: filteredResults
        }
    }

    public getAllRecordsOfWord (wordId: string): Promise<GetPromiseCommonResult<[Record]>> {
        return this.get(['answerRecords'], [wordId])
    }
    

    public getPromptWords(
        userId: string, 
        limit: "random" | "recent" | "mostForgettable"
    ): Promise<GetPromiseCommonResult<string[]>> {
        return new Promise(async (resolve, reject) => {
            const words = await this.getAllWordsOfUser(userId)

            if (!words.isSuccess) {
                reject(words.error)
                return
            }

            let wordlist: string[]
            
            const fetchedWords: WordIndexDB[] = words.data.filter(word => !word.is_deleted && !word.learned_at)

            switch (limit) {
                case "random":
                    wordlist = fetchedWords.map(word => word.word)
                    for (let i = wordlist.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [wordlist[i], wordlist[j]] = [wordlist[j], wordlist[i]];
                    }
                    wordlist = wordlist.slice(0, 10)
                    break
                case "recent":
                    wordlist = fetchedWords.sort((a, b) => 
                            b.created_at.getTime() - a.created_at.getTime()
                        ).map(word => word.word).slice(0, 10)
                    break
                case "mostForgettable":
                    wordlist = fetchedWords.sort((a, b) =>  
                            b.retention_rate - a.retention_rate
                        ).slice(0, 10).map(word => word.word)
                    break
            }

            resolve({ isSuccess: true, data: wordlist })
        })
    }

    public getAllMaterials(userId: string, length?: number, offset?: number): Promise<GetPromiseCommonResult<MaterialIndexDB[]>> {
        return new Promise(async (resolve, reject) => {
            const materials = await this.getAll(['materials'])
            if (!materials.isSuccess) {
                reject(materials.error)
                return
            }

            const filteredResults = materials.data[0].filter(material => 
                material.author === userId
            ).sort((a, b) => 
                b.created_at.getTime() - a.created_at.getTime()
            ).slice(length ? 0 : undefined, length ? length : undefined)

            resolve({
                isSuccess: true,
                data: filteredResults
            })
        })
    }


    // Get
    public getUserInfo(id: string): Promise<GetPromiseCommonResult<[UserInfo]>> {
        return this.get(['users'], [id])
    }

    public getWord(id: string) {
        return this.get(['words'], [id])
    }

    public getWordData(id: string): Promise<GetPromiseCommonResult<[WordData]>> {
        return this.get(['words'], [id])
    }

    public getEN2ENItem(word: string): Promise<GetPromiseCommonResult<[EN2ENItem]>> {
        return this.get(['EN2ENDictionary'], [word])
    }

    public getTTS(id: string): Promise<GetPromiseCommonResult<[TTSObj]>> {
        return this.get(['TTSStore'], [id])
    }

    public getGeneratedDicData(word: string): Promise<GetPromiseCommonResult<[AIDicData]>> {
        return this.get(['generatedDicData'], [word])
    }

    public getMaterial(id: string): Promise<GetPromiseCommonResult<[MaterialIndexDB]>> {
        return this.get(['materials'], [id])
    }

    public getMasteredWords(userId: string): Promise<GetPromiseCommonResult<[MasteredWords]>> {
        return this.get(['masteredWords'], [userId])
    }

    // Delete
    public async deleteWord(id: string) {
        const word = await this.getWord(id)
        if (!word.isSuccess) {
            return word
        }

        if (!word.data[0].synced_at) {
            return await this.delete(['words'], [id])
        }

        return await this.saveCard({
            ...word.data[0],
            is_deleted: true,
            updated_at: new Date()
        })
    }

    public async deleteMaterial(id: string) {
        const material = await this.getMaterial(id)
        if (!material.isSuccess) {
            return material
        }

        if (!material.data[0].synced_at) {
            return await this.delete(['materials'], [id])
        }

        return await this.updateMaterial({
            ...material.data[0],
            deleted_at: new Date(),
            updated_at: new Date()
        })
    }

    // Sync
    public sync() {

    }

}



// レガシー関数

export function openDB():Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 19);

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
            if (!db.objectStoreNames.contains('records')) {
                db.createObjectStore('records', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('EN2ENDictionary')) {
                db.createObjectStore('EN2ENDictionary', { keyPath: 'word' });
            }
            if (!db.objectStoreNames.contains('TTSStore')) {
                db.createObjectStore('TTSStore', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('materials')) {
                db.createObjectStore('materials', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('masteredWords')) {
                db.createObjectStore('masteredWords', { keyPath: 'user_id' });
            }
            if (!db.objectStoreNames.contains('generatedDicData')) {
                db.createObjectStore('generatedDicData', { keyPath: 'word' });
            }
        }

        request.onerror = (event) => {
            reject(`データベースに繋がりませんでした: ${(event.target as IDBOpenDBRequest).error?.message}`);
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };
    });
}

export function deleteByIdFromLocal(userId: string | undefined, wordId: string): Promise<DeleteResult> {
    return new Promise(async (resolve, reject) => {
        const db = await openDB()
        const transaction = db.transaction(['words'], 'readwrite')
        const store = transaction.objectStore('words')
        const request = store.get(wordId)

        request.onsuccess = () => {
            if (request.result.author !== undefined && request.result.author !== userId){
                reject({
                    isSuccess: false,
                    error: {
                        message: `権限がありません`
                    }
                })
            }

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


