"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, AlertTriangle, Lightbulb, Camera, CameraOff, X, Eye } from "lucide-react";

interface LowLightDetectorProps {
  onLowLightDetected?: (isLow: boolean, brightness: number) => void;
  autoBoost?: boolean;
  className?: string;
  threshold?: number; // 0-100, default 30
}

export function LowLightDetector({ 
  onLowLightDetected, 
  autoBoost = true,
  className = "",
  threshold = 30
}: LowLightDetectorProps) {
  const [isLowLight, setIsLowLight] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if camera was previously enabled
  useEffect(() => {
    const wasEnabled = sessionStorage.getItem('lowLightCameraEnabled');
    if (wasEnabled === 'true') {
      setIsCameraRequested(true);
      startCamera();
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 160, height: 120 },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsPermissionDenied(false);
        setIsInitialized(true);
        setIsCameraRequested(true);
        sessionStorage.setItem('lowLightCameraEnabled', 'true');
        analyzeBrightness();
      }
    } catch (error) {
      console.log("Camera not available for light detection");
      setIsPermissionDenied(true);
      setIsCameraActive(false);
      sessionStorage.removeItem('lowLightCameraEnabled');
    }
  };

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    sessionStorage.removeItem('lowLightCameraEnabled');
  };

  const analyzeBrightness = () => {
    if (!videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(analyzeBrightness);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      animationRef.current = requestAnimationFrame(analyzeBrightness);
      return;
    }

    canvas.width = video.videoWidth || 160;
    canvas.height = video.videoHeight || 120;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i] + data[i + 1] + data[i + 2];
    }

    const avg = sum / (data.length / 4);
    const brightnessPercent = Math.round((avg / 255) * 100);

    setBrightness(brightnessPercent);

    const isLow = brightnessPercent < threshold;
    
    if (isLow !== isLowLight) {
      setIsLowLight(isLow);
      onLowLightDetected?.(isLow, brightnessPercent);
      
      if (isLow && autoBoost && !isDismissed) {
        setShowBoost(true);
        setIsBoosted(true);
        document.documentElement.style.filter = "brightness(1.3) contrast(1.1)";
        setTimeout(() => {
          document.documentElement.style.filter = "";
          setIsBoosted(false);
          setShowBoost(false);
        }, 5000);
      }
    }

    animationRef.current = requestAnimationFrame(analyzeBrightness);
  };

  const toggleBoost = () => {
    if (isBoosted) {
      document.documentElement.style.filter = "";
      setIsBoosted(false);
      setShowBoost(false);
    } else {
      document.documentElement.style.filter = "brightness(1.4) contrast(1.15) saturate(1.1)";
      setIsBoosted(true);
      setShowBoost(true);
    }
  };

  const dismissBoost = () => {
    document.documentElement.style.filter = "";
    setIsBoosted(false);
    setShowBoost(false);
    setIsDismissed(true);
  };

  const manualBoost = () => {
    document.documentElement.style.filter = "brightness(1.4) contrast(1.15) saturate(1.1)";
    setIsBoosted(true);
    setShowBoost(true);
    setTimeout(() => {
      document.documentElement.style.filter = "";
      setIsBoosted(false);
      setShowBoost(false);
    }, 10000);
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Hidden video for analysis */}
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Controls */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-white/10 mb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-white/60">Light Sensor</span>
          </div>
          <div className="flex items-center gap-2">
            {isCameraActive ? (
              <button
                onClick={toggleCamera}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition"
              >
                <Camera className="w-3 h-3" />
                On
              </button>
            ) : isPermissionDenied ? (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <CameraOff className="w-3 h-3" />
                Blocked
              </span>
            ) : (
              <button
                onClick={toggleCamera}
                className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition"
              >
                Enable Camera
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brightness Indicator */}
      {isCameraActive && (
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 mb-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">💡 Brightness</span>
            <span className={`text-xs font-semibold ${brightness < threshold ? "text-amber-400" : "text-green-400"}`}>
              {brightness}%
            </span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-1">
            <div 
              className={`h-full rounded-full transition-all ${
                brightness < threshold ? "bg-amber-400" : "bg-green-400"
              }`}
              style={{ width: `${Math.min(brightness, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Permission Denied Message */}
      {isPermissionDenied && (
        <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-red-500/30 mb-2 max-w-xs">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/80">Camera access blocked</p>
              <p className="text-xs text-white/40 mt-0.5">Allow camera in browser settings</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Alert */}
      <AnimatePresence>
        {isLowLight && isCameraActive && !isDismissed && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-black/80 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-xl max-w-xs"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Moon className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Low Light Detected</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Brightness: {brightness}% — {brightness < 20 ? "Very dark" : "Dim"}
                </p>
                <div className="flex gap-2 mt-3">
                  {autoBoost && (
                    <button
                      onClick={toggleBoost}
                      className={`text-xs px-3 py-1 rounded-full transition ${
                        isBoosted 
                          ? "bg-amber-500/30 text-amber-300" 
                          : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      }`}
                    >
                      {isBoosted ? "Disable Boost" : "Boost Brightness"}
                    </button>
                  )}
                  <button
                    onClick={dismissBoost}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boost Active Indicator */}
      <AnimatePresence>
        {isBoosted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-2 bg-amber-500/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-amber-500/30 flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/80">Boost active!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Boost Button */}
      {isCameraActive && (
        <button
          onClick={manualBoost}
          className="mt-2 text-xs px-3 py-1 rounded-full bg-white/10 text-white/50 hover:bg-white/20 transition w-full"
        >
          🔦 Boost (10s)
        </button>
      )}
    </div>
  );
}