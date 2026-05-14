"use client";

import { Card } from "@/components/ui/card";

/**
 * Two-user WebRTC signing requires a signaling server (Socket.io, LiveKit, etc.).
 * `simple-peer` is listed in package.json for you to wire to your signal endpoint.
 */
export function CollabPlaceholder() {
  return (
    <Card className="mt-4 border border-white/10 p-4 text-sm text-white/70">
      <h3 className="text-base text-cyan-100">Collaborative mode (WebRTC)</h3>
      <p className="mt-2">
        Add a signaling URL (e.g. WebSocket) and exchange SDP/ICE between peers with{" "}
        <code className="rounded bg-black/40 px-1 text-cyan-200">simple-peer</code>. Each peer forwards transcript
        gloss to the other&apos;s <code className="rounded bg-black/40 px-1 text-cyan-200">AvatarStage</code>{" "}
        <code className="rounded bg-black/40 px-1 text-cyan-200">gloss</code> prop for mirrored signing.
      </p>
    </Card>
  );
}
