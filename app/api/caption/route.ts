// app/api/caption/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioBase64, transcript: manualTranscript } = body;
    
    console.log("📹 Caption API called");
    console.log("Has audio:", !!audioBase64);
    console.log("Has transcript:", !!manualTranscript);
    
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      console.error("❌ GROQ_API_KEY not configured");
      return NextResponse.json({ 
        error: "GROQ_API_KEY not configured. Please add to .env.local",
        fallback: true
      }, { status: 400 });
    }
    
    // Case 1: Audio sent as base64 (from client-side extraction)
    if (audioBase64) {
      try {
        // Convert base64 to Buffer
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        
        // Create FormData for Groq Whisper API
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        formData.append("file", audioBlob, "audio.wav");
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "json");
        
        console.log("🔄 Sending to Groq Whisper...");
        
        // Call Groq Whisper API
        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Groq Whisper error:", errorText);
          return NextResponse.json({
            error: "Transcription failed. Please try again.",
            fallback: true
          }, { status: response.status });
        }
        
        const data = await response.json();
        const transcript = data.text || "";
        
        console.log("✅ Transcript received:", transcript.slice(0, 100));
        
        if (!transcript) {
          return NextResponse.json({
            error: "No speech detected in the video.",
            fallback: true
          }, { status: 400 });
        }
        
        // Convert transcript to ISL gloss using your translate API
        const glossResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        
        let gloss: string[] = [];
        if (glossResponse.ok) {
          const glossData = await glossResponse.json();
          gloss = glossData.gloss || [];
        } else {
          // Fallback: simple uppercase split
          gloss = transcript.toUpperCase().split(/\s+/).filter(Boolean);
        }
        
        // Split into segments for captioning
        const words = transcript.split(/\s+/);
        const segmentSize = 6;
        const segments = [];
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
          source: "groq-whisper",
          success: true,
        });
        
      } catch (error) {
        console.error("Groq Whisper error:", error);
        return NextResponse.json({
          error: "Transcription service unavailable. Please try again.",
          fallback: true
        }, { status: 500 });
      }
    }
    
    // Case 2: Manual transcript provided
    if (manualTranscript) {
      console.log("📝 Processing manual transcript:", manualTranscript.slice(0, 100));
      
      // Convert to ISL gloss
      const glossResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: manualTranscript }),
      });
      
      let gloss: string[] = [];
      if (glossResponse.ok) {
        const glossData = await glossResponse.json();
        gloss = glossData.gloss || [];
      } else {
        gloss = manualTranscript.toUpperCase().split(/\s+/).filter(Boolean);
      }
      
      const words = manualTranscript.split(/\s+/);
      const segmentSize = 6;
      const segments = [];
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
        transcript: manualTranscript,
        gloss,
        segments,
        duration: 0,
        source: "manual",
        success: true,
      });
    }
    
    return NextResponse.json({ 
      error: "No audio or transcript provided. Please upload a video with audio or provide a transcript." 
    }, { status: 400 });
    
  } catch (error) {
    console.error("Caption API error:", error);
    return NextResponse.json({ 
      error: "Internal server error. Please try again.",
      fallback: true
    }, { status: 500 });
  }
}