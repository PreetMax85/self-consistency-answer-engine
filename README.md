# Self-Consistency Answer Engine

A Next.js app that queries multiple AI models in parallel, then synthesizes the best parts of each response into one refined answer using the **self-consistency technique**.

## How It Works

```
User Question
     │
     ├──→  Gemini (gemini-3.1-flash-lite)    ─┐
     ├──→  Groq   (openai/gpt-oss-20b)       ─┼──→  Evaluator (Groq)  ──→  Final Answer
     └──→  OpenCode Zen (deepseek-v4-flash-free) ─┘
```

1. You type a question.
2. Three AI models answer it at the same time (`Promise.all`).
3. An evaluator model (Groq) reads all three responses, resolves contradictions, and merges them into one clear answer.
4. You see the synthesized result — with the option to expand and compare the raw responses side-by-side.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Markdown | react-markdown + remark-gfm + rehype-highlight + rehype-katex |
| AI Providers | Google Gemini (`@google/genai`), Groq (`groq-sdk`), OpenCode Zen (fetch) |

## Models

| Role | Provider | Model ID |
|---|---|---|
| Generator | Google Gemini | `gemini-3.1-flash-lite` |
| Generator | Groq | `openai/gpt-oss-20b` |
| Generator | OpenCode Zen | `deepseek-v4-flash-free` |
| Evaluator | Groq | `openai/gpt-oss-20b` |

## Project Structure

```
├── app/
│   ├── api/chat/route.ts   # API route — orchestrates parallel calls + evaluation
│   ├── page.tsx             # Frontend — input, results, raw perspective viewer
│   ├── layout.tsx           # Root layout with fonts + metadata
│   └── globals.css          # Design system (OKLCH palette, components, animations)
├── ai/
│   ├── config.ts            # Shared env helpers + Gemini/Groq client singletons
│   ├── gemini/index.ts      # Gemini provider
│   ├── groq/index.ts        # Groq provider
│   └── opencode/index.ts    # OpenCode Zen provider (raw fetch)
```

## Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- API keys for Gemini, Groq, and OpenCode Zen

### Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/self-consistency-answer-engine.git
cd self-consistency-answer-engine

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Then fill in your API keys
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENCODE_API_KEY=your_opencode_zen_api_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Self-Consistency Flow (Backend)

The core logic lives in [`app/api/chat/route.ts`](app/api/chat/route.ts):

1. **Validate** — rejects empty prompts and prompts over 2000 characters.
2. **Dispatch** — sends the prompt to Gemini, Groq, and DeepSeek (via OpenCode Zen) in parallel with a shared system instruction.
3. **Evaluate** — compiles the three responses and sends them to the Groq evaluator with instructions to merge, resolve contradictions, and produce a unified answer.
4. **Return** — sends back the final synthesized answer plus the three raw responses.

## License

MIT
