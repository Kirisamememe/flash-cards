'use server'

import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from '@ai-sdk/anthropic';
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { auth } from "@/app/lib/auth";
import { z } from 'zod';
import { FreeModelList, ModelList, ProModelList } from "@/types/AIBooster";

type ModelsType = ProModelType & FreeModelsType

type ProModelType = {
    [K in ProModelList]: any
}

type FreeModelsType = {
    [K in FreeModelList]: any
}

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

    public async generateMaterial(prompt: string, model: ModelList, userRole: "ADMIN" | "USER") {
        console.log(`prompt: ${prompt}`)

        const stream = createStreamableValue()
        const selectedModel = userRole === "ADMIN" ? this.models[model] : this.freeModels[model]

        ;(async () => {
            if (!this.models || !this.freeModels) return

            const { partialObjectStream } = await streamObject({
                model: selectedModel,
                prompt: prompt,
                system: "",
                schema: z.object({
                    title: z.string().describe('Title of the content'),
                    content: z.array(z.string()).describe("Split by sentence, and store in an array.")
                }),
                maxTokens: 2000,
            })

            for await (const partialObject of partialObjectStream) {
                if (!partialObject?.content) continue

                stream.update(partialObject)
                console.log(partialObject.content)
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


    }
}

const AI = new GenerativeAI()

export async function generateMaterial(prompt: string, model: ModelList) {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    return AI.generateMaterial(prompt, model, session.user.role)
}

export async function translateByAI(text: string, lang: string, model: ModelList) {
    const session = await auth()
    if (!session?.user) throw new Error("権限がありません")

    const prompt = `Translate the following text into ${lang}:\n${text}`

    return AI.translate(prompt, model, session.user.role)
}

z.object({
    title: z.string().describe('Title of the content'),
    content: z.array(z.string()).describe("Split by sentence, and store in an array.")
})
