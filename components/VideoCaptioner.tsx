"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { 
  Upload, 
  Link2, 
  Play, 
  Pause, 
  Loader2, 
  Video, 
  Sparkles, 
  FileText,
  Clock,
  RefreshCw,
  Captions,
  AlertCircle,
  X
} from "lucide-react";
import { splitTextForSigning, formatTime, extractYouTubeId } from "@/lib/video-caption";

interface VideoCaptionerProps {
  onCaptionGenerated?: (caption: any) => void;
  className?: string;
}

export function VideoCaptioner({ onCaptionGenerated, className = "" }: VideoCaptionerProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "ready" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [gloss, setGloss] = useState<string[]>([]);
  const [captionSegments, setCaptionSegments] = useState<any[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showAvatar, setShowAvatar] = useState(true);
  const [signReplayKey, setSignReplayKey] = useState(0);
  const [fileName, setFileName] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [avatarSize, setAvatarSize] = useState<"small" | "medium" | "large">("medium");
  const [errorMessage, setErrorMessage] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Helper: Extract audio from video using Web Audio API
  const extractAudioFromVideo = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const wavBlob = audioBufferToWav(audioBuffer);
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(wavBlob);
        } catch (error) {
          reject(error);
        } finally {
          audioContext.close();
        }
      };
      
      fileReader.onerror = () => reject(new Error("Failed to read video file"));
      fileReader.readAsArrayBuffer(file);
    });
  };
  
  function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const data = buffer.getChannelData(0);
    const samples = new Int16Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      samples[i] = Math.max(-32768, Math.min(32767, data[i] * 32767));
    }
    
    const wavBytes = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(wavBytes);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    
    const dataView = new DataView(wavBytes, 44);
    for (let i = 0; i < samples.length; i++) {
      dataView.setInt16(i * 2, samples[i], true);
    }
    
    return new Blob([wavBytes], { type: 'audio/wav' });
  }
  
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  // Process video with Groq Whisper
  const processVideoWithGroq = async (file: File) => {
    setIsProcessing(true);
    setStatus("processing");
    setStatusMessage("Extracting audio from video...");
    setErrorMessage("");
    
    try {
      const audioBase64 = await extractAudioFromVideo(file);
      
      setStatusMessage("Transcribing with Groq Whisper...");
      
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64 }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Transcription failed");
      }
      
      setTranscript(data.transcript);
      setGloss(data.gloss || []);
      setCaptionSegments(data.segments || []);
      setStatus("ready");
      setStatusMessage("✅ Video processed successfully!");
      setShowAvatar(true);
      setSignReplayKey(prev => prev + 1);
      
      onCaptionGenerated?.(data);
      
    } catch (error: any) {
      console.error("Processing error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to process video. Please try again.");
      setStatusMessage("❌ Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsManualMode(false);
    
    if (file.size > 25 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage("File too large (max 25MB). Please use a smaller video or use the manual transcript option.");
      setStatusMessage("❌ File too large");
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    
    await processVideoWithGroq(file);
  };
  
  const handleManualTranscript = async () => {
    if (!manualTranscript.trim()) {
      setErrorMessage("Please enter a transcript");
      return;
    }
    
    setIsProcessing(true);
    setStatus("processing");
    setStatusMessage("Processing transcript...");
    setErrorMessage("");
    
    try {
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: manualTranscript }),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Processing failed");
      }
      
      setTranscript(data.transcript);
      setGloss(data.gloss || []);
      setCaptionSegments(data.segments || []);
      setStatus("ready");
      setStatusMessage("✅ Transcript processed successfully!");
      setShowAvatar(true);
      setSignReplayKey(prev => prev + 1);
      
      onCaptionGenerated?.(data);
      
    } catch (error: any) {
      console.error("Processing error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to process transcript");
      setStatusMessage("❌ Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUrlSubmit = async () => {
    if (!videoUrl) return;
    
    const youtubeId = extractYouTubeId(videoUrl);
    if (youtubeId) {
      setIsYouTube(true);
      setStatus("loading");
      setStatusMessage("YouTube videos require manual transcript entry. Please paste the video transcript below.");
      setIsManualMode(true);
      setStatus("idle");
      return;
    }
    
    setIsManualMode(true);
    setStatus("idle");
    setStatusMessage("Please paste the video transcript below.");
  };
  
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((currentTime / duration) * 100);
      
      const index = captionSegments.findIndex(
        seg => currentTime >= seg.start && currentTime < seg.end
      );
      if (index !== -1 && index !== currentSegmentIndex) {
        setCurrentSegmentIndex(index);
        setGloss(captionSegments[index].gloss || []);
        setSignReplayKey(prev => prev + 1);
      }
    }
  }, [captionSegments, currentSegmentIndex]);
  
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  }, []);
  
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
    setSignReplayKey(prev => prev + 1);
  };
  
  const getAvatarSizeClass = () => {
    switch (avatarSize) {
      case "small": return "w-32 h-24";
      case "large": return "w-64 h-48";
      default: return "w-48 h-36";
    }
  };
  
  const currentSegment = captionSegments[currentSegmentIndex] || null;
  
  // Helper function to copy transcript
  const copyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
    }
  };
  
  return (
    <Card className={`p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Captions className="w-5 h-5 text-cyan-400" />
            ISL Video Captioner
          </h3>
          <p className="text-sm text-white/60 mt-1">
            Upload a video with audio or paste a transcript. The avatar will sign in ISL.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">Groq Whisper</span>
          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">ISL</span>
        </div>
      </div>
      
      {/* Input Methods */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-cyan-500/50 hover:bg-cyan-500/10"
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {fileName ? `📁 ${fileName.slice(0, 30)}...` : "Upload Video with Audio"}
            </Button>
          </div>
          
          <div className="flex-[2] flex gap-2">
            <input
              type="text"
              placeholder="Paste YouTube or video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 p-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
              disabled={isProcessing}
            />
            <Button
              onClick={handleUrlSubmit}
              disabled={!videoUrl || isProcessing}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 px-4"
            >
              <Link2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Manual Transcript Input */}
        <div className="flex gap-2">
          <textarea
            placeholder="Or paste your video transcript here manually..."
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-cyan-500/50"
            rows={2}
            disabled={isProcessing}
          />
          <Button
            onClick={handleManualTranscript}
            disabled={!manualTranscript.trim() || isProcessing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 self-start"
          >
            Process Transcript
          </Button>
        </div>
      </div>
      
      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black/80 border border-white/10">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              controls={false}
            >
              Your browser does not support the video tag.
            </video>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <div className="flex-1">
                  <div className="relative h-1 bg-white/20 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                </div>
                <button
                  onClick={handleReplay}
                  className="text-white/40 hover:text-white transition p-2 rounded-full hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center bg-black/40">
            <Video className="w-16 h-16 text-white/20" />
            <p className="text-white/30 text-sm mt-3">Upload a video or paste a transcript to start</p>
            <p className="text-white/20 text-xs mt-1">MP4, WebM with audio supported</p>
          </div>
        )}
        
        {/* Avatar Overlay - LARGER SIZE */}
{showAvatar && status === "ready" && (
  <div className="absolute top-4 right-4 w-64 h-48 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl bg-black/60">
    <AvatarStage
      sentiment="neutral"
      lowBandwidth={false}
      gloss={gloss}
      signReplayKey={signReplayKey}
    />
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
      <p className="text-[10px] text-center text-cyan-300/60 font-medium">ISL Avatar</p>
    </div>
  </div>
)}
        
        {/* Current Caption */}
        {currentSegment && isPlaying && status === "ready" && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-[90%] w-full px-4">
            <div className="bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 mx-auto max-w-2xl">
              <p className="text-white text-sm text-center font-medium">
                {currentSegment.text}
              </p>
              <div className="flex gap-1 justify-center mt-1 flex-wrap">
                {currentSegment.gloss?.slice(0, 6).map((token: string, i: number) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    {token}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-white/80 text-sm">{statusMessage}</p>
            <p className="text-white/40 text-xs mt-1">This may take a moment...</p>
          </div>
        )}
        
        {/* Error Overlay */}
        {status === "error" && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-red-400 text-sm text-center">{errorMessage}</p>
            <p className="text-white/40 text-xs mt-2">Try uploading a different video or paste a manual transcript</p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      {status === "ready" && (
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Button
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10"
            onClick={() => setShowAvatar(!showAvatar)}
          >
            {showAvatar ? <X className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {showAvatar ? "Hide Avatar" : "Show Avatar"}
          </Button>
          <Button
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10"
            onClick={handleReplay}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Replay Signing
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-white/40">Avatar size:</span>
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                onClick={() => setAvatarSize(size as any)}
                className={`px-2 py-1 rounded text-xs transition ${
                  avatarSize === size
                    ? "bg-cyan-500/30 text-cyan-300"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Transcript Display */}
      {transcript && status === "ready" && (
        <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/70 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Transcript ({gloss.length} gloss tokens)</span>
            </p>
            <Button
              variant="ghost"
              className="h-6 text-xs text-white/40 hover:text-white"
              onClick={copyTranscript}
            >
              <Copy className="w-3 h-3 mr-1" /> Copy
            </Button>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{transcript}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {gloss.slice(0, 10).map((token, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                {token}
              </span>
            ))}
            {gloss.length > 10 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                +{gloss.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Powered by badge */}
      <div className="mt-4 flex justify-between items-center text-xs text-white/30 border-t border-white/5 pt-4">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Powered by Groq Whisper + ISL Avatar
        </span>
        <span className="flex items-center gap-1">
          <Captions className="w-3 h-3" />
          {status === "ready" ? "✅ Ready" : "⏳ Waiting"}
        </span>
      </div>
    </Card>
  );
}

// Copy icon component
function Copy({ className, ...props }: any) {
  return (
    <svg className={className} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );
}