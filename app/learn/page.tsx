"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarStage } from "@/components/avatar-stage";
import { 
  Upload, 
  FileText, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check,
  Bot,
  History,
  Loader2,
  X
} from "lucide-react";

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
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI tutor. I can help you learn any subject. Upload a PDF, textbook, or notes, and I'll explain concepts in sign language. What would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [signReplayKey, setSignReplayKey] = useState(0);
  const [currentGloss, setCurrentGloss] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration: only show timestamps after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      
      const contextMessage = `📄 I've uploaded "${uploadedFile.name}". Please help me understand this content.`;
      setInput(contextMessage);
    };
    reader.readAsText(uploadedFile);
  };

  const clearFile = () => {
    setFile(null);
    setFileContent("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || (fileContent ? `Please explain the content of "${fileName}"` : ""),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const context = fileContent 
        ? `Context from uploaded file "${fileName}":\n${fileContent.slice(0, 3000)}\n\nUser question: ${input || "Please summarize this content"}`
        : input;

      const response = await fetch("/api/learn/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: context,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.response;

      const glossResponse = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: assistantContent.slice(0, 500) }),
      });
      
      let glossData = { gloss: [] };
      if (glossResponse.ok) {
        glossData = await glossResponse.json();
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        gloss: glossData.gloss || [],
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentGloss(glossData.gloss || []);
      setSignReplayKey(prev => prev + 1);
      
      if (fileContent) {
        clearFile();
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure the API is configured correctly and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // Format time safely (only on client)
  const formatTime = (date: Date) => {
    if (!mounted) return "";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-cyan-100" style={{ fontFamily: "var(--font-syne)" }}>
                🤟 AI Tutor with Sign Language
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Upload any PDF/textbook and ask questions — the avatar will sign the answers in ISL
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white/10"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearChat}
                className="border-white/10 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* File Upload Bar */}
          <div className="mb-4">
            <div className="flex gap-2 items-center">
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
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                      : "bg-white/10 border border-white/10 text-white"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {message.role === "assistant" && (
                      <Bot className="w-5 h-5 text-cyan-400" />
                    )}
                    <span className="text-xs opacity-70" suppressHydrationWarning>
                      {formatTime(message.timestamp)}
                    </span>
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyMessage(message.content, message.id)}
                        className="ml-auto opacity-50 hover:opacity-100"
                      >
                        {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.gloss && message.gloss.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-[10px] opacity-50 mb-1">Signing:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.gloss.slice(0, 8).map((token, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                            {token}
                          </span>
                        ))}
                        {message.gloss.length > 8 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                            +{message.gloss.length - 8}
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
                    <span className="text-sm text-white/60">Avatar is signing a response...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
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
        <div className="w-96 flex-shrink-0">
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