// lib/video-caption.ts

export interface CaptionSegment {
  id: string;
  start: number;      // Start time in seconds
  end: number;        // End time in seconds
  text: string;       // Original text
  gloss: string[];    // ISL gloss tokens
}

export interface VideoCaption {
  segments: CaptionSegment[];
  fullTranscript: string;
  fullGloss: string[];
  duration: number;
}

// Split text into smaller chunks for signing
export function splitTextForSigning(text: string, maxWords: number = 6): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  
  return chunks;
}

// Convert text to gloss via your existing API
export async function textToGloss(text: string): Promise<string[]> {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: text }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.gloss || [];
    }
    return text.toUpperCase().split(/\s+/).filter(Boolean);
  } catch (error) {
    console.error("Gloss conversion error:", error);
    return text.toUpperCase().split(/\s+/).filter(Boolean);
  }
}

// Extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
    /(?:youtube\.com\/v\/)([^?]+)/,
    /(?:youtube\.com\/live\/)([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Format time in MM:SS
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get YouTube transcript from API
export async function getYouTubeTranscript(videoId: string): Promise<{ transcript: string; title: string }> {
  try {
    const response = await fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to get transcript");
    }
    
    return {
      transcript: data.transcript || "",
      title: data.title || "YouTube Video",
    };
  } catch (error) {
    console.error("YouTube transcript error:", error);
    return {
      transcript: "",
      title: "YouTube Video",
    };
  }
}

// Clean transcript text (remove extra spaces, timestamps, etc.)
export function cleanTranscript(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')        // Remove [timestamp] style brackets
    .replace(/\(.*?\)/g, '')        // Remove (parenthetical) comments
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single
    .replace(/\n/g, ' ')            // Replace newlines with spaces
    .trim();
}

// Split transcript into segments with timing
export function createSegmentsFromTranscript(
  transcript: string, 
  segmentDuration: number = 2.5
): CaptionSegment[] {
  const words = transcript.split(/\s+/);
  const wordsPerSegment = Math.max(4, Math.floor(segmentDuration * 2));
  const segments: CaptionSegment[] = [];
  
  for (let i = 0; i < words.length; i += wordsPerSegment) {
    const chunk = words.slice(i, i + wordsPerSegment).join(" ");
    const gloss = chunk.toUpperCase().split(/\s+/).filter(Boolean);
    segments.push({
      id: `seg-${i}`,
      start: i * 1.5,
      end: (i + wordsPerSegment) * 1.5,
      text: chunk,
      gloss: gloss,
    });
  }
  
  return segments;
}