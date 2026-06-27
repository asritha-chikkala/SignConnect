"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { Send, Bot, Loader2, Copy, Check } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  gloss?: string[];
  timestamp: Date;
}

interface ChatProps {
  onChatUpdate?: () => void;
}

const SUGGESTED_QUESTIONS = [
  { icon: "👋", text: "How do I sign 'Thank you'?" },
  { icon: "📚", text: "Explain ISL grammar" },
  { icon: "🇮🇳", text: "Tell me about Deaf culture in India" },
  { icon: "💬", text: "How do I ask for help in ISL?" },
  { icon: "🤔", text: "What are common ISL mistakes?" },
  { icon: "📝", text: "Show me emergency phrases" },
];

export function Chat({ onChatUpdate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your ISL AI Tutor. Ask me anything about Indian Sign Language, grammar, culture, or how to sign specific words!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);
  const [signReplayKey, setSignReplayKey] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Load saved chat history - only on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const saved = localStorage.getItem("isl_chat_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error("Failed to load chat history");
        }
      }
    }
  }, []);

  // Save chat history - only when messages change and not on initial mount
  useEffect(() => {
    if (!isInitialMount.current && messages.length > 1) {
      localStorage.setItem("isl_chat_history", JSON.stringify(messages));
      if (onChatUpdate) {
        onChatUpdate();
      }
    }
  }, [messages, onChatUpdate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: "You are an ISL tutor. Provide educational, accurate, and helpful responses about Indian Sign Language, Deaf culture, and ISL grammar. Keep responses concise and informative.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");

      const assistantContent = data.response;

      const glossRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: assistantContent.slice(0, 500) }),
      });

      let glossData = { gloss: [] };
      if (glossRes.ok) glossData = await glossRes.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        gloss: glossData.gloss || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentGloss(glossData.gloss || []);
      setSignReplayKey((prev) => prev + 1);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Chat cleared! How can I help you learn ISL today?",
          timestamp: new Date(),
        },
      ]);
      localStorage.removeItem("isl_chat_history");
      if (onChatUpdate) {
        onChatUpdate();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggested Questions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q.text}
            onClick={() => sendMessage(q.text)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition text-left text-sm text-white/70"
          >
            <span className="mr-2">{q.icon}</span>
            {q.text}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                  : "bg-white/10 border border-white/10 text-white"
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.role === "assistant" && (
                  <Bot className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.content, msg.id)}
                    className="opacity-50 hover:opacity-100 flex-shrink-0"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
              {msg.gloss && msg.gloss.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-[10px] opacity-50 mb-1">Signing:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.gloss.slice(0, 6).map((token, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/20"
                      >
                        {token}
                      </span>
                    ))}
                    {msg.gloss.length > 6 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                        +{msg.gloss.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-white/60">Avatar is preparing a response...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Avatar for current signing */}
      {currentGloss.length > 0 && (
        <div className="h-28 rounded-xl overflow-hidden bg-black/40 border border-white/10">
          <AvatarStage
            sentiment="neutral"
            lowBandwidth={false}
            gloss={currentGloss}
            signReplayKey={signReplayKey}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2 pt-4 border-t border-white/10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything about ISL..."
          className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-cyan-500/50"
          rows={2}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6"
        >
          <Send className="w-4 h-4 mr-2" />
          Send
        </Button>
      </div>

      {/* Clear Chat */}
      <button
        onClick={clearChat}
        className="text-xs text-white/30 hover:text-white/50 transition"
      >
        Clear chat history
      </button>
    </div>
  );
}