const GLOSS_FALLBACK = (transcript: string) =>
  transcript
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

export async function generateGlossWithGrok(transcript: string): Promise<string[]> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) {
    return GLOSS_FALLBACK(transcript);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || "grok-2",
        messages: [
          {
            role: "user",
            content:
              `Convert this sentence to concise Indian Sign Language style gloss tokens only.\n` +
              `Return comma-separated tokens, no explanation:\n${transcript}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return GLOSS_FALLBACK(transcript);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";

    return text
      .replace(/\./g, "")
      .split(/[,\s]+/)
      .map((v: string) => v.trim().toUpperCase())
      .filter(Boolean);
  } catch {
    return GLOSS_FALLBACK(transcript);
  }
}
