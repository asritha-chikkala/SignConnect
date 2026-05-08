import Anthropic from "@anthropic-ai/sdk";

export async function generateGlossWithClaude(transcript: string): Promise<string[]> {
  if (!process.env.CLAUDE_API_KEY) {
    return transcript.toUpperCase().split(/\s+/).filter(Boolean);
  }

  const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content:
          `Convert this sentence to concise Indian Sign Language style gloss tokens only.\n` +
          `Return comma-separated tokens, no explanation:\n${transcript}`,
      },
    ],
  });

  const text = response.content
    .map((item) => ("text" in item ? item.text : ""))
    .join(" ")
    .trim();
  return text
    .replace(/\./g, "")
    .split(/[,\s]+/)
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
}
