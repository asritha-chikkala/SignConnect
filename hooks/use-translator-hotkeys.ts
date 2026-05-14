"use client";

import { useEffect } from "react";

type Handlers = {
  onSubmit?: () => void;
  onClear?: () => void;
  onTogglePlay?: () => void;
};

/**
 * Space: optional toggle play (if provided). Escape: clear. Ctrl+Enter: submit translation.
 */
export function useTranslatorHotkeys({ onSubmit, onClear, onTogglePlay }: Handlers, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" && onClear) {
        e.preventDefault();
        onClear();
        return;
      }
      if (e.code === "Space" && onTogglePlay && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        onTogglePlay();
        return;
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, onSubmit, onClear, onTogglePlay]);
}
