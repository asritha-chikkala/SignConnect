import { NextResponse } from "next/server";
import type { Sentiment } from "@/lib/utils";

function detectSentiment(transcript: string): Sentiment {
  const text = transcript.toLowerCase();
  if (text.includes("?")) return "question";
  if (text.includes("help") || text.includes("danger") || text.includes("emergency")) return "urgent";
  if (text.includes("thank") || text.includes("happy") || text.includes("love")) return "happy";
  return "neutral";
}

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    
    console.log("📝 Translator - Processing:", transcript);
    
    // Try Groq API first
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (groqApiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You convert English to Indian Sign Language (ISL) style gloss for a signer avatar.
Respond with JSON only, no markdown, matching: {"gloss":["TOKEN1","TOKEN2"],"sentiment":"neutral|question|urgent|happy"}.
Use concise upper-case gloss tokens. Keep 1-12 tokens when possible.`
              },
              {
                role: "user",
                content: `English: ${transcript}`,
              },
            ],
            temperature: 0.35,
            max_tokens: 220,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "";
          
          // Parse JSON response
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.gloss && Array.isArray(parsed.gloss)) {
                const sentiment = parsed.sentiment || detectSentiment(transcript);
                return NextResponse.json({
                  transcript,
                  gloss: parsed.gloss.map((g: string) => g.toUpperCase()),
                  sentiment,
                  unknownWords: [],
                  processing: false,
                  sentimentFromGrok: true,
                });
              }
            }
          } catch (e) {
            console.log("JSON parse error, using fallback");
          }
        }
      } catch (error) {
        console.log("Groq API error:", error);
      }
    }
    
    // Fallback: Simple word-to-gloss conversion
    const fallbackGloss = transcript
      .toUpperCase()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 10);
    
    const sentiment = detectSentiment(transcript);
    
    return NextResponse.json({
      transcript,
      gloss: fallbackGloss,
      sentiment,
      unknownWords: [],
      processing: false,
      sentimentFromGrok: false,
    });
    
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}