"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  RefreshCw, 
  Repeat, 
  MoveHorizontal, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const PRACTICE_SIGNS = [
  { word: "HELLO", gloss: ["HELLO"], description: "Wave your hand near your forehead" },
  { word: "THANK YOU", gloss: ["THANK"], description: "Bring hand from chin outward" },
  { word: "PLEASE", gloss: ["PLEASE"], description: "Circular motion on chest" },
  { word: "HELP", gloss: ["HELP"], description: "One hand pushing up on other palm" },
  { word: "YES", gloss: ["YES"], description: "Nodding fist motion" },
  { word: "NO", gloss: ["NO"], description: "Head shake with hand wave" },
  { word: "HOSPITAL", gloss: ["HOSPITAL"], description: "Cross on chest (red cross gesture)" },
  { word: "DOCTOR", gloss: ["DOCTOR"], description: "Tap wrist (pulse point)" },
  { word: "FAMILY", gloss: ["FAMILY"], description: "Interlocked arms or circle arms" },
  { word: "LOVE", gloss: ["LOVE"], description: "Heart shape over chest" },
];

export function ISLPracticePlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMirror, setIsMirror] = useState(false);
  const [showDescription, setShowDescription] = useState(true);

  const currentSign = PRACTICE_SIGNS[currentIndex];

  const handleReplay = useCallback(() => {
    setReplayKey(prev => prev + 1);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PRACTICE_SIGNS.length);
    setReplayKey(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + PRACTICE_SIGNS.length) % PRACTICE_SIGNS.length);
    setReplayKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        {/* Avatar Player */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="relative">
              <AvatarStage
                sentiment="neutral"
                lowBandwidth={false}
                gloss={currentSign.gloss}
                signReplayKey={replayKey}
                signingSpeed={speed}
                learningMirror={isMirror}
              />
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" onClick={handleReplay}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Replay
              </Button>
              <Button variant="outline" onClick={() => setIsMirror(!isMirror)}>
                <MoveHorizontal className="w-4 h-4 mr-2" />
                {isMirror ? "Mirror Off" : "Mirror Mode"}
              </Button>
              <Button variant="outline" onClick={() => setShowDescription(!showDescription)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {showDescription ? "Hide Tips" : "Show Tips"}
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Speed Slider */}
            <div className="mt-6">
              <label className="text-sm text-white/60 mb-2 block">Practice Speed: {speed}x</label>
              <Slider
                value={[speed]}
                onValueChange={(val) => setSpeed(val[0])}
                min={0.25}
                max={1.5}
                step={0.05}
                className="w-full"
              />
            </div>
          </div>

          {/* Sign Info */}
          <div className="w-full lg:w-80">
            <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl p-5 border border-cyan-500/20">
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🤟</div>
                <h3 className="text-2xl font-bold text-cyan-300">{currentSign.word}</h3>
                <p className="text-white/40 text-sm mt-1">
                  Sign {currentIndex + 1} of {PRACTICE_SIGNS.length}
                </p>
              </div>

              {showDescription && (
                <div className="mt-4 p-3 rounded-lg bg-black/30">
                  <p className="text-sm text-white/70">
                    <span className="text-cyan-300">How to sign:</span> {currentSign.description}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1 text-xs">
                  <Repeat className="w-3 h-3 mr-1" />
                  Loop Mode
                </Button>
                <Button variant="outline" className="flex-1 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Tips
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/40">Practice Progress</p>
        <div className="flex gap-1">
          {PRACTICE_SIGNS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-6 rounded-full transition-all ${
                idx <= currentIndex ? "bg-cyan-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}