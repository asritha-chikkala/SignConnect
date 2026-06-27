"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, User, Trash2, Clock, Search } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistoryProps {
  history: Message[];
}

export function ChatHistory({ history }: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearHistory = () => {
    if (confirm("Clear all chat history?")) {
      localStorage.removeItem("isl_chat_history");
      window.location.reload();
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/40">No chat history yet.</p>
        <p className="text-xs text-white/20 mt-1">Start a conversation in the AI Tutor tab!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/60">
            {history.length} messages
          </span>
        </div>
        <Button
          variant="outline"
          
          onClick={clearHistory}
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 text-sm"
        />
      </div>

      {/* Messages */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredHistory.map((msg) => (
          <Card
            key={msg.id}
            className={`p-3 border-white/5 ${
              msg.role === "assistant"
                ? "bg-cyan-500/5 border-cyan-500/10"
                : "bg-purple-500/5 border-purple-500/10"
            }`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-cyan-400" />
                ) : (
                  <User className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 break-words">{msg.content}</p>
                <p className="text-[10px] text-white/20 mt-1">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}