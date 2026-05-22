import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ 
      success: false, 
      error: "No GROQ_API_KEY found in .env.local" 
    });
  }
  
  const results = [];
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  
  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Say 'working' in one word" }],
          max_tokens: 10,
        }),
      });
      
      const data = await response.json();
      results.push({
        model,
        status: response.status,
        success: response.ok,
        error: response.ok ? null : data.error?.message,
        response: response.ok ? data.choices?.[0]?.message?.content : null
      });
    } catch (err) {
      results.push({ model, success: false, error: String(err) });
    }
  }
  
  return NextResponse.json({ results });
}