import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, fileContent, fileName } = await request.json();
    
    console.log("📚 Educational Mode - Message:", message?.slice(0, 100));
    console.log("File present:", !!fileContent);
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GROQ_API_KEY not configured. Please add to .env.local" 
      }, { status: 500 });
    }
    
    let systemPrompt = `You are a helpful AI tutor. Answer questions directly and clearly. Keep responses under 150 words. Use simple language.`;
    let userMessage = message;
    
    if (fileContent && fileContent.length > 0) {
      systemPrompt += ` The user uploaded a document. Use the content to answer accurately.`;
      userMessage = `Document content:\n${fileContent.slice(0, 3000)}\n\nQuestion: ${message || "Please summarize this document"}`;
    }
    
    if (!userMessage || userMessage.trim().length === 0) {
      userMessage = "Please introduce yourself and explain what you can help with.";
    }
    
    // Groq models
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
    let lastError = null;
    
    for (const model of models) {
      try {
        console.log(`🔄 Trying Groq model: ${model}`);
        
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage.slice(0, 4000) },
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const aiResponse = data.choices?.[0]?.message?.content;
          if (aiResponse && aiResponse.trim().length > 0) {
            console.log(`✅ Success with model: ${model}`);
            return NextResponse.json({ response: aiResponse });
          }
        } else {
          console.log(`❌ Model ${model} failed:`, data.error?.message);
          lastError = data.error?.message;
        }
      } catch (err) {
        console.log(`❌ Model ${model} error:`, err);
        lastError = err;
      }
    }
    
    return NextResponse.json({ 
      error: `All Groq models failed. Last error: ${lastError || "Unknown"}` 
    }, { status: 500 });
    
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}