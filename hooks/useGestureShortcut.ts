// hooks/useGestureShortcut.ts

import { useState, useCallback, useEffect } from "react";
import { checkForShortcuts, executeShortcut, type GestureShortcut } from "@/lib/gesture-shortcuts";

interface UseGestureShortcutOptions {
  onShortcutTriggered?: (shortcut: GestureShortcut) => void;
  debounceTime?: number; // Time between triggers in ms
}

export function useGestureShortcut(options: UseGestureShortcutOptions = {}) {
  const { onShortcutTriggered, debounceTime = 3000 } = options;
  const [lastTriggered, setLastTriggered] = useState<GestureShortcut | null>(null);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  const [recentTriggers, setRecentTriggers] = useState<string[]>([]);

  const checkGloss = useCallback((gloss: string[]) => {
    if (!gloss || gloss.length === 0) return null;

    const shortcut = checkForShortcuts(gloss);
    
    if (!shortcut) {
      setLastTriggered(null);
      return null;
    }

    // Debounce
    const now = Date.now();
    if (now - lastTriggerTime < debounceTime) {
      return null;
    }

    setLastTriggerTime(now);
    setLastTriggered(shortcut);
    setRecentTriggers(prev => [shortcut.id, ...prev].slice(0, 5));
    
    // Execute the shortcut
    executeShortcut(shortcut);
    onShortcutTriggered?.(shortcut);

    return shortcut;
  }, [lastTriggerTime, debounceTime, onShortcutTriggered]);

  const reset = useCallback(() => {
    setLastTriggered(null);
  }, []);

  return {
    checkGloss,
    lastTriggered,
    recentTriggers,
    reset,
  };
}