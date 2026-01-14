import OpenAI from "openai";
import "dotenv/config";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "openai/gpt-4o";

export async function main() {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const response = await client.chat.completions.create({
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "What is the capital of France?" },
            { role: "assistant", content: "The capital of France is Paris." },
            { role: "user", content: "What about Spain?" }
        ],
        model: modelName
    });

    console.log(response.choices[0].message.content);
}

main().catch(err => {
    console.error("The sample encountered an error:", err);
});
