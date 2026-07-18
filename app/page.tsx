"use client";

import { useState } from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

type PerspectiveKey = 'gemini' | 'groq' | 'deepseek'

interface Results {
  gemini?: string
  groq?: string
  deepseek?: string
  finalAnswer?: string
}

type Stage = 'idle' | 'receiving' | 'analyzing' | 'synthesizing' | 'done'

const STAGES: { key: Stage; label: string }[] = [
  { key: 'receiving', label: 'Receiving perspectives' },
  { key: 'analyzing', label: 'Comparing responses' },
  { key: 'synthesizing', label: 'Building final answer' },
]

const PERSPECTIVE_LABELS: Record<PerspectiveKey, { label: string; accent: string }> = {
  gemini: { label: 'Perspective A', accent: 'pear' },
  groq: { label: 'Perspective B', accent: 'cyan' },
  deepseek: { label: 'Perspective C', accent: 'coral' },
}

const PERSPECTIVE_ORDER: PerspectiveKey[] = ['gemini', 'groq', 'deepseek']

const preprocessLaTeX = (content: string) => {
  if (!content) return ""
  return content
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$$')
    .replace(/\\\)/g, '$$');
}

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<Results | null>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [showRaw, setShowRaw] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const startStageSequence = () => {
    const timers = STAGES.slice(1).map((step, index) =>
      window.setTimeout(() => setStage(step.key), (index + 1) * 900)
    )
    return () => timers.forEach(window.clearTimeout)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setError("")
    setResults(null)
    setShowRaw(false)
    setCelebrate(false)
    setStage('receiving')

    const cancelStageSequence = startStageSequence()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error || "Failed to generate response. Please try again.")
      }

      const data: Results = await response.json()
      cancelStageSequence()
      setResults(data)
      setStage('done')
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 600)
    } catch (err: unknown) {
      cancelStageSequence()
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
      setStage('idle')
    } finally {
      setLoading(false)
    }
  }

  const getStageIndex = (key: Stage) => STAGES.findIndex(s => s.key === key)
  const currentStageIndex = getStageIndex(stage)

  const progressPercent = (() => {
    if (stage === 'idle') return 0
    if (stage === 'done') return 100
    return ((currentStageIndex + 0.5) / STAGES.length) * 100
  })()

  return (
    <>
      <main style={{ flex: 1 }}>
        <section
          style={{
            padding: 'clamp(1.5rem, 3vw, 2.5rem) var(--page-gutter) var(--space-xl)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="pulse-dot"
            style={{
              position: 'absolute',
              top: 'clamp(1.5rem, 3vw, 2.5rem)',
              right: 'clamp(2rem, 8vw, 6rem)',
              width: '12px',
              height: '12px',
            }}
          />

          <div className="shell" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
              <span
                className="mono-label"
                style={{
                  display: 'inline-block',
                  marginBottom: 'var(--space-md)',
                  color: 'var(--color-accent-2)',
                  opacity: 1,
                }}
              >
                MULTIPLE AI PERSPECTIVES
              </span>

              <h1
                style={{
                  fontSize: 'clamp(1.9rem, 3vw + 0.5rem, 3rem)',
                  fontWeight: 600,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  marginBottom: 'var(--space-md)',
                }}
              >
                One{' '}
                <span
                  className="hl"
                  style={{ '--hl': 'color-mix(in oklch, var(--color-accent-2) 55%, transparent)' } as React.CSSProperties}
                >
                  refined
                </span>{' '}
                answer.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  color: 'var(--color-ink-2)',
                  lineHeight: 1.5,
                  maxWidth: '36rem',
                  margin: '0 auto var(--space-lg)',
                }}
              >
                Ask a question. Three different AI models respond. We analyze them all
                and synthesize the strongest, most accurate answer.
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  maxWidth: '36rem',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    background: 'var(--color-paper-2)',
                    borderRadius: 'var(--radius-card)',
                    border: '1.5px solid transparent',
                    transition: 'border-color 200ms',
                    position: 'relative',
                  }}
                  className="focus-within:border-[var(--color-accent-deep)]"
                >
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask something…"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 0,
                      borderRadius: 'var(--radius-card)',
                      padding: '0.9rem 1.1rem',
                      color: 'var(--color-ink)',
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                    }}
                    className="placeholder:text-[var(--color-ink-2)] placeholder:opacity-60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="btn btn--pear"
                  style={{
                    alignSelf: 'center',
                    minWidth: '160px',
                    fontSize: '0.95rem',
                    padding: '0.85rem 2rem',
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                      Working…
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      Generate Answer
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 120ms' }}>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

        {loading && (
          <section
            className="section--band section--tint-pear"
            style={{ paddingBlock: 'var(--space-2xl) var(--space-xl)' }}
          >
            <div className="shell" style={{ maxWidth: '36rem', textAlign: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-md)',
                  marginBottom: 'var(--space-lg)',
                }}
              >
                {STAGES.map((s, i) => {
                  const isActive = i <= currentStageIndex
                  const isCurrent = i === currentStageIndex
                  return (
                    <div
                      key={s.key}
                      className={isCurrent ? 'stage-enter' : ''}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flex: 1,
                        opacity: isActive ? 1 : 0.35,
                        transition: 'opacity 300ms',
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--color-accent)' : 'var(--color-rule)',
                          color: isActive ? 'var(--color-ink)' : 'var(--color-ink-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          flexShrink: 0,
                          transition: 'background 300ms',
                        }}
                      >
                        {isCurrent && !isActive ? (
                          <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderTopColor: 'var(--color-accent-deep)' }} />
                        ) : isActive && i < 2 ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span
                        className="max-sm:hidden"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isCurrent ? 600 : 400,
                          color: 'var(--color-ink-2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div
                style={{
                  height: '4px',
                  background: 'var(--color-rule)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-2))',
                    borderRadius: '999px',
                    transition: 'width 500ms var(--ease-out)',
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {error && (
          <section style={{ padding: 'var(--space-xl) var(--page-gutter)' }}>
            <div
              className="shell"
              style={{
                maxWidth: '36rem',
                background: 'color-mix(in oklch, var(--color-accent-3) 10%, var(--color-paper))',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-lg)',
                border: '1px solid color-mix(in oklch, var(--color-accent-3) 30%, transparent)',
              }}
            >
              <p
                style={{
                  color: 'var(--color-accent-3-deep)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 5.5v4M9 12v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </p>
            </div>
          </section>
        )}

        {results && results.finalAnswer && (
          <>
            <section
              className="section--band section--tint-pear"
              style={{
                paddingBlock: 'var(--space-2xl) var(--space-2xl)',
                position: 'relative',
              }}
            >
              {celebrate && (
                <div className="star-burst" style={{ top: '30%', left: '50%' }} />
              )}

              <div className="shell" style={{ maxWidth: '48rem' }}>
                <span className="mono-label" style={{ marginBottom: 'var(--space-xs)', display: 'block' }}>
                  SYNTHESIZED ANSWER
                </span>

                <div
                  className="card"
                  style={{
                    padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 48px -20px oklch(20% 0.012 250 / 0.15)',
                  }}
                >
                  <div
                    className="prose prose-zinc dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap"
                    style={{
                      fontSize: '1.05rem',
                      lineHeight: 1.65,
                      '--tw-prose-body': 'var(--color-ink)',
                      '--tw-prose-headings': 'var(--color-ink)',
                      '--tw-prose-links': 'var(--color-accent-2)',
                      '--tw-prose-bold': 'var(--color-ink)',
                      '--tw-prose-code': 'var(--color-ink)',
                      '--tw-prose-pre-bg': 'oklch(20% 0.012 250)',
                    } as React.CSSProperties}
                  >
                    <Markdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                      {preprocessLaTeX(results.finalAnswer || "")}
                    </Markdown>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                  <button
                    type="button"
                    onClick={() => setShowRaw(!showRaw)}
                    className="btn btn--soft btn--cyan"
                    style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        style={{
                          transform: showRaw ? 'rotate(180deg)' : 'none',
                          transition: 'transform 200ms',
                        }}
                      >
                        <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {showRaw ? 'Hide raw perspectives' : 'Compare raw perspectives'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {showRaw && (
              <section
                className="section--band section--tint-cyan"
                style={{ paddingBlock: 'var(--space-xl) var(--space-2xl)' }}
              >
                <div className="shell">
                  <span className="mono-label" style={{ marginBottom: 'var(--space-lg)', display: 'block' }}>
                    RAW PERSPECTIVES
                  </span>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 'var(--space-lg)',
                    }}
                  >
                    {PERSPECTIVE_ORDER.map((key, i) => {
                      const content = results[key]
                      const info = PERSPECTIVE_LABELS[key]
                      return (
                        <div
                          key={key}
                          className={`card card--tint-${info.accent}`}
                          style={{
                            padding: 'var(--space-lg)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-sm)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 'var(--space-xs)',
                            }}
                          >
                            <h3
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                letterSpacing: '-0.01em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: info.accent === 'pear' ? 'var(--color-accent)' : info.accent === 'cyan' ? 'var(--color-accent-2)' : 'var(--color-accent-3)',
                                  display: 'inline-block',
                                }}
                              />
                              {info.label}
                            </h3>
                            <span className="mono-label" style={{ opacity: 0.5 }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                          </div>

                          <div
                            className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap"
                            style={{
                              fontSize: '0.85rem',
                              lineHeight: 1.6,
                              color: 'var(--color-ink-2)',
                              maxHeight: '320px',
                              overflowY: 'auto',
                              paddingRight: '0.25rem',
                              '--tw-prose-body': 'var(--color-ink-2)',
                              '--tw-prose-headings': 'var(--color-ink)',
                              '--tw-prose-links': 'var(--color-accent-2)',
                            } as React.CSSProperties}
                          >
                            <Markdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex, rehypeHighlight]}
                            >
                              {preprocessLaTeX(content || "*No response received.*")}
                            </Markdown>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

      </main>
    </>
  );
}
