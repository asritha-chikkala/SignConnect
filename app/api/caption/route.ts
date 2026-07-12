import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioBase64, transcript: manualTranscript } = body;
    
    console.log("📹 Caption API called");
    console.log("Has audio:", !!audioBase64);
    console.log("Has transcript:", !!manualTranscript);
    
    // ===== STEP 1: Transcribe audio (if provided) =====
    let transcript: string = manualTranscript;
    
    if (audioBase64) {
      try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
          return NextResponse.json({ 
            error: "GROQ_API_KEY not configured for transcription" 
          }, { status: 400 });
        }
        
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append("file", audioBlob, "audio.wav");
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "json");
        
        console.log("🔄 Transcribing audio with Groq Whisper...");
        
        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${groqApiKey}` },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Groq Whisper error:", errorText);
          return NextResponse.json({
            error: "Transcription failed. Please try again."
          }, { status: response.status });
        }
        
        const data = await response.json();
        transcript = data.text || "";
        
        console.log("✅ Transcript received:", transcript.slice(0, 100));
        
        if (!transcript) {
          return NextResponse.json({
            error: "No speech detected in the video."
          }, { status: 400 });
        }
      } catch (error) {
        console.error("Transcription error:", error);
        return NextResponse.json({
          error: "Transcription failed. Please try again."
        }, { status: 500 });
      }
    }
    
    if (!transcript) {
      return NextResponse.json({ 
        error: "No transcript available" 
      }, { status: 400 });
    }
    
    // ===== STEP 2: Convert transcript to ISL gloss using Sarvaam AI =====
    let gloss: string[] = [];
    let source: string = "fallback";
    
    const sarvaamApiKey = process.env.SARVAAM_API_KEY;
    
    if (sarvaamApiKey) {
      try {
        console.log("🔄 Translating to ISL gloss with Sarvaam AI...");
        
        const response = await fetch("https://api.sarvaam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sarvaamApiKey}`,
          },
          body: JSON.stringify({
            model: "sarvaam-v1",
            messages: [
              {
                role: "system",
                content: `You are an Indian Sign Language (ISL) translator. Convert English text to ISL gloss (sign language notation). 
                Rules:
                - Convert each word to its ISL gloss form (uppercase)
                - For common words: hello→HELLO, help→HELP, thank you→THANK YOU
                - For unknown words, use the word in uppercase
                - Respond with ONLY the gloss words separated by spaces
                - Do not add any extra text or explanation
                Example input: "Hello how are you"
                Example output: "HELLO HOW YOU"
                Example input: "I need help"
                Example output: "I NEED HELP"`
              },
              {
                role: "user",
                content: transcript
              }
            ],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const glossText = data.choices?.[0]?.message?.content || '';
          gloss = glossText.split(/\s+/).filter((w: string) => w.length > 0);
          source = "sarvaam";
          console.log("✅ Gloss from Sarvaam AI:", gloss);
        }
      } catch (error) {
        console.log("Sarvaam AI error in caption:", error);
      }
    }
    
    // ===== STEP 3: Fallback to Groq if Sarvaam fails =====
    if (gloss.length === 0) {
      const groqApiKey = process.env.GROQ_API_KEY;
      
      if (groqApiKey) {
        try {
          console.log("🔄 Sarvaam failed, trying Groq...");
          
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
                  content: `Convert English to ISL gloss. Respond with ONLY gloss words separated by spaces. Example: "HELLO HOW YOU"`
                },
                {
                  role: "user",
                  content: transcript
                }
              ],
              temperature: 0.3,
              max_tokens: 500,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            const glossText = data.choices?.[0]?.message?.content || '';
            gloss = glossText.split(/\s+/).filter((w: string) => w.length > 0);
            source = "groq-fallback";
            console.log("✅ Gloss from Groq (fallback):", gloss);
          }
        } catch (error) {
          console.log("Groq fallback error in caption:", error);
        }
      }
    }
    
    // ===== STEP 4: Ultimate fallback =====
    if (gloss.length === 0) {
      gloss = transcript.split(/\s+/).filter((w: string) => w.length > 0).map((w: string) => w.toUpperCase());
      source = "dictionary";
      console.log("📝 Using fallback gloss:", gloss);
    }
    
    // ===== STEP 5: Create segments =====
    const words = transcript.split(/\s+/).filter((w: string) => w.length > 0);
    const segmentSize = 6;
    const segments: Array<{ start: number; end: number; text: string; gloss: string[] }> = [];
    for (let i = 0; i < words.length; i += segmentSize) {
      const chunk = words.slice(i, i + segmentSize).join(" ");
      segments.push({
        start: i * 2,
        end: (i + segmentSize) * 2,
        text: chunk,
        gloss: gloss.slice(i, i + segmentSize),
      });
    }
    
    return NextResponse.json({
      transcript,
      gloss,
      segments,
      duration: 0,
      source: source,
      success: true,
    });
    
  } catch (error) {
    console.error("Caption API error:", error);
    return NextResponse.json({ 
      error: "Internal server error. Please try again."
    }, { status: 500 });
  }
}