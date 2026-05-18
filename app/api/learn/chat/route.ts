import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    console.log("📚 Educational Mode - Question:", message);
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ 
        response: "Please ask me a question! I'm here to help you learn." 
      });
    }
    
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ No API key found");
      return NextResponse.json({ 
        response: "API key not configured. Please add GROK_API_KEY to .env.local" 
      });
    }
    
    console.log("🔑 API Key found, calling Grok...");
    
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-2-latest",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI tutor. Answer questions directly with clear explanations.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });
    
    const data = await response.json();
    console.log("📡 API Response status:", response.status);
    
    if (!response.ok) {
      console.error("❌ API Error:", data);
      return NextResponse.json({ 
        response: `I'm having trouble connecting. Please check your API key.` 
      });
    }
    
    const aiResponse = data.choices?.[0]?.message?.content;
    console.log("✅ AI Response:", aiResponse?.slice(0, 100));
    
    if (!aiResponse) {
      return NextResponse.json({ 
        response: "I'm here to help you learn! What would you like to know?" 
      });
    }
    
    return NextResponse.json({ response: aiResponse });
    
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json({ 
      response: "I encountered an error. Please try again." 
    });
  }
}