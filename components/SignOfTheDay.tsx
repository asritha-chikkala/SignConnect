"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarStage } from "@/components/avatar-stage";
import { getAllSigns } from "@/lib/isl-signs";
import { X, Calendar, Sparkles, RefreshCw, ChevronUp } from "lucide-react";

interface SignOfTheDayProps {
  className?: string;
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
}

export function SignOfTheDay({ className = "", position = "bottom-right" }: SignOfTheDayProps) {
  const [sign, setSign] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false); // ← START CLOSED (false)
  const [date, setDate] = useState("");
  const [signReplayKey, setSignReplayKey] = useState(0);

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sign_of_the_day_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setIsOpen(parsed.isOpen || false);
      } catch (e) {}
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    localStorage.setItem("sign_of_the_day_state", JSON.stringify({ isOpen }));
  }, [isOpen]);

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
    
    const saved = localStorage.getItem("isl_sign_of_the_day");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date === today && parsed.sign) {
          return parsed.sign;
        }
      } catch (e) {}
    }
    
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const signIndex = dayOfYear % allSigns.length;
    const newSign = allSigns[signIndex];
    
    localStorage.setItem("isl_sign_of_the_day", JSON.stringify({
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

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  if (!sign) return null;

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Minimized Button - Always visible */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={handleOpen}
        className="bg-black/80 backdrop-blur-xl rounded-full py-2.5 px-4 border border-cyan-500/30 shadow-lg hover:border-cyan-500/50 transition-all duration-300 flex items-center gap-3"
        title="Open Sign of the Day"
      >
        <span className="text-2xl">{sign.icon}</span>
        <span className="text-sm text-white/60 font-medium">Sign of the Day</span>
        <ChevronUp className="w-4 h-4 text-cyan-400" />
      </motion.button>

      {/* Expanded Widget - Only shows when isOpen is true */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative mt-2"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-5 w-[420px]">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-white/30 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition"
                title="Close Sign of the Day"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-amber-300">🌟 Sign of the Day</span>
                <span className="text-xs text-white/30 ml-auto">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Sign Content */}
              <div className="flex items-center gap-5">
                <div className="text-6xl w-20 h-20 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/20">
                  {sign.icon}
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{sign.text}</p>
                  <p className="text-sm text-white/40">{sign.gloss}</p>
                  <p className="text-xs text-white/30 mt-1 line-clamp-2">{sign.description}</p>
                </div>
              </div>

              {/* Avatar Preview */}
              <div className="mt-4 h-40 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <AvatarStage
                  sentiment="neutral"
                  lowBandwidth={false}
                  gloss={[sign.gloss]}
                  signReplayKey={signReplayKey}
                />
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-white/20 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Changes at midnight IST
                </span>
                <button
                  onClick={() => {
                    setSignReplayKey(prev => prev + 1);
                  }}
                  className="text-xs text-cyan-400/50 hover:text-cyan-400 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Replay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}