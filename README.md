# Self-Consistency AI Agent App

A Next.js web application implementing the **self-consistency technique** to generate accurate, high-quality, and synthesized responses using multiple LLM providers.

## Live Deployment & Code Links
* **GitHub Repository:** [github.com/babitakry/self-consistency-answer-engine](https://github.com/babitakry/self-consistency-answer-engine.git)
* **Application Type:** **UI-based Web App** (Next.js App Router + React + Tailwind CSS)

---

## How It Works

1. **User Input:** The user enters a question or prompt in the clean input interface.
2. **Parallel Model Execution:** The system sends the prompt to three different AI models simultaneously.
3. **Consensus & Evaluation:** The individual model responses are compiled and sent to a final evaluator model.
4. **Synthesis:** The evaluator analyzes the responses, compares what each model got right, extracts the most accurate details, corrects inaccuracies, and writes a unified, refined response.
5. **Output:** The user is presented with the final synthesized answer, with an optional expandable accordion to inspect and compare the raw responses from each model.

---

## Models and Providers Used

| Model Role | Provider | API SDK | Model Name |
| :--- | :--- | :--- | :--- |
| **Generator** | Google Gemini | `@google/genai` | `gemini-3.1-flash-lite` |
| **Generator** | Groq | `groq-sdk` | `openai/gpt-oss-20b` |
| **Generator** | OpenCode Zen | `fetch` (OpenAI-compatible) | `deepseek-v4-flash-free` |
| **Evaluator / Synthesizer** | OpenCode Zen | `fetch` (OpenAI-compatible) | `nemotron-3-ultra-free` |

---

## Self-Consistency Flow Implementation

The backend logic is orchestrated in [app/api/chat/route.ts](app/api/chat/route.ts):

1. **Input Stage:** Validates the prompt (rejects empty prompts and prompts over 2000 characters) and applies a shared system instruction to all models:
   > *"Your response must be short, concise, direct, and to the point. Avoid extra conversational filler or fluff."*
2. **Execution Stage:** Dispatches concurrent API requests using JavaScript's `Promise.all` to fetch responses from Gemini, Groq, and DeepSeek (via OpenCode Zen) in parallel.
3. **Evaluation Stage:** Constructs an evaluation payload containing the original user prompt and the three raw model responses.
4. **Synthesis Stage:** Calls Nemotron (via OpenCode Zen) with a specialized evaluator system instruction:
   * Compares the three responses, noting which model got which parts right.
   * Resolves contradictions and merges content into a unified explanation without mentioning specific model names.
   * Reformats structured items (Markdown tables, lists, code snippets).
5. **Formatting Stage:** The frontend page ([app/page.tsx](app/page.tsx)) uses `react-markdown` along with:
   * `rehype-katex` & `remark-math` with KaTeX style sheet to format mathematical equations (e.g. $E=mc^2$).
   * `rehype-highlight` for syntax highlighting (in standard code blocks).

---

## Getting Started

### Prerequisites
Make sure you have Node.js / Bun installed and your API keys set up.

### Environment Setup
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENCODE_API_KEY=your_opencode_zen_api_key
```

### Running Locally
```bash
# Install dependencies
bun install

# Run the development server
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
