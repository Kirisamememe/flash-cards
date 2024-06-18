'use server'

// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';

// Import other required libraries
import * as protos from "@google-cloud/text-to-speech/build/protos/protos";
import { auth } from "@/app/lib/auth";

type Result = {
    isSuccess: true,
    data: string
} | {
    isSuccess: false,
}

// Creates a client
const client = new textToSpeech.TextToSpeechClient();
export async function synthesizeSpeech(text: string): Promise<Result> {
    const session = await auth()
    if (!session || session?.user.role !== "ADMIN") throw new Error("権限がありません")

    try {
        // Construct the request
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest | undefined = {
            input: { text: text },
            // Select the language and SSML voice gender (optional)
            voice: { languageCode: 'en-US', name: "en-US-Journey-F" },
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 1 },
        }

        // Performs the text-to-speech request
        const [response] = await client.synthesizeSpeech(request)
        // Write the binary audio content to a local file
        // const writeFile = util.promisify(fs.writeFile)

        if (response.audioContent ) {
            // await writeFile('output.mp3', response.audioContent, 'binary')
            if (response.audioContent instanceof Uint8Array) {
                const base64Audio = Buffer.from(response.audioContent).toString('base64');
                // console.log(base64Audio)
                return {
                    isSuccess: true,
                    data: base64Audio
                }
            }
        }

        return { isSuccess: false }
    }
    catch (err) {
        return { isSuccess: false }
    }
}

// synthesizeSpeech("Movies, oh my gosh, I just, just absolutely love them. They're like time machines taking you to different worlds and landscapes, and um, and I just can't get enough of it.")

