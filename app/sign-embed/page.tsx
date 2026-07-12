"use client";

import { useSearchParams } from "next/navigation";
import { AvatarStage } from "@/components/avatar-stage";
import { Suspense } from "react";

function SignEmbedContent() {
  const searchParams = useSearchParams();
  const text = searchParams.get("text") || "Hello";
  const gloss = text.toUpperCase().split(/\s+/);
  
  return (
    <div className="w-full h-screen bg-[#05060a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-4">
          <p className="text-white/70 text-lg">
            Signing: <span className="text-cyan-300 font-bold">{text}</span>
          </p>
        </div>
        <div className="h-[400px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
          <AvatarStage
            sentiment="neutral"
            lowBandwidth={false}
            gloss={gloss}
            signReplayKey={0}
          />
        </div>
      </div>
    </div>
  );
}

export default function SignEmbedPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#05060a] flex items-center justify-center text-white">Loading...</div>}>
      <SignEmbedContent />
    </Suspense>
  );
}