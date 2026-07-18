
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { getGroqClient } from "../config";

export const runGroqTest = async (prompt: string, systemPrompt?: string) => {
    try {
        const client = getGroqClient();

        const messages: ChatCompletionMessageParam[] = [];
        if (systemPrompt) {
            messages.push({
                role: "system",
                content: systemPrompt,
            });
        }
        messages.push({
            role: "user",
            content: prompt,
        });

        const chatResponse = await client.chat.completions.create({
            messages,
            model: "openai/gpt-oss-20b",
            max_completion_tokens: 400,
        });

        return chatResponse.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error executing Groq chat:", error);
        throw error;
    }
}
