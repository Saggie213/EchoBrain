"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Brain,
  Search,
  Clock,
  ChevronLeft,
  Send,
  Sparkles,
  FileText,
  MessageSquare,
  Lightbulb,
  ListChecks,
  BookOpen,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { getJobStatus, chatWithVideo, type JobResult, type MindMapNode } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import MindMap to avoid SSR issues with React Flow
const MindMap = dynamic(() => import("@/components/MindMap"), { ssr: false });

// ── Quick-question suggestions ──
const QUICK_QUESTIONS = [
  { icon: Lightbulb, label: "Summarize key takeaways", q: "Summarize the key takeaways from this video" },
  { icon: ListChecks, label: "List action items", q: "List the main action items or steps discussed in this video" },
  { icon: BookOpen, label: "Explain the main concept", q: "Explain the main concept of this video in simple terms" },
  { icon: Wrench, label: "Practical applications", q: "What are the practical applications discussed in this video?" },
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [status, setStatus] = useState("pending");
  const [step, setStep] = useState("");
  const [data, setData] = useState<JobResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [transcriptSearch, setTranscriptSearch] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Poll for job status
  useEffect(() => {
    let cancelled = false;
    const checkStatus = async () => {
      try {
        const json = await getJobStatus(jobId);
        if (cancelled) return;
        setStatus(json.status);
        if (json.step) setStep(json.step);
        if (json.status === "completed" && json.result) {
          setData(json.result);
          setMessages([
            { role: "assistant", text: "I've analyzed this video! 🧠 Ask me anything about the content, or click a mind map node to explore a topic." },
          ]);
        } else if (json.status === "pending" || json.status === "processing") {
          setTimeout(checkStatus, 1500);
        }
      } catch {
        if (!cancelled) setTimeout(checkStatus, 3000);
      }
    };
    checkStatus();
    return () => { cancelled = true; };
  }, [jobId]);

  // ── Chat logic ──
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !data) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setShowQuickQuestions(false);
    setIsTyping(true);

    try {
      const res = await chatWithVideo(data.metadata.video_id, text);
      setMessages((prev) => [...prev, { role: "assistant", text: res.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [data]);

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(chatInput);
  };

  const handleMindMapNodeClick = useCallback(
    (node: MindMapNode) => {
      const question = `Tell me more about "${node.label}"${node.description ? ` — ${node.description}` : ""}`;
      sendMessage(question);
    },
    [sendMessage]
  );

  // ── Transcript filtering ──
  const filteredTranscript = data?.transcript?.filter((t) => {
    if (!transcriptSearch.trim()) return true;
    return t.text.toLowerCase().includes(transcriptSearch.toLowerCase());
  }) ?? [];

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#06B6D4]/30 text-white rounded-sm px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Loading state ──
  if (status !== "completed" || !data) {
    return (
      <div className="min-h-screen bg-[#090B12] text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5046E4] rounded-full blur-[200px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-[#06B6D4] rounded-full blur-[180px] opacity-10 pointer-events-none" />

        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <Brain className="w-20 h-20 text-[#06B6D4]" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Analyzing Video</h2>
        <p className="text-slate-400 mb-2">
          {step || "Starting analysis..."}
        </p>

        {status === "failed" && (
          <div className="mt-4 text-red-400 bg-red-400/10 border border-red-400/20 px-6 py-3 rounded-xl">
            Processing failed. Please try again.
          </div>
        )}

        {/* Skeleton cards */}
        <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg w-full px-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>

        <div className="w-72 h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5046E4] to-[#06B6D4]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="h-screen bg-[#090B12] text-slate-200 flex overflow-hidden">
      {/* ══ LEFT SIDEBAR: Video Info & Chat ══ */}
      <div className="w-[420px] flex flex-col border-r border-slate-800/50 bg-[#0D1117]/60 backdrop-blur-xl z-10 shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="hover:bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white truncate text-sm">
              {data.metadata.title}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{data.metadata.channel}</span>
              {data.metadata.duration && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {data.metadata.duration}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-[#06B6D4]" />
          Ask EchoBrain
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5046E4] to-[#06B6D4] flex items-center justify-center shrink-0 mt-1">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#5046E4]/20 border border-[#5046E4]/30 text-white rounded-br-sm"
                        : "bg-slate-800/40 border border-slate-700/30 text-slate-300 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5046E4] to-[#06B6D4] flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-800/40 border border-slate-700/30 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick question chips */}
            {showQuickQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-2"
              >
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                  Suggested questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q.q)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-300 hover:bg-[#5046E4]/20 hover:border-[#5046E4]/40 hover:text-white transition-all"
                    >
                      <q.icon className="w-3.5 h-3.5 text-[#06B6D4]" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Chat input */}
        <div className="p-4 border-t border-slate-800/50">
          <form onSubmit={handleChat} className="relative">
            <Input
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about this video..."
              disabled={isTyping}
              className="bg-slate-900/60 border-slate-700/50 h-12 pr-12 rounded-xl focus-visible:ring-[#5046E4] text-sm placeholder:text-slate-600"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={isTyping || !chatInput.trim()}
              className="absolute right-1 top-1 h-10 w-10 text-[#06B6D4] hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* ══ CENTER WORKSPACE ══ */}
      <div className="flex-1 flex flex-col bg-[#090B12] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#5046E410_0%,_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#06B6D408_0%,_transparent_50%)] pointer-events-none" />

        <Tabs defaultValue="mindmap" className="flex-1 flex flex-col p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-slate-900/60 border border-slate-800/50 p-1 rounded-lg">
              <TabsTrigger
                value="mindmap"
                className="data-[state=active]:bg-[#5046E4]/20 data-[state=active]:text-white data-[state=active]:border-[#5046E4]/30 rounded-md text-sm px-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Mind Map
              </TabsTrigger>
              <TabsTrigger
                value="transcript"
                className="data-[state=active]:bg-[#5046E4]/20 data-[state=active]:text-white data-[state=active]:border-[#5046E4]/30 rounded-md text-sm px-4"
              >
                <FileText className="w-4 h-4 mr-2" />
                Transcript
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-[#06B6D4]/30 text-[#06B6D4] bg-[#06B6D4]/5 text-xs"
              >
                {data.mindmap?.nodes?.length || 0} topics extracted
              </Badge>
            </div>
          </div>

          {/* Mind Map Tab */}
          <TabsContent
            value="mindmap"
            className="flex-1 border border-slate-800/40 rounded-xl bg-[#0D1117]/40 backdrop-blur-sm overflow-hidden relative mt-0"
          >
            {data.mindmap?.nodes?.length > 0 ? (
              <MindMap data={data.mindmap} onNodeClick={handleMindMapNodeClick} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No mind map data available</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent
            value="transcript"
            className="flex-1 border border-slate-800/40 rounded-xl bg-[#0D1117]/40 backdrop-blur-sm overflow-hidden mt-0 flex flex-col"
          >
            {/* Search bar */}
            <div className="p-4 border-b border-slate-800/40 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search transcript..."
                  className="bg-slate-900/40 border-slate-700/40 pl-10 h-10 rounded-lg focus-visible:ring-[#5046E4] text-sm"
                />
                {transcriptSearch && (
                  <button
                    onClick={() => setTranscriptSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {transcriptSearch
                  ? `${filteredTranscript.length} of ${data.transcript?.length || 0}`
                  : `${data.transcript?.length || 0} segments`}
              </span>
            </div>

            {/* Transcript segments */}
            <ScrollArea className="flex-1">
              <div className="space-y-1 max-w-3xl mx-auto py-4 px-4">
                {filteredTranscript.map((t, i) => (
                  <div
                    key={i}
                    className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                    onClick={() => {
                      const timeStr = formatTime(t.start);
                      sendMessage(`What is being discussed at ${timeStr}? The transcript says: "${t.text}"`);
                    }}
                  >
                    <span className="text-[#06B6D4] text-xs font-mono mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity min-w-[40px]">
                      {formatTime(t.start)}
                    </span>
                    <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-200 transition-colors">
                      {highlightText(t.text, transcriptSearch)}
                    </p>
                  </div>
                ))}
                {filteredTranscript.length === 0 && transcriptSearch && (
                  <div className="text-center py-12 text-slate-500">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No segments match &quot;{transcriptSearch}&quot;</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
