import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, fileContent, fileName } = await request.json();
    
    console.log("📚 Educational Mode - Message:", message?.slice(0, 100));
    console.log("File present:", !!fileContent);
    
    // ===== STEP 1: Try Sarvaam AI (Primary) =====
    const sarvaamApiKey = process.env.SARVAAM_API_KEY;
    
    if (sarvaamApiKey) {
      try {
        let systemPrompt = `You are a helpful AI tutor. Answer questions directly and clearly. Keep responses under 150 words. Use simple language.`;
        let userMessage = message;
        
        if (fileContent && fileContent.length > 0) {
          systemPrompt += ` The user uploaded a document. Use the content to answer accurately.`;
          userMessage = `Document content:\n${fileContent.slice(0, 3000)}\n\nQuestion: ${message || "Please summarize this document"}`;
        }
        
        if (!userMessage || userMessage.trim().length === 0) {
          userMessage = "Please introduce yourself and explain what you can help with.";
        }
        
        const response = await fetch("https://api.sarvaam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sarvaamApiKey}`,
          },
          body: JSON.stringify({
            model: "sarvaam-v1",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage.slice(0, 4000) },
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content;
          if (aiResponse && aiResponse.trim().length > 0) {
            console.log(`✅ Sarvaam AI response`);
            return NextResponse.json({ response: aiResponse, source: "sarvaam" });
          }
        }
      } catch (error) {
        console.log("Sarvaam AI error:", error);
      }
    }
    
    // ===== STEP 2: Try Groq API (Fallback) =====
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (groqApiKey) {
      const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
      let lastError = null;
      
      for (const model of models) {
        try {
          console.log(`🔄 Trying Groq model: ${model}`);
          
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: "You are a helpful AI tutor. Answer questions directly and clearly. Keep responses under 150 words. Use simple language." },
                { role: "user", content: message.slice(0, 4000) },
              ],
              temperature: 0.7,
              max_tokens: 400,
            }),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            const aiResponse = data.choices?.[0]?.message?.content;
            if (aiResponse && aiResponse.trim().length > 0) {
              console.log(`✅ Success with Groq model: ${model}`);
              return NextResponse.json({ response: aiResponse, source: "groq-fallback" });
            }
          }
        } catch (err) {
          lastError = err;
        }
      }
    }
    
    // ===== STEP 3: Simple Fallback =====
    return NextResponse.json({ 
      response: "I'm here to help you learn ISL! Try asking me about specific signs, grammar, or Deaf culture." 
    });
    
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 });
  }
}