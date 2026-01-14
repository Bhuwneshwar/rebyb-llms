import { Groq } from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const chatCompletion = await groq.chat.completions.create({
    messages: [
        {
            role: "user",
            content: "Hi\n"
        },
        {
            role: "assistant",
            content: "Hello! How can I help you today?"
        },
        {
            role: "user",
            content: "tell me a joke"
        }
    ],
    model: "openai/gpt-oss-120b",
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    stream: true,
    reasoning_effort: "medium",
    stop: null
});

for await (const chunk of chatCompletion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
}
