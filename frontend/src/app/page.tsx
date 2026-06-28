"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Brain,
  ArrowRight,
  Network,
  MessageSquare,
  FileSearch,
  Zap,
  Play,
  Search,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { processVideo } from "@/lib/api";

// ── Feature cards data ──
const FEATURES = [
  {
    icon: Network,
    title: "Visual Mind Maps",
    description:
      "AI generates interactive, explorable mind maps from video content. See the structure of knowledge at a glance.",
    gradient: "from-[#5046E4] to-[#7C3AED]",
  },
  {
    icon: MessageSquare,
    title: "AI-Powered Chat",
    description:
      "Ask questions about any part of the video and get instant, accurate answers powered by advanced LLMs.",
    gradient: "from-[#06B6D4] to-[#3B82F6]",
  },
  {
    icon: FileSearch,
    title: "Smart Transcripts",
    description:
      "Searchable, timestamped transcripts with keyword highlighting. Click any segment to dive deeper.",
    gradient: "from-[#8B5CF6] to-[#EC4899]",
  },
];

// ── How it works steps ──
const STEPS = [
  {
    num: "01",
    icon: Play,
    title: "Paste a URL",
    description: "Drop any YouTube video link into EchoBrain",
  },
  {
    num: "02",
    icon: Zap,
    title: "AI Analysis",
    description: "We extract the transcript and analyze it with AI",
  },
  {
    num: "03",
    icon: Search,
    title: "Explore & Learn",
    description: "Chat, search, and navigate your visual knowledge base",
  },
];

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");

    try {
      const data = await processVideo(url);
      if (data.job_id) {
        router.push(`/dashboard/${data.job_id}`);
      } else {
        setError("Failed to start processing");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Backend not running or error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B12] text-white font-sans overflow-hidden relative">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] bg-[#5046E4] rounded-full blur-[180px] opacity-[0.15]"
        />
        <motion.div
          animate={{ x: [0, -30, 20, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-8%] w-[40%] h-[40%] bg-[#06B6D4] rounded-full blur-[180px] opacity-[0.1]"
        />
        <motion.div
          animate={{ x: [0, 20, -15, 0], y: [0, -15, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] w-[25%] h-[25%] bg-[#8B5CF6] rounded-full blur-[160px] opacity-[0.07]"
        />
      </div>

      {/* ── Header ── */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5046E4] to-[#06B6D4] flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <span>
            EchoBrain<span className="text-[#06B6D4]">.ai</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition">
            How It Works
          </a>
        </nav>

      </header>

      {/* ── Hero ── */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/40 text-sm text-slate-300 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-[#06B6D4]" />
              AI-Powered Video Intelligence
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Your AI Second Brain
              <br />
              for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5046E4] via-[#7C3AED] to-[#06B6D4]">
                YouTube
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Turn any YouTube video into an intelligent knowledge workspace.
              <br className="hidden md:block" />
              Mind maps, searchable transcripts, and AI Q&A — all in one place.
            </p>

            {/* Input */}
            <form
              onSubmit={handleAnalyze}
              className="max-w-2xl mx-auto mt-12 relative"
            >
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#5046E4] to-[#06B6D4] rounded-2xl blur-lg opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition duration-500" />

                <div className="relative flex items-center bg-[#0F172A]/90 border border-slate-700/50 rounded-2xl backdrop-blur-xl overflow-hidden">
                  <div className="pl-5 text-slate-500">
                    <Play className="w-5 h-5" />
                  </div>
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="Paste any YouTube URL here..."
                    className="h-16 border-0 bg-transparent text-lg px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-600"
                  />
                  <div className="pr-2">
                    <Button
                      type="submit"
                      disabled={loading || !url.trim()}
                      className="h-12 px-7 bg-gradient-to-r from-[#5046E4] to-[#4338CA] hover:from-[#4338CA] hover:to-[#3730A3] text-white rounded-xl transition-all shadow-lg shadow-[#5046E4]/20 disabled:opacity-40"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="w-4 h-4" />
                          </motion.div>
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Build Brain <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-3"
                >
                  {error}
                </motion.p>
              )}
            </form>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#06B6D4]/50" />
                <span>Free to use</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#5046E4]/50" />
                <span>Powered by AI</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#8B5CF6]/50" />
                <span>Instant insights</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Features Section ── */}
        <section id="features" className="container mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5046E4] to-[#06B6D4]">
                learn faster
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Extract, explore, and interact with video knowledge like never
              before.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative"
              >
                {/* Card glow */}
                <div className="absolute -inset-px bg-gradient-to-b from-slate-700/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative bg-[#0F172A]/60 border border-slate-800/60 rounded-2xl p-7 backdrop-blur-sm hover:border-slate-700/80 transition-all h-full">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section
          id="how-it-works"
          className="container mx-auto px-6 pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-slate-400 text-lg">
              Three simple steps to unlock video knowledge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-700 to-transparent" />
                )}

                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-5 relative">
                  <step.icon className="w-7 h-7 text-[#06B6D4]" />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[#5046E4] text-white w-5 h-5 rounded-full flex items-center justify-center">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section className="container mx-auto px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-[#5046E4]/20 to-[#06B6D4]/20 rounded-3xl blur-xl" />
            <div className="relative bg-[#0F172A]/80 border border-slate-800/60 rounded-3xl px-12 py-14 text-center backdrop-blur-sm">
              <Brain className="w-10 h-10 text-[#06B6D4] mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Ready to build your second brain?
              </h3>
              <p className="text-slate-400 mb-8">
                Paste a YouTube URL above and start exploring in seconds.
              </p>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-gradient-to-r from-[#5046E4] to-[#4338CA] hover:from-[#4338CA] hover:to-[#3730A3] text-white px-8 py-3 rounded-xl shadow-lg shadow-[#5046E4]/20"
              >
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-slate-800/50 py-8">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#5046E4] to-[#06B6D4] flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span>EchoBrain.ai</span>
            </div>
            <p className="text-xs text-slate-600">
              Built with ❤️ using Next.js, FastAPI, and Groq AI
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
