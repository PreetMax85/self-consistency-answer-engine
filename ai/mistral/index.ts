import { getMistralClient } from '../config';

interface messageType {
    role: "user" | "system" | "assistant";
    content: string;
}

export const runMistralTest = async (prompt: string, systemPrompt?: string) => {
    try {
        const client = getMistralClient();
        console.log("MistralAI client initialized successfully.");

        const prepareMessages: messageType[] = [];

        if (systemPrompt) {
            prepareMessages.push({
                role: 'system',
                content: systemPrompt
            })
        }
        prepareMessages.push({
            role: 'user',
            content: prompt
        })

        const chatResponse = await client.chat.complete({
            model: 'mistral-medium-latest',
            messages: prepareMessages,
        });

        const content = chatResponse.choices?.[0]?.message?.content;
        console.log('Mistral Chat Response:', content ?? 'No content returned');
        return content;
    } catch (error) {
        console.error("Error executing Mistral chat:", error);
        throw error;
    }
};
