"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, CameraOff, Loader2, Trash2, AlertCircle, Info } from "lucide-react";

export default function SignToTextPage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedSign, setDetectedSign] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [topPredictions, setTopPredictions] = useState<{ sign: string; confidence: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ sign: string; confidence: number; timestamp: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 320, height: 240 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);
      setError("Unable to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, 224, 224);
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg');
    });
    
    if (!blob) {
      setError('Failed to capture image');
      return;
    }
    
    const file = new File([blob], 'sign.jpg', { type: 'image/jpeg' });
    await detectSign(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please use an image under 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    await detectSign(file);
  };

  const detectSign = async (file: File) => {
    setIsLoading(true);
    setDetectedSign('');
    setConfidence(0);
    setTopPredictions([]);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/sign-detection', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Detection failed');
      }
      
      if (data.success && data.sign) {
        setDetectedSign(data.sign);
        setConfidence(data.confidence);
        setTopPredictions(data.top_predictions || []);
        setHistory(prev => [
          { sign: data.sign, confidence: data.confidence, timestamp: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9)
        ]);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('No sign detected. Please try again with a clearer image.');
      }
    } catch (error: any) {
      console.error('Detection error:', error);
      setError(error.message || 'Error detecting sign');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getConfidenceColor = (conf: number) => {
    if (conf > 0.85) return 'text-green-400';
    if (conf > 0.70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceBadge = (conf: number) => {
    if (conf > 0.85) return 'bg-green-500/20 text-green-300';
    if (conf > 0.70) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf > 0.85) return 'High';
    if (conf > 0.70) return 'Medium';
    return 'Low';
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
              ✋ ISL Sign-to-Text
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Powered by ML Model (99% Accuracy)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs ${isLoading ? 'bg-yellow-500/20 text-yellow-300 animate-pulse' : 'bg-green-500/20 text-green-300'}`}>
              {isLoading ? '🔄 Processing...' : '✅ ML Ready'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 p-4 border-white/10">
            <div className="relative aspect-video bg-black/60 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                style={{ display: isCameraActive ? 'block' : 'none' }}
              />
              
              {selectedImage && !isCameraActive && (
                <img src={selectedImage} alt="Selected sign" className="w-full h-full object-contain" />
              )}
              
              {!isCameraActive && !selectedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <Upload className="w-16 h-16 mb-4 opacity-50" />
                  <p>Upload an ISL sign image</p>
                  <p className="text-xs mt-2 text-white/20">Supports: A-Z, 0-9</p>
                </div>
              )}
              
              {detectedSign && !isLoading && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-3 border border-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50">Detected Sign</p>
                      <p className="text-2xl font-bold text-cyan-300">{detectedSign}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50">Confidence</p>
                      <p className={`text-lg font-bold ${getConfidenceColor(confidence)}`}>
                        {(confidence * 100).toFixed(1)}%
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceBadge(confidence)}`}>
                        {getConfidenceLabel(confidence)}
                      </span>
                      <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            confidence > 0.85 ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                            confidence > 0.70 ? 'bg-gradient-to-r from-yellow-400 to-amber-400' :
                            'bg-gradient-to-r from-red-400 to-rose-400'
                          }`}
                          style={{ width: `${(confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {topPredictions.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/40">Top alternatives:</p>
                      <div className="flex gap-2 mt-1">
                        {topPredictions.slice(1, 3).map((pred, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/60">
                            {pred.sign} ({(pred.confidence * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                  <p className="text-white/80 text-sm">Analyzing sign with ML model...</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {!isCameraActive ? (
                <>
                  <Button
                    onClick={startCamera}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500"
                    disabled={isLoading}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-cyan-500/30"
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={captureAndDetect}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    Capture & Detect
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Stop Camera
                  </Button>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {selectedImage && (
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setDetectedSign('');
                  setError(null);
                  setTopPredictions([]);
                }}
                variant="ghost"
                className="mt-2 text-xs text-white/40"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear image
              </Button>
            )}
          </Card>

          <Card className="p-4 border-white/10">
            <h3 className="text-sm font-semibold text-white/70 mb-3">Detection History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No signs detected yet</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                    <div>
                      <span className="text-sm text-white">{item.sign}</span>
                      <span className={`text-xs ml-2 ${getConfidenceColor(item.confidence)}`}>
                        {(item.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-white/20">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-6 p-4 border-white/10 bg-cyan-500/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-cyan-300 mb-2">💡 Tips for Better Detection</h3>
              <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                <li>Use clear images with good lighting</li>
                <li>Make sure the hand sign is centered and clearly visible</li>
                <li>Works with A-Z and 0-9 ISL signs</li>
                <li>Model accuracy: 99% on test data</li>
                <li>Confidence &gt; 85% = High, &gt; 70% = Medium, &lt; 70% = Low</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}