'use server'

import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamObject, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { auth } from "@/app/lib/auth";
import { z } from 'zod';
import { FreeModelList, ModelList, ProModelList } from "@/types/AIBooster";
import { LanguageCode, languageList } from "@/types/User";
import { POSList } from "@/types/WordIndexDB";


type ModelsType = ProModelType & FreeModelsType

type ProModelType = {
    [K in ProModelList]: any
}

type FreeModelsType = {
    [K in FreeModelList]: any
}

type SchemaType = {
    material: z.ZodObject<{
        title: z.ZodString
        content: z.ZodArray<z.ZodString>
    }>
    dictionary: z.ZodObject<{
        pronunciation: z.ZodOptional<z.ZodString>
        results: z.ZodArray<z.ZodObject<{
            partOfSpeech: z.ZodOptional<z.ZodString>
            definition: z.ZodString
            example: z.ZodString
            similarTo: z.ZodOptional<z.ZodString>
        }>>
    }>
}
type SchemaList = keyof SchemaType

class GenerativeAI {
    private models: ModelsType = {
        "calude-3-5-sonnet-20240620": createAnthropic({ apiKey: process.env.CLAUDE_KEY})("claude-3-5-sonnet-20240620"),
        "gpt-4o": createOpenAI({ apiKey: process.env.OPENAI_KEY })("gpt-4o"),
        "gpt-4-turbo": createOpenAI({ apiKey: process.env.OPENAI_KEY })("gpt-4-turbo"),
        "gpt-3.5-turbo": createOpenAI({ apiKey: process.env.OPENAI_KEY })("gpt-3.5-turbo"),
        "gemini-1.5-pro-latest": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_KEY })("models/gemini-1.5-pro-latest"),
        "gemini-1.5-flash-latest": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_KEY })("models/gemini-1.5-flash-latest"),
        "gemini-pro": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_KEY })("models/gemini-pro"),
    }

    private freeModels: FreeModelsType = {
        "gemini-1.5-pro-latest": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_FREE_KEY })("models/gemini-1.5-pro-latest"),
        "gemini-1.5-flash-latest": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_FREE_KEY })("models/gemini-1.5-flash-latest"),
        "gemini-pro": createGoogleGenerativeAI({ apiKey: process.env.GEMINI_FREE_KEY })("models/gemini-pro"),
    }

    private schema = {
        material: z.object({
            title: z.string().describe('Title of the content').default(""),
            content: z.array(z.string()).describe("Split by sentence, and store in an array.").default([]),
        }),
        materialWithTrans: z.object({
            title: z.string().describe('Title of the content').default(""),
            content: z.array(z.string()).describe("Split by sentence, and store in an array.").default([]),
            translation: z.array(z.string()).describe("Please translate each sentence and store it in the 'text' Array.").default([])
        }),
        dictionary: z.object({
            word: z.string().describe("The word.").default(""),
            pronunciation: z.string().default(""),
            results: z.array(z.object({
                partOfSpeech: z.enum(POSList).default("UNDEFINED").describe("Part of speech in the source language"),
                definition: z.string().default(""),
                example: z.object({
                    text: z.string(),
                    translation: z.string()
                }).describe("The example should have a translation.").default({ text: "", translation: "" }),
                similarTo: z.array(z.string()).default([]).describe("Synonyms or similar expressions in the source language")
            })).describe("If there are multiple definitions for this word, output up to 5 in order of frequency of use and store them in an Array.").default([])
        })
    }

    public async generateMaterial(prompt: string, model: ModelList, userRole: "ADMIN" | "USER", lang: LanguageCode, transLang?: LanguageCode) {
        console.log(`prompt: ${prompt}`)

        const stream = createStreamableValue()
        const selectedModel = userRole === "ADMIN" ? this.models[model] : this.freeModels[model]
        const transPrompt = transLang ? `Then translate it into ${languageList[transLang]}` : ""
        const system = `You are an excellent ${languageList[lang]} teacher. Please follow the prompt and generate material that's great for ${languageList[lang]} learning. Your students are not native ${languageList[lang]} speakers, so please avoid literary expressions and generate practical, utilitarian text.` + transPrompt

        console.log(`prompt: ${system}`)

        ;(async () => {
            if (!this.models || !this.freeModels) return

            const { partialObjectStream } = await streamObject({
                model: selectedModel,
                prompt: prompt,
                system: system,
                frequencyPenalty: 1,
                seed: undefined,
                schema: transLang ? this.schema.materialWithTrans : this.schema.material,
                maxTokens: 2000,
            })

            for await (const partialObject of partialObjectStream) {
                if (!partialObject?.content) continue

                stream.update(partialObject)
                console.log(partialObject.content)
            }

        })().then(() => {
                stream.done({ done: true })
                console.log("==== DONE ====")
            })
            .catch((e) => {
                stream.error({ error: e.message })
                throw e
            })

        console.log(stream.value)

        return { data: stream.value }
    }

    public async generateDicData(prompt: string, model: ModelList, userRole: "ADMIN" | "USER") {
        console.log(`prompt: ${prompt}`)

        const stream = createStreamableValue()
        const selectedModel = userRole === "ADMIN" ? this.models[model] : this.freeModels[model]

        ;(async () => {
            if (!this.models || !this.freeModels) return

            const { partialObjectStream } = await streamObject({
                model: selectedModel,
                prompt: prompt,
                system: "",
                schema: this.schema.dictionary,
                maxTokens: 2000,
            })

            for await (const partialObject of partialObjectStream) {
                if (!partialObject?.results) continue

                stream.update(partialObject)
                console.log(partialObject)
            }

        })().then(() => {
            stream.done({ done: true })
            console.log("==== STREAM HAS DONE ====")
        })
            .catch((e) => {
                stream.error({ error: e.message })
                throw e
            })

        console.log(stream.value)

        return { data: stream.value }
    }

    public async translate(prompt: string, model: ModelList, userRole: "ADMIN" | "USER") {
        console.log(`prompt: ${prompt}`)

        const stream = createStreamableValue()
        const selectedModel = userRole === "ADMIN" ? this.models[model] : this.freeModels[model]

        ;(async () => {
            if (!this.models || !this.freeModels) return

            const { textStream } = await streamText({
                model: selectedModel,
                prompt: prompt,
                system: "",
                maxTokens: 2000,
            })

            for await (const delta of textStream) {
                if (!delta) continue

                stream.update(delta)
                console.log(delta)
            }
        })().then()
    }

}

const AI = new GenerativeAI()

export async function generateMaterial(prompt: string, model: ModelList, lang: LanguageCode, transLang?: LanguageCode) {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    return AI.generateMaterial(prompt, model, session.user.role, lang, transLang)
}

export async function translateByAI(text: string, lang: string, model: ModelList) {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    const prompt = `Translate the following text into ${lang}:\n${text}`

    return AI.translate(prompt, model, session.user.role)
}

export async function getDicData(word: string, model: ModelList, lang: LanguageCode = "EN") {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    const prompt = `Please output the dictionary data of '${word}' (including the word, pronunciation symbols, POS, definitions, example sentences, translations of example sentences, synonyms, etc.). Definitions and translations of example sentences should be in ${languageList[lang]}.`

    return AI.generateDicData(prompt, model, session.user.role)
}


