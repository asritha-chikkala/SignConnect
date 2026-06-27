"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/learn/Chat";
import { Flashcards } from "@/components/learn/Flashcards";
import { Quiz } from "@/components/learn/Quiz";
import { ChatHistory } from "@/components/learn/ChatHistory";
import { MessageCircle, Layers, Trophy, History } from "lucide-react";

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "quiz" | "history">("chat");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load chat history - only on mount and when refreshKey changes
  useEffect(() => {
    const saved = localStorage.getItem("isl_chat_history");
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, [refreshKey]);

  const refreshHistory = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
              🤟 Learn ISL
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Chat with AI tutor, learn with flashcards, or test your knowledge!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300">AI Tutor</span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">ISL</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === "chat"
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/30"
                : "text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            AI Tutor
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === "flashcards"
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/30"
                : "text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20"
            }`}
          >
            <Layers className="w-4 h-4" />
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/30"
                : "text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Quiz
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
              activeTab === "history"
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-500/30"
                : "text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20"
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>

        {/* Content */}
        <Card className="p-6 border-white/10">
          {activeTab === "chat" && <Chat onChatUpdate={refreshHistory} />}
          {activeTab === "flashcards" && <Flashcards />}
          {activeTab === "quiz" && <Quiz />}
          {activeTab === "history" && <ChatHistory history={chatHistory} />}
        </Card>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
            <p className="text-2xl font-bold text-cyan-300">82+</p>
            <p className="text-xs text-white/40">ISL Signs</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
            <p className="text-2xl font-bold text-purple-300">10+</p>
            <p className="text-xs text-white/40">Grammar Rules</p>
          </div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
            <p className="text-2xl font-bold text-green-300">5</p>
            <p className="text-xs text-white/40">Cultural Topics</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-2xl font-bold text-amber-300">📚</p>
            <p className="text-xs text-white/40">Learn at your pace</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}