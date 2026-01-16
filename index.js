import express from "express";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { Groq } from "groq-sdk";
import OpenAI from "openai";

const app = express();
// Very important: parse JSON body!
app.use(express.json());

const askGithubModel = async (prompt, systemPrompt) => {
    try {
        console.log("running... askGithubAi");
        const token = process.env["GITHUB_TOKEN"];
        const endpoint = "https://models.github.ai/inference";
        const modelName = "openai/gpt-4o";

        const client = new OpenAI({ baseURL: endpoint, apiKey: token });

        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt || "" },
                { role: "user", content: prompt }
            ],
            model: modelName
        });

        console.log(response.choices[0].message.content);
        return response.choices[0].message.content;
    } catch (e) {
        console.log(e);
        errors.push(e);
        return await askGemini(prompt, systemPrompt);
    }
};
const askGroq = async (prompt, systemPrompt) => {
    try {
        console.log("running... askGroq");

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "openai/gpt-oss-120b",
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            stream: false,
            reasoning_effort: "medium",
            stop: null
        });
        let fullRes = chatCompletion.choices[0].message.content;

        return fullRes;
    } catch (e) {
        console.log(e);
        errors.push(e);
    }
};
const askGemini = async (prompt, systemPrompt) => {
    try {
        console.log("running... askGemini");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
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
        const model = "gemini-flash-latest";
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
            model,
            contents,
            config
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
        return await askGroq(prompt, systemPrompt);
    }
};

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/docs.html");
});

let errors = [];

const useGemini = async (req, res) => {
    try {
        const body = req.body || req.query;
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
            contents,

            config
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
const useGroq = async (req, res) => {
    try {
        const body = req.body || req.query;
        console.log({ body });

        const { prompt, systemPrompt, model, apiKey } = body;

        const groq = new Groq({
            apiKey: apiKey || process.env.GROQ_API_KEY
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt || "You are helpful ai "
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: model || "openai/gpt-oss-120b",
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            stream: false,
            reasoning_effort: "medium",
            stop: null
        });
        let fullRes = chatCompletion.choices[0].message.content;

        res.send({ ans: fullRes });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
};
const useGithubModels = async (req, res) => {
    try {
        const body = req.body || req.query;
        console.log({ body });

        const { prompt, systemPrompt, model, apiKey } = body;

        const token = apiKey || process.env["GITHUB_TOKEN"];
        const endpoint = "https://models.github.ai/inference";
        const modelName = model || "openai/gpt-4o";

        const client = new OpenAI({ baseURL: endpoint, apiKey: token });

        const response = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt || "You are helpful ai."
                },
                { role: "user", content: prompt }
            ],
            model: modelName
        });

        console.log(response.choices[0].message.content);
        const fullRes = response.choices[0].message.content;
        res.send({ ans: fullRes });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
};

app.post("/ai", async (req, res) => {
    try {
        const { prompt, systemPrompt } = req.body || req.query;
        const ans = await askGithubModel(prompt, systemPrompt);
        res.send({ ans, errors });
        errors = [];
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});
app.get("/ai", async (req, res) => {
    try {
        const { prompt, systemPrompt } = req.body || req.query;
        const ans = await askGithubModel(prompt, systemPrompt);
        res.send({ ans, errors });
        errors = [];
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

app.post("/ai/github-model", useGithubModels);
app.get("/ai/github-model", useGithubModels);

app.post("/ai/groq", useGroq);
app.get("/ai/groq", useGroq);

app.post("/ai/gemini", useGemini);
app.get("/ai/gemini", useGemini);

app.listen(4000, () => {
    console.log("http://localhost:4000/");
});
