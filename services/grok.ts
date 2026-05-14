import type { Sentiment } from "@/lib/utils";

const GLOSS_FALLBACK = (transcript: string) =>
  transcript
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

const SENTIMENTS: Sentiment[] = ["neutral", "question", "urgent", "happy"];

function normalizeSentiment(value: unknown): Sentiment | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.toLowerCase().trim() as Sentiment;
  return SENTIMENTS.includes(v) ? v : undefined;
}

function tryParseGrokJson(text: string): { gloss: string[]; sentiment?: Sentiment } | null {
  const trimmed = text.trim();
  const jsonSlice = (() => {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence?.[1]) return fence[1].trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
    return trimmed;
  })();

  try {
    const data = JSON.parse(jsonSlice) as {
      gloss?: unknown;
      glossTokens?: unknown;
      tokens?: unknown;
      sentiment?: unknown;
    };
    const rawList = data.gloss ?? data.glossTokens ?? data.tokens;
    if (!Array.isArray(rawList)) return null;
    const gloss = rawList
      .map((v) => String(v).trim().toUpperCase())
      .filter(Boolean);
    if (!gloss.length) return null;
    return { gloss, sentiment: normalizeSentiment(data.sentiment) };
  } catch {
    return null;
  }
}

export type GrokGlossResult = {
  gloss: string[];
  sentiment?: Sentiment;
};

export async function generateGlossWithGrok(transcript: string): Promise<GrokGlossResult> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) {
    return { gloss: GLOSS_FALLBACK(transcript) };
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
            role: "system",
            content:
              "You convert English to Indian Sign Language (ISL) style gloss for a signer avatar. " +
              "Respond with JSON only, no markdown, matching: " +
              '{"gloss":["TOKEN1","TOKEN2"],"sentiment":"neutral|question|urgent|happy"}. ' +
              "Use concise upper-case gloss tokens (not English word order when ISL differs). " +
              "Keep 1-12 tokens when possible.",
          },
          {
            role: "user",
            content: `English: ${transcript}`,
          },
        ],
        temperature: 0.35,
        max_tokens: 220,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { gloss: GLOSS_FALLBACK(transcript) };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    const parsed = tryParseGrokJson(text);
    if (parsed) return parsed;

    const legacy = text
      .replace(/\./g, "")
      .split(/[,\s]+/)
      .map((v: string) => v.trim().toUpperCase())
      .filter(Boolean);
    return { gloss: legacy.length ? legacy : GLOSS_FALLBACK(transcript) };
  } catch {
    return { gloss: GLOSS_FALLBACK(transcript) };
  }
}
