"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GESTURE_SHORTCUTS, 
  executeShortcut, 
  checkForShortcuts,
  type GestureShortcut 
} from "@/lib/gesture-shortcuts";
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Copy, 
  Share2, 
  X,
  Sparkles,
  Bell,
  Check,
  AlertCircle
} from "lucide-react";

interface GestureShortcutProps {
  currentGloss?: string[];
  onShortcutTriggered?: (shortcut: GestureShortcut) => void;
  className?: string;
}

// Toast component for notifications
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
        <Check className="w-5 h-5 text-cyan-400" />
        <span className="text-white text-sm">{message}</span>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function GestureShortcut({ 
  currentGloss = [], 
  onShortcutTriggered,
  className = ""
}: GestureShortcutProps) {
  const [triggeredShortcut, setTriggeredShortcut] = useState<GestureShortcut | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingShortcut, setPendingShortcut] = useState<GestureShortcut | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentTriggers, setRecentTriggers] = useState<string[]>([]);
  const lastTriggerTime = useRef<number>(0);

  // Listen for toast events from helper functions
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setToastMessage(e.detail.message);
    };
    
    document.addEventListener("gesture-shortcut-toast", handler as EventListener);
    return () => {
      document.removeEventListener("gesture-shortcut-toast", handler as EventListener);
    };
  }, []);

  // Check for shortcuts when gloss changes
  useEffect(() => {
    if (!currentGloss || currentGloss.length === 0) return;

    const shortcut = checkForShortcuts(currentGloss);
    
    if (!shortcut) {
      setTriggeredShortcut(null);
      return;
    }

    // Prevent spam - wait 3 seconds between triggers
    const now = Date.now();
    if (now - lastTriggerTime.current < 3000) {
      return;
    }
    
    lastTriggerTime.current = now;

    // Check if it requires confirmation
    if (shortcut.requiresConfirmation) {
      setPendingShortcut(shortcut);
      setShowConfirmation(true);
    } else {
      executeAndTrigger(shortcut);
    }
  }, [currentGloss]);

  const executeAndTrigger = (shortcut: GestureShortcut) => {
    setTriggeredShortcut(shortcut);
    executeShortcut(shortcut);
    onShortcutTriggered?.(shortcut);
    
    // Add to recent triggers
    setRecentTriggers(prev => [shortcut.id, ...prev].slice(0, 5));

    // Auto-clear after 4 seconds
    setTimeout(() => {
      setTriggeredShortcut(null);
    }, 4000);
  };

  const handleConfirm = () => {
    if (pendingShortcut) {
      executeAndTrigger(pendingShortcut);
      setShowConfirmation(false);
      setPendingShortcut(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingShortcut(null);
    setTriggeredShortcut(null);
  };

  // Get icon for shortcut
  const getIcon = (shortcut: GestureShortcut) => {
    switch (shortcut.action) {
      case "open_map": return <MapPin className="w-5 h-5" />;
      case "show_alert": return <AlertTriangle className="w-5 h-5" />;
      case "copy_text": return <Copy className="w-5 h-5" />;
      case "open_url": return <Share2 className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (shortcut: GestureShortcut) => {
    if (shortcut.id.includes("emergency") || shortcut.id.includes("sos")) {
      return "from-red-500 to-rose-600";
    }
    if (shortcut.id.includes("hospital") || shortcut.id.includes("police")) {
      return "from-amber-500 to-orange-600";
    }
    return "from-cyan-500 to-purple-600";
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmation && pendingShortcut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <div 
              className="bg-[#0a0f1f] border border-cyan-300/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`text-5xl mb-4 bg-gradient-to-br ${getColor(pendingShortcut)} bg-clip-text text-transparent`}>
                  {pendingShortcut.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Execute Shortcut?</h3>
                <p className="text-white/60 text-sm mb-2">
                  <span className="text-cyan-300 font-medium">{pendingShortcut.sign}</span>
                </p>
                <p className="text-white/40 text-sm mb-6">{pendingShortcut.description}</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${getColor(pendingShortcut)} text-white font-semibold transition hover:scale-[1.02]`}
                  >
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcut Triggered Alert */}
      <AnimatePresence>
        {triggeredShortcut && !showConfirmation && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-4 z-50 max-w-sm w-full"
          >
            <div className={`bg-gradient-to-r ${getColor(triggeredShortcut)} rounded-2xl p-5 shadow-2xl border border-white/10`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{triggeredShortcut.icon}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">Gesture Shortcut Triggered!</h4>
                  <p className="text-white/90 text-sm mt-1">{triggeredShortcut.label}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {triggeredShortcut.sign}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {triggeredShortcut.action.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setTriggeredShortcut(null)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </AnimatePresence>

      {/* Small indicator - shows recent shortcuts */}
      <div className={`fixed bottom-24 left-4 z-40 ${className}`}>
        <div className="flex flex-col gap-1">
          {recentTriggers.length > 0 && (
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Recent Actions</p>
              <div className="flex gap-1">
                {recentTriggers.slice(0, 3).map((id) => {
                  const shortcut = GESTURE_SHORTCUTS.find(s => s.id === id);
                  return shortcut ? (
                    <span key={id} className="text-xs" title={shortcut.label}>
                      {shortcut.icon}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {/* Available shortcuts count */}
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 text-center">
            <span className="text-[10px] text-white/40">
              ⚡ {GESTURE_SHORTCUTS.length} shortcuts
            </span>
          </div>
        </div>
      </div>
    </>
  );
}