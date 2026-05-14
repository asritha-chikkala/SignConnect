"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionEventLike = { results: { 0: { 0: { transcript: string } } } };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
  }, []);

  const startListening = useCallback(
    (onTranscript: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      setLastError(null);
      if (!Ctor) {
        setLastError("Speech recognition is not supported in this browser.");
        return;
      }
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
      const rec = new Ctor();
      rec.lang = "en-IN";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (ev) => {
        const text = ev.results[0][0].transcript?.trim() ?? "";
        if (text) onTranscript(text);
      };
      rec.onerror = (ev) => {
        setLastError(ev.error || "speech_error");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    },
    [],
  );

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  return { listening, supported, lastError, startListening, stopListening };
}
