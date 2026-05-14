"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Records the WebGL canvas stream (VP9/webm when supported). Requires user gesture to start.
 */
export function useRecordCanvas() {
  const [recording, setRecording] = useState(false);
  const [lastBlobUrl, setLastBlobUrl] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const prevUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
  }, []);

  const start = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      stop();
      chunksRef.current = [];
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        const url = URL.createObjectURL(blob);
        prevUrlRef.current = url;
        setLastBlobUrl(url);
      };
      recRef.current = rec;
      rec.start(200);
      setRecording(true);
    },
    [stop],
  );

  return { recording, start, stop, lastBlobUrl };
}
