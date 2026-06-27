// components/SignOfTheDay.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarStage } from "@/components/avatar-stage";
import { getAllSigns } from "@/lib/isl-signs";
import { X, Calendar, Sparkles, RefreshCw } from "lucide-react";

interface SignOfTheDayProps {
  className?: string;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
}

export function SignOfTheDay({ className = "", position = "bottom-right" }: SignOfTheDayProps) {
  const [sign, setSign] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [date, setDate] = useState("");
  const [signReplayKey, setSignReplayKey] = useState(0);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Get today's date in IST
  const getTodayIST = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
    return istTime.toDateString();
  };

  // Get sign of the day based on date
  const getSignOfTheDay = () => {
    const allSigns = getAllSigns();
    const today = getTodayIST();
    
    const saved = localStorage.getItem('isl_sign_of_the_day');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today && parsed.sign) {
        return parsed.sign;
      }
    }
    
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const signIndex = dayOfYear % allSigns.length;
    const newSign = allSigns[signIndex];
    
    localStorage.setItem('isl_sign_of_the_day', JSON.stringify({
      date: today,
      sign: newSign,
    }));
    
    return newSign;
  };

  useEffect(() => {
    const dailySign = getSignOfTheDay();
    setSign(dailySign);
    setDate(getTodayIST());
    setTimeout(() => {
      setSignReplayKey(prev => prev + 1);
    }, 500);
  }, []);

  // Check for day change every minute
  useEffect(() => {
    const checkDayChange = () => {
      const today = getTodayIST();
      if (date && today !== date) {
        const newSign = getSignOfTheDay();
        setSign(newSign);
        setDate(today);
        setSignReplayKey(prev => prev + 1);
      }
    };
    
    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, [date]);

  if (!sign) return null;

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-4 w-96">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-white/30 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-amber-300">🌟 Sign of the Day</span>
                <span className="text-[10px] text-white/30 ml-auto">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Sign Content */}
              <div className="flex items-center gap-4">
                <div className="text-5xl w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/20">
                  {sign.icon}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-white">{sign.text}</p>
                  <p className="text-xs text-white/40">{sign.gloss}</p>
                  <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{sign.description}</p>
                </div>
              </div>

              {/* Avatar Preview - INCREASED HEIGHT */}
              <div className="mt-3 h-40 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <AvatarStage
                  sentiment="neutral"
                  lowBandwidth={false}
                  gloss={[sign.gloss]}
                  signReplayKey={signReplayKey}
                />
              </div>

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-white/20 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Changes at midnight IST
                </span>
                <button
                  onClick={() => {
                    setSignReplayKey(prev => prev + 1);
                  }}
                  className="text-[10px] text-cyan-400/50 hover:text-cyan-400 transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          className="bg-black/80 backdrop-blur-xl rounded-full p-3 border border-cyan-500/30 shadow-lg"
        >
          <span className="text-2xl">{sign.icon}</span>
        </motion.button>
      )}
    </div>
  );
}