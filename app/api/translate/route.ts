import { NextResponse } from "next/server";
import type { Sentiment } from "@/lib/utils";
// ✅ Import Neo4j functions (won't break anything if Neo4j is not connected)
import { getMultipleSignsFromNeo4j, getSignFromNeo4j } from "@/services/neo4j";

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
    
    // ===== STEP 1: Try Groq API (Primary) =====
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
    
    // ===== STEP 2: Try Neo4j (Secondary - WON'T BREAK ANYTHING) =====
    let neo4jGloss: string[] = [];
    let neo4jSuccess = false;
    
    try {
      const words = transcript.split(/\s+/).filter(Boolean);
      const result = await getMultipleSignsFromNeo4j(words);
      
      if (result.size > 0) {
        // Build gloss from Neo4j results
        for (const word of words) {
          const lower = word.toLowerCase();
          if (result.has(lower)) {
            neo4jGloss.push(result.get(lower)!);
          } else {
            // If Neo4j doesn't have this word, check if it's a known word
            // Using the existing dictionary from fallback.ts
            const knownWords = ['hello', 'help', 'hospital', 'thank', 'you', 'happy', 'danger', 'emergency', 'please', 'sorry'];
            if (knownWords.includes(lower)) {
              neo4jGloss.push(lower.toUpperCase());
            } else {
              // If all else fails, just use the word itself
              neo4jGloss.push(lower.toUpperCase());
            }
          }
        }
        neo4jSuccess = true;
      } else {
        // Fallback: try single word lookup
        for (const word of words) {
          const result = await getSignFromNeo4j(word);
          if (result) {
            neo4jGloss.push(result);
          } else {
            neo4jGloss.push(word.toUpperCase());
          }
        }
        neo4jSuccess = true;
      }
    } catch (neo4jError) {
      console.log("Neo4j not available, skipping...");
      // Neo4j failing won't break anything
    }
    
    // If Neo4j worked, return its result
    if (neo4jSuccess && neo4jGloss.length > 0) {
      const sentiment = detectSentiment(transcript);
      return NextResponse.json({
        transcript,
        gloss: neo4jGloss,
        sentiment,
        unknownWords: [],
        processing: false,
        sentimentFromGrok: false,
        source: "neo4j", // Just for debugging
      });
    }
    
    // ===== STEP 3: Simple Fallback (Always works) =====
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