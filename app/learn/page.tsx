"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { Upload, FileText, Send, Sparkles, Trash2, Copy, Check, Bot, Loader2, X } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  gloss?: string[];
  timestamp: Date;
}

export default function LearnPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI tutor. Upload a PDF or ask me a question, and I'll explain concepts in sign language!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [signReplayKey, setSignReplayKey] = useState(0);
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setInput(`Please explain this document: "${file.name}"`);
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileContent("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Chat cleared! How can I help you learn today?",
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() && !fileContent) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || `Please explain "${fileName}"`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input || "Please explain this content",
          fileContent: fileContent || null,
          fileName: fileName || null
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
      
      setMessages(prev => [...prev, assistantMsg]);
      setCurrentGloss(glossData.gloss || []);
      setSignReplayKey(prev => prev + 1);
      clearFile();
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API configuration.",
        timestamp: new Date(),
      }]);
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

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
                🤟 AI Tutor with Sign Language
              </h1>
              <p className="text-white/50 text-sm">Upload any PDF/textbook and ask questions — the avatar will sign the answers in ISL</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearChat} className="border-white/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* File Upload Bar */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex gap-2 items-center flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-cyan-500/50 hover:bg-cyan-500/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF/Textbook
              </Button>
              {fileName && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
                  <FileText className="w-3 h-3" />
                  {fileName.length > 30 ? fileName.slice(0, 30) + "..." : fileName}
                  <button onClick={clearFile} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            {fileContent && (
              <p className="text-xs text-white/40 mt-2">
                ✓ {fileContent.length} characters loaded. Ask me anything about this document!
              </p>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                      : "bg-white/10 border border-white/10 text-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === "assistant" && (
                      <Bot className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => copyMessage(msg.content, msg.id)}
                        className="opacity-50 hover:opacity-100 flex-shrink-0"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  {msg.gloss && msg.gloss.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-[10px] opacity-50 mb-1">Signing:</p>
                      <div className="flex flex-wrap gap-1">
                        {msg.gloss.slice(0, 6).map((token, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
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
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span className="text-sm text-white/60">Avatar is preparing a response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 flex-shrink-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your uploaded document or any subject..."
              className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-cyan-500/50"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !fileContent)}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Avatar Sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <Card className="h-full p-4 bg-gradient-to-br from-black/40 to-black/20 border-white/10 flex flex-col">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-cyan-100">🤟 Sign Language Avatar</h3>
              <p className="text-xs text-white/40">The avatar signs the AI responses</p>
            </div>
            
            {/* Avatar */}
            <div className="h-64">
              <AvatarStage
                sentiment="neutral"
                lowBandwidth={false}
                gloss={currentGloss}
                signReplayKey={signReplayKey}
              />
            </div>

            {/* Current Sign Info */}
            {currentGloss.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-cyan-300 mb-2">Currently signing:</p>
                <div className="flex flex-wrap gap-1">
                  {currentGloss.slice(0, 6).map((token, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                      {token}
                    </span>
                  ))}
                  {currentGloss.length > 6 && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300">
                      +{currentGloss.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-auto pt-4">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  💡 Tip: Upload your textbook or notes, then ask questions. The avatar will sign the explanations!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}