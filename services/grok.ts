export async function generateGlossWithGrok(transcript: string): Promise<string[]> {
  if (!process.env.GROK_API_KEY) {
    return transcript.toUpperCase().split(/\s+/).filter(Boolean);
  }

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-2",
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
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Grok API error:", error);
      return transcript.toUpperCase().split(/\s+/).filter(Boolean);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content ?? "";

    return text
      .replace(/\./g, "")
      .split(/[,\s]+/)
      .map((v: string) => v.trim().toUpperCase())
      .filter(Boolean);
  } catch (error) {
    console.error("Error calling Grok API:", error);
    return transcript.toUpperCase().split(/\s+/).filter(Boolean);
  }
}
