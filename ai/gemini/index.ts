import { getGeminiClient } from '../config';


export const runGeminiTest = async (prompt: string, systemPrompt?: string) => {
    try {
        const client = getGeminiClient();

        const response = await client.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt,
            config: {
                ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
                maxOutputTokens: 400,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error executing Gemini chat:", error);
        throw error;
    }
};
