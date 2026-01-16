import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { Groq } from "groq-sdk";
import OpenAI from "openai";

const app = express();
// Very important: parse JSON body!
app.use(express.json());

const askGithubAi = async (PROMPT, MODEL, API_KEY) => {
    try {
        console.log("running... askGithubAi");
        const token = API_KEY || process.env["GITHUB_TOKEN"];
        const endpoint = "https://models.github.ai/inference";
        const modelName = MODEL || "openai/gpt-4o";

        const client = new OpenAI({ baseURL: endpoint, apiKey: token });

        const response = await client.chat.completions.create({
            messages: [{ role: "user", content: PROMPT }],
            model: modelName
        });

        console.log(response.choices[0].message.content);
        return response.choices[0].message.content;
    } catch (e) {
        console.log(e);
        errors.push(e);
        return await askGemini(PROMPT, MODEL, API_KEY);
    }
};
const askGroq = async (PROMPT, MODEL, API_KEY) => {
    try {
        console.log("running... askGroq");

        const groq = new Groq({
            apiKey: API_KEY || process.env.GROQ_API_KEY
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: PROMPT
                }
            ],
            model: MODEL || "openai/gpt-oss-120b"
            // temperature: 1,
            // max_completion_tokens: 8192,
            // top_p: 1,
            // stream: true,
            //  reasoning_effort: "medium",
            // stop: null
        });
        let fullRes = "";
        for await (const chunk of chatCompletion) {
            process.stdout.write(chunk.choices[0]?.delta?.content || "");
            fullRes += chunk.choices[0]?.delta?.content || "";
        }
        return fullRes;
    } catch (e) {
        console.log(e);
        errors.push(e);
    }
};
const askGemini = async (PROMPT, MODEL, API_KEY) => {
    try {
        console.log("running... askGemini");

        const ai = new GoogleGenAI({
            apiKey: API_KEY || process.env.GEMINI_API_KEY
        });

        const model = MODEL || "gemini-flash-latest";
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: PROMPT
                    }
                ]
            }
        ];

        const response = await ai.models.generateContentStream({
            model,
            contents
        });
        let fullRes = "";
        for await (const chunk of response) {
            console.log(chunk.text);
            fullRes += chunk.text;
        }
        return fullRes;
    } catch (e) {
        console.log(e);
        errors.push(e);
        return await askGroq(PROMPT, MODEL, API_KEY);
    }
};

app.get("/", (req, res) => {
    res.send("response from ai");
});

// app.post("/use-gemini", async (req, res) => {
//     try {
//         console.log("use gemini");
//         const { prompt, model, geminiApiKey } = req.body || req.params;
//         console.log({ prompt, model, geminiApiKey });
//         // const ans = await askGemini(prompt, model, geminiApiKey);
//         // const ans = await askGroq(prompt, model, geminiApiKey);
//         const ans = await askGithubAi(prompt, model, geminiApiKey);
//         res.send(ans);
//     } catch (e) {
//         console.log(e);
//     }
// });
const errors = [];

app.post("/use-smartly-ai", async (req, res) => {
    try {
        const { prompt, model, apiKey } = req.body || req.params;
        console.log({ prompt, model, apiKey });
        const ans = await askGithubAi(prompt, model, apiKey);
        res.send({ ans, errors });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});
app.get("/use-smartly-ai", async (req, res) => {
    try {
        const { prompt, model, apiKey } = req.body || req.params;
        console.log({ prompt, model, apiKey });
        const ans = await askGithubAi(prompt, model, apiKey);
        res.send({ ans, errors });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

const useGemini = async (req, res) => {
    try {
        const body = req.body || req.params;
        console.log({ body });

        const { prompt, systemPrompt, model, apiKey } = body;

        const ai = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY
        });

        const tools = [
            {
                googleSearch: {}
            }
        ];
        const config = {
            thinkingConfig: {
                thinkingBudget: 0
            },
            tools,
            systemInstruction: [
                {
                    text: systemPrompt || `You are helpful ai.`
                }
            ]
        };

        const modelName = model || "gemini-flash-latest";
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ];

        const response = await ai.models.generateContentStream({
            model: modelName,
            contents
        });
        let fullRes = "";
        for await (const chunk of response) {
            console.log(chunk.text);
            fullRes += chunk.text;
        }
        res.send({ ans: fullRes });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
};

app.post("/use-gemini", useGemini);
app.get("/use-gemini", useGemini);

app.listen(4000, () => {
    console.log("http://localhost:4000/");
});
