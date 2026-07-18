export const runOpenCodeZen = async (
  prompt: string,
  systemPrompt?: string,
  model?: string,
) => {
  const apiKey = process.env.OPENCODE_API_KEY
  if (!apiKey) {
    throw new Error(
      "Environment variable OPENCODE_API_KEY is missing. Please set it in your .env file.",
    )
  }

  const messages: { role: string; content: string }[] = []
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt })
  }
  messages.push({ role: "user", content: prompt })

  const response = await fetch(
    "https://opencode.ai/zen/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "deepseek-v4-flash-free",
        messages,
        max_tokens: 400,
      }),
    },
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenCode Zen API error: ${response.status} ${errText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}
