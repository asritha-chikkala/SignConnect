"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { Upload, FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";

export function FileUploadSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [summaryGloss, setSummaryGloss] = useState<string[]>([]);
  const [replayKey, setReplayKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(uploadedFile);
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      // Call Grok API to summarize
      const response = await fetch("/api/learn/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3000) }), // Limit length
      });
      
      const data = await response.json();
      setSummary(data.summary);
      
      // Convert summary to gloss for avatar signing
      const glossResponse = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: data.summary }),
      });
      const glossData = await glossResponse.json();
      setSummaryGloss(glossData.gloss);
      setReplayKey(prev => prev + 1);
    } catch (error) {
      console.error("Summarization failed:", error);
      setSummary("Failed to summarize. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">📄 Upload & Summarize</h3>
        <p className="text-sm text-white/40 mb-4">
          Upload a text file, PDF, or paste text. The AI will summarize it and our avatar will sign the summary in ISL.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Input Area */}
          <div>
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-500/50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-white/40 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Click to upload or drag and drop</p>
              <p className="text-white/30 text-xs mt-1">TXT, PDF up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            {file && (
              <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <FileText className="w-4 h-4 text-cyan-400 inline mr-2" />
                <span className="text-sm text-white/60">{file.name}</span>
              </div>
            )}
            <textarea
              className="w-full h-40 mt-4 p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 resize-none"
              placeholder="Or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Right - Summary Output */}
          <div>
            <div className="bg-black/40 rounded-xl p-4 min-h-[200px] border border-white/10">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="ml-2 text-white/60">Summarizing...</span>
                </div>
              ) : summary ? (
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-sm text-cyan-300 font-medium">Summary</p>
                    <Button variant="ghost"  onClick={handleCopy} className="h-8">
                      {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{summary}</p>
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center">
                  Your summary will appear here...
                </p>
              )}
            </div>
            <Button
              onClick={handleSummarize}
              disabled={!text.trim() || isLoading}
              className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Summarize & Sign
            </Button>
          </div>
        </div>
      </Card>

      {/* Avatar Signs Summary */}
      {summaryGloss.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">🤟 Avatar Signing Summary</h3>
          <div className="h-[300px]">
            <AvatarStage
              sentiment="neutral"
              lowBandwidth={false}
              gloss={summaryGloss}
              signReplayKey={replayKey}
              signingSpeed={0.8}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {summaryGloss.map((token, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">
                {token}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}