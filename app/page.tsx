"use client";

import { useState } from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

const preprocessLaTeX = (content: string) => {
  if (!content) return "";
  return content
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$$')
    .replace(/\\\)/g, '$$');
};


export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    gemini?: string;
    groq?: string;
    mistral?: string;
    finalAnswer?: string;
  } | null>(null);

  const [showRaw, setShowRaw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate response. Please try again.");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-start">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Self-Consistency AI
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Compare outputs from Gemini, Groq, and Mistral, synthesized into a single refined answer.
        </p>
      </header>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="relative rounded-lg shadow-sm">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
            disabled={loading}
            className="w-full block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-60 resize-none text-base transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-50 px-4 py-3 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Synthesizing answers...
            </span>
          ) : (
            "Generate Answer"
          )}
        </button>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-900/50">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6 animate-fade-in">
          {/* Final Refined Answer */}
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Refined Consensus Answer
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">

              <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>{preprocessLaTeX(results.finalAnswer || "")}</Markdown>
            </div>
          </section>

          {/* Model Comparison Toggle */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
            >
              {showRaw ? "Hide Raw Model Responses" : "Compare Raw Model Responses"}
              <svg
                className={`h-4 w-4 transform transition-transform ${showRaw ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Raw Responses Grid */}
          {showRaw && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-slide-down">
              {/* Gemini */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Gemini
                </h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>{preprocessLaTeX(results.gemini || "No response received.")}</Markdown>
                </div>
              </div>

              {/* Groq */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Groq
                </h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>{preprocessLaTeX(results.groq || "No response received.")}</Markdown>
                </div>
              </div>

              {/* Mistral */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Mistral
                </h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                  <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>{preprocessLaTeX(results.mistral || "No response received.")}</Markdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
