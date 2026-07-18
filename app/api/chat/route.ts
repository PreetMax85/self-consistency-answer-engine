import { runGeminiTest } from "@/ai/gemini";
import { runGroqTest } from "@/ai/groq";
import { runOpenCodeZen } from "@/ai/opencode";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt || !prompt.trim()) {
            return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
        }
        if (prompt.length > 2000) {
            return NextResponse.json({ error: "Prompt must be under 2000 characters." }, { status: 400 });
        }

        const baseModelSystemPrompt = "Answer directly and accurately in 200 words or fewer. Avoid filler and do not restate the question.";

        // 1. Fetch responses from all three models in parallel
        const results = await Promise.allSettled([
            runGeminiTest(prompt, baseModelSystemPrompt),
            runGroqTest(prompt, baseModelSystemPrompt),
            runOpenCodeZen(prompt, baseModelSystemPrompt, "deepseek-v4-flash-free"),
        ]);

        const geminiResponse = results[0].status === "fulfilled" ? results[0].value : null;
        const groqResponse = results[1].status === "fulfilled" ? results[1].value : null;
        const deepseekResponse = results[2].status === "fulfilled" ? results[2].value : null;

        // Log any failures
        results.forEach((r, i) => {
            if (r.status === "rejected") {
                console.error(`Provider ${i} failed:`, r.reason);
            }
        });

        const successCount = [geminiResponse, groqResponse, deepseekResponse].filter(Boolean).length;
        if (successCount === 0) {
            return NextResponse.json({ error: "All AI providers failed. Please try again." }, { status: 502 });
        }

        // 2. Define the system prompt for the evaluator
        const systemPrompt = `You are an expert editor. Merge the strongest, factual parts of the supplied drafts into one direct answer. Resolve contradictions using sound reasoning. Do not mention models, drafts, or evaluation. Use clear Markdown only when it improves readability. Keep the final answer under 300 words.`;

        // 3. Format the evaluation prompt containing the responses
        const evaluationPrompt = `User Prompt: "${prompt}"

AI Model Responses to synthesize:
---
Response 1:
${geminiResponse?.slice(0, 1800) ?? "(No response)"}
---
Response 2:
${groqResponse?.slice(0, 1800) ?? "(No response)"}
---
Response 3:
${deepseekResponse?.slice(0, 1800) ?? "(No response)"}
---`;

        // 4. Generate the final refined response
        const finalResponse = await runGroqTest(evaluationPrompt, systemPrompt);

        return NextResponse.json({
            gemini: geminiResponse,
            groq: groqResponse,
            deepseek: deepseekResponse,
            finalAnswer: finalResponse
        });

    } catch (error) {
        console.error("Chat route error:", error);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
