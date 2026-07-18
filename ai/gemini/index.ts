import { getGeminiClient } from '../config';


export const runGeminiTest = async (prompt: string, systemPrompt?: string) => {
    try {
        const client = getGeminiClient();
        console.log("GeminiAI client initialized successfully.");

        const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: systemPrompt ? { systemInstruction: systemPrompt } : undefined,
        });
        const content = response.text;
        console.log('Gemini Chat Response:', content ?? 'No content returned');
        return content;
    } catch (error) {
        console.error("Error executing Gemini chat:", error);
        throw error;
    }
};
