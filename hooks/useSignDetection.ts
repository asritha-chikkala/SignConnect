// hooks/useSignDetection.ts

import { useState, useRef, useCallback, useEffect } from "react";
import { type ISLSign } from "@/lib/isl-signs";

interface DetectionResult {
  detected: boolean;
  sign: ISLSign | null;
  confidence: number;
  landmarks: any[];
}

// Simulated sign detection - in production this would use a trained ML model
function detectHandInFrame(imageData: ImageData): { detected: boolean; confidence: number; signId: string | null } {
  const data = imageData.data;
  let sum = 0;
  let count = 0;
  
  // Simple skin color detection (rough approximation)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r > 60 && g > 40 && b > 30 && r > g && r > b) {
      count++;
    }
    sum += (r + g + b) / 3;
  }
  
  const avgBrightness = sum / (data.length / 40);
  const skinRatio = count / (data.length / 40);
  
  if (skinRatio > 0.08 && avgBrightness > 30) {
    const signs = ['hello', 'help', 'yes', 'no', 'thankyou', 'please', 'good', 'stop', 'love', 'come', 'go', 'eat', 'drink', 'sleep'];
    const randomSign = signs[Math.floor(Math.random() * signs.length)];
    return {
      detected: true,
      confidence: 0.6 + Math.random() * 0.35,
      signId: randomSign
    };
  }
  
  return { detected: false, confidence: 0, signId: null };
}

export function useSignDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [result, setResult] = useState<DetectionResult>({
    detected: false,
    sign: null,
    confidence: 0,
    landmarks: [],
  });
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const detectionBufferRef = useRef<{ detected: boolean; signId: string | null; confidence: number }[]>([]);
  const signsCacheRef = useRef<ISLSign[]>([]);

  // Load signs on mount
  useEffect(() => {
    const loadSigns = async () => {
      try {
        const { ISL_SIGNS } = await import('@/lib/isl-signs');
        signsCacheRef.current = Object.values(ISL_SIGNS);
      } catch (e) {
        console.log('Signs not loaded yet');
      }
    };
    loadSigns();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
        setIsDetecting(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera access.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady(false);
    setIsDetecting(false);
    setResult({
      detected: false,
      sign: null,
      confidence: 0,
      landmarks: [],
    });
    detectionBufferRef.current = [];
  }, []);

  const detectSigns = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(detectSigns);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      animationRef.current = requestAnimationFrame(detectSigns);
      return;
    }

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const detection = detectHandInFrame(imageData);
    
    detectionBufferRef.current.push({
      detected: detection.detected,
      signId: detection.signId,
      confidence: detection.confidence
    });
    
    if (detectionBufferRef.current.length > 5) {
      detectionBufferRef.current.shift();
    }
    
    const stableDetections = detectionBufferRef.current.filter(d => d.detected);
    const isStable = stableDetections.length >= 3;
    
    if (isStable && detection.signId && signsCacheRef.current.length > 0) {
      const signCounts: Record<string, number> = {};
      for (const d of stableDetections) {
        if (d.signId) {
          signCounts[d.signId] = (signCounts[d.signId] || 0) + 1;
        }
      }
      
      let mostFrequentSign = detection.signId;
      let maxCount = 0;
      for (const [signId, count] of Object.entries(signCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentSign = signId;
        }
      }
      
      const sign = signsCacheRef.current.find((s: any) => s.id === mostFrequentSign);
      
      if (sign) {
        setResult({
          detected: true,
          sign: sign,
          confidence: 0.7 + (maxCount / 5) * 0.25,
          landmarks: [],
        });
        detectionBufferRef.current = [];
      }
    } else {
      setResult({
        detected: false,
        sign: null,
        confidence: 0,
        landmarks: [],
      });
    }

    animationRef.current = requestAnimationFrame(detectSigns);
  }, []);

  useEffect(() => {
    if (isDetecting && isCameraReady) {
      detectSigns();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDetecting, isCameraReady, detectSigns]);

  return {
    videoRef,
    canvasRef,
    isDetecting,
    isCameraReady,
    result,
    error,
    startCamera,
    stopCamera,
  };
}