'use server'

import * as sdk from "microsoft-cognitiveservices-speech-sdk"

type Result = {
    isSuccess: true,
    data: string
} | {
    isSuccess: false,
}

export async function synthesizeSpeech(text: string): Promise<Result> {
    try {
        if (!process.env.SPEECH_KEY || !process.env.SPEECH_REGION) {
            console.error("環境変数が設定されていません")
            return { isSuccess:false }
        }

        const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION)

        // The language of the voice that speaks.
        speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"

        // Create the speech synthesizer.
        const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig)


        return new Promise((resolve, reject) => {
            speechSynthesizer.speakTextAsync(text,
                result => {
                    const { audioData } = result;

                    speechSynthesizer.close();
                    const base64Audio = Buffer.from(audioData).toString('base64');

                    resolve( {
                        isSuccess: true,
                        data: base64Audio
                    })
                },
                error => {
                    console.log(error);
                    speechSynthesizer.close();
                    reject( { isSuccess: false })
                }
            )
        })
    } catch (error) {
        console.error(error)
        return { isSuccess:false }
    }
}