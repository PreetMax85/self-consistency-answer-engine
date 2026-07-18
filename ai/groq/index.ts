import { getGroqClient } from "../config";


export const runGroqTest = async (prompt: string, systemPrompt?: string) => {
    try {
        const client = getGroqClient();
        console.log("Groq client initialized successfully.");

        const messages: any[] = [];
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
            messages: messages,
            model: "openai/gpt-oss-20b",
        });

        const content = chatResponse.choices[0]?.message?.content || "";
        console.log('Groq Chat Response:', content ?? 'No content returned');
        return content;
    } catch (error) {
        console.error("Error executing Groq chat:", error);
        throw error;
    }
}