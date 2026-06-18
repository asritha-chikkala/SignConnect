"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSignDetection } from "@/hooks/useSignDetection";
import { ISL_SIGNS, type ISLSign } from "@/lib/isl-signs";
import { 
  Camera, 
  CameraOff, 
  Loader2,
  Sparkles,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Send,
  Trash2
} from "lucide-react";

interface SignToTextProps {
  onSignDetected?: (sign: ISLSign) => void;
  onTextGenerated?: (text: string) => void;
  className?: string;
}

export function SignToText({ onSignDetected, onTextGenerated, className = "" }: SignToTextProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [detectedSign, setDetectedSign] = useState<ISLSign | null>(null);
  const [detectedText, setDetectedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState<{ sign: ISLSign; timestamp: Date }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [isDetectingMotion, setIsDetectingMotion] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready");
  const [isClear, setIsClear] = useState(false);
  const [copied, setCopied] = useState(false);
  const [textBuffer, setTextBuffer] = useState<string[]>([]);
  
  const lastDetectedRef = useRef<string>("");
  const lastDetectedTimeRef = useRef<number>(0);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    videoRef,
    canvasRef,
    isDetecting,
    isCameraReady,
    result,
    error,
    startCamera,
    stopCamera,
  } = useSignDetection();

  // Handle detection results
  useEffect(() => {
    if (!result.detected || !result.sign) {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }
      detectionTimeoutRef.current = setTimeout(() => {
        if (!isClear) {
          setDetectedSign(null);
          setDetectedText("");
          setStatusMessage("Waiting for sign...");
        }
      }, 3000);
      return;
    }

    const now = Date.now();
    const sign = result.sign;
    
    if (lastDetectedRef.current === sign.id && now - lastDetectedTimeRef.current < 2500) {
      return;
    }
    
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    
    lastDetectedRef.current = sign.id;
    lastDetectedTimeRef.current = now;
    
    setDetectedSign(sign);
    setDetectedText(sign.text);
    setConfidence(Math.round(result.confidence * 100));
    setStatusMessage(`✅ Detected: ${sign.text}`);
    setIsDetectingMotion(true);
    setIsClear(false);
    
    // Add to text buffer
    setTextBuffer(prev => [...prev, sign.text]);
    
    onSignDetected?.(sign);
    onTextGenerated?.(sign.text);
    
    setHistory(prev => [{ sign: sign, timestamp: new Date() }, ...prev].slice(0, 20));
    
    setTimeout(() => {
      setIsDetectingMotion(false);
    }, 2500);
    
  }, [result, onSignDetected, onTextGenerated]);

  const toggleDetection = async () => {
    if (isEnabled) {
      stopCamera();
      setIsEnabled(false);
      setDetectedSign(null);
      setDetectedText("");
      setStatusMessage("Stopped");
      setIsClear(true);
    } else {
      setStatusMessage("Starting camera...");
      await startCamera();
      setIsEnabled(true);
      setStatusMessage("Ready - show a sign!");
      setIsClear(false);
    }
  };

  const clearDetection = () => {
    setDetectedSign(null);
    setDetectedText("");
    setStatusMessage("Cleared");
    setIsClear(true);
    setTimeout(() => {
      setIsClear(false);
      if (!isEnabled) {
        setStatusMessage("Ready");
      } else {
        setStatusMessage("Waiting for sign...");
      }
    }, 2000);
  };

  const clearTextBuffer = () => {
    setTextBuffer([]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSignIcon = (sign: ISLSign) => {
    return sign?.icon || "🤟";
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-400";
    if (conf >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Manual sign detection for demo
  const simulateSignDetection = (sign: ISLSign) => {
    setDetectedSign(sign);
    setDetectedText(sign.text);
    setConfidence(92);
    setStatusMessage(`✅ Detected: ${sign.text}`);
    setIsDetectingMotion(true);
    setIsClear(false);
    setTextBuffer(prev => [...prev, sign.text]);
    onSignDetected?.(sign);
    onTextGenerated?.(sign.text);
    setHistory(prev => [{ sign: sign, timestamp: new Date() }, ...prev].slice(0, 20));
    setTimeout(() => setIsDetectingMotion(false), 2000);
  };

  const getFullText = () => {
    return textBuffer.join(" ");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Card */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Sign-to-Text
            </h3>
            <p className="text-sm text-white/60 mt-1">
              Show a sign to the camera. The system will detect and display it as text.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${isEnabled ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {isEnabled ? "● Live" : "● Off"}
            </span>
            <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">ISL → Text</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-4 p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isEnabled ? "bg-green-400 animate-pulse" : "bg-red-400"}`}></span>
              <span className="text-sm text-white/70">{statusMessage}</span>
            </div>
            {isDetectingMotion && (
              <span className="text-xs text-cyan-400 animate-pulse">🔄 Detecting...</span>
            )}
          </div>
        </div>

        {/* Camera Feed */}
        <div className="relative rounded-xl overflow-hidden bg-black/80 border border-white/10">
          <video
            ref={videoRef}
            className={`w-full aspect-video object-cover ${showCamera ? "block" : "hidden"}`}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!showCamera && (
            <div className="aspect-video flex flex-col items-center justify-center bg-black/60">
              <CameraOff className="w-12 h-12 text-white/30" />
              <p className="text-white/40 text-sm mt-3">Camera hidden</p>
            </div>
          )}

          {/* Detection Overlay */}
          {isEnabled && isCameraReady && detectedSign && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center p-6 bg-black/80 rounded-2xl border-2 border-cyan-500/50 shadow-2xl">
                <div className="text-6xl mb-3">{getSignIcon(detectedSign)}</div>
                <p className="text-3xl font-bold text-white">{detectedText}</p>
                <p className={`text-sm mt-2 ${getConfidenceColor(confidence)}`}>
                  Confidence: {confidence}%
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                    ISL → Text
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Camera Off State */}
          {!isEnabled && (
            <div className="aspect-video flex flex-col items-center justify-center bg-black/60">
              <Camera className="w-12 h-12 text-white/30" />
              <p className="text-white/40 text-sm mt-3">Click "Start Detection" to begin</p>
              <p className="text-white/20 text-xs mt-1">Camera access required</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isEnabled && !isCameraReady && !error && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
              <p className="text-white/60 text-sm">Initializing camera...</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={toggleDetection}
            className={isEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-cyan-500 to-purple-500"}
          >
            {isEnabled ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Detection
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Detection
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={clearDetection}
            disabled={!detectedText}
            className="border-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowCamera(!showCamera)}
            className="border-white/10"
          >
            {showCamera ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showCamera ? "Hide Camera" : "Show Camera"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="border-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {showHistory ? "Hide History" : "Show History"}
          </Button>
        </div>

        {/* Manual Sign Buttons */}
        <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-xs text-cyan-300 mb-3">💡 Click any sign to test (demo mode)</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(ISL_SIGNS).slice(0, 12).map((sign) => (
              <button
                key={sign.id}
                onClick={() => simulateSignDetection(sign)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition text-sm flex items-center gap-2"
              >
                <span>{sign.icon}</span>
                <span className="text-white/80">{sign.text}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Detected Text Display - TEXT FIELD */}
      {textBuffer.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/50">📝 Detected Text</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
               
                onClick={() => copyToClipboard(getFullText())}
                className="h-6 text-xs text-white/40 hover:text-white"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copied!" : "Copy All"}
              </Button>
              <Button
                variant="ghost"
                
                onClick={clearTextBuffer}
                className="h-6 text-xs text-red-400/40 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          
          {/* The Text Field where detected text appears */}
          <div className="w-full p-4 rounded-xl bg-black/40 border border-white/10 min-h-[60px]">
            {textBuffer.length > 0 ? (
              <p className="text-white text-lg font-medium">{getFullText()}</p>
            ) : (
              <p className="text-white/30 text-sm">No text detected yet...</p>
            )}
          </div>
          
          {detectedSign && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-white/40">Last detected:</span>
              <span className="text-xs text-cyan-300">{detectedSign.icon} {detectedSign.text}</span>
              <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                ({confidence}%)
              </span>
            </div>
          )}
        </Card>
      )}

      {/* History Panel */}
      {showHistory && (
        <Card className="p-4 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">📋 Detection History</h4>
            <Button variant="ghost"  onClick={clearHistory} className="h-6 text-xs text-white/40">
              Clear
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4">No signs detected yet</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5">
                  <span className="text-lg">{item.sign.icon}</span>
                  <span className="text-sm text-white flex-1">{item.sign.text}</span>
                  <span className="text-xs text-white/30">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Available Signs */}
      <Card className="p-4 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h4 className="text-sm font-semibold text-white mb-2">📖 Available ISL Signs</h4>
        <div className="flex flex-wrap gap-1">
          {Object.values(ISL_SIGNS).map((sign) => (
            <span key={sign.id} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 flex items-center gap-1">
              {sign.icon}
              {sign.text}
            </span>
          ))}
        </div>
        <p className="text-xs text-white/20 mt-2">
          💡 Wave your hand in front of the camera or click a sign button above
        </p>
      </Card>
    </div>
  );
}