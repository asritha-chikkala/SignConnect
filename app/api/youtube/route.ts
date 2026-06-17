// app/api/youtube/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    console.log("📺 YouTube API called for video:", videoId);
    
    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }
    
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error("❌ YOUTUBE_API_KEY not configured");
      return NextResponse.json({ 
        error: "YouTube API key not configured. Please add YOUTUBE_API_KEY to .env.local",
        fallback: true,
        transcript: "YouTube API key not configured. Please paste the transcript manually below.",
        title: "YouTube Video (API key missing)"
      }, { status: 400 });
    }
    
    // Step 1: Get video details (title, description)
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
    );
    
    const videoData = await videoResponse.json();
    
    if (!videoResponse.ok) {
      console.error("YouTube API error:", videoData);
      return NextResponse.json({ 
        error: "Failed to fetch video details",
        details: videoData.error?.message || "Unknown error",
        fallback: true
      }, { status: videoResponse.status });
    }
    
    if (!videoData.items || videoData.items.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    
    const videoInfo = videoData.items[0];
    const title = videoInfo.snippet?.title || "Untitled Video";
    const description = videoInfo.snippet?.description || "";
    
    console.log("📹 Video title:", title);
    
    // Step 2: Try to get captions (requires OAuth for actual content)
    // For hackathon, we use description as transcript
    let transcript = "";
    
    // Try to get captions list (to check if captions exist)
    try {
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
      );
      
      const captionsData = await captionsResponse.json();
      
      if (captionsResponse.ok && captionsData.items && captionsData.items.length > 0) {
        console.log("✅ Captions available for this video");
        // Note: To download actual caption content, OAuth 2.0 is required
        // For hackathon demo, use description as fallback
        transcript = description
          .split(/\n/)
          .filter((line: string) => line.trim().length > 0 && !line.includes("http") && !line.includes("www"))
          .slice(0, 20)
          .join(" ");
        
        if (!transcript || transcript.length < 50) {
          transcript = `This video is titled "${title}". Captions are available but require OAuth 2.0 to download. For this demo, please use the manual transcript feature.`;
        }
      } else {
        console.log("📝 No captions available, using description");
        // Use description as transcript
        transcript = description
          .split(/\n/)
          .filter((line: string) => line.trim().length > 0 && !line.includes("http") && !line.includes("www"))
          .slice(0, 20)
          .join(" ");
      }
    } catch (captionError) {
      console.error("Caption fetch error:", captionError);
      // Fallback to description
      transcript = description
        .split(/\n/)
        .filter((line: string) => line.trim().length > 0 && !line.includes("http") && !line.includes("www"))
        .slice(0, 20)
        .join(" ");
    }
    
    // If still no transcript, generate a sample one
    if (!transcript || transcript.length < 30) {
      transcript = `This video is titled "${title}". For full transcript support, please use the manual transcript feature below.`;
    }
    
    console.log("✅ Transcript length:", transcript.length);
    
    return NextResponse.json({
      success: true,
      videoId,
      title,
      transcript,
      transcriptSource: "description",
      length: transcript.length,
      captionAvailable: false, // Set to true when full OAuth is implemented
    });
    
  } catch (error) {
    console.error("YouTube API error:", error);
    return NextResponse.json({ 
      error: "Failed to process YouTube video",
      fallback: true,
      transcript: "Failed to fetch transcript. Please paste manually below.",
      title: "YouTube Video"
    }, { status: 500 });
  }
}