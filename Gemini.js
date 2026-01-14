// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
async function main() {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
    console.log(process.env.GEMINI_API_KEY);
    const tools = [
        {
            googleSearch: {}
        }
    ];
    const config = {
        // thinkingConfig: {
        //     thinkingLevel: "HIGH"
        // },
        tools
    };
    // const model = "gemini-3-pro-preview";
    const model = "gemini-flash-latest";
    const contents = [
        {
            role: "user",
            parts: [
                {
                    text: `make a joke in hindi`
                }
            ]
        }
    ];

    const response = await ai.models.generateContentStream({
        model,
        config,
        contents
    });
    let fileIndex = 0;
    for await (const chunk of response) {
        console.log(chunk.text);
    }
}

main();
