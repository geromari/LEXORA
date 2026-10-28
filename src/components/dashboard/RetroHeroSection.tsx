"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Volume2, 
  Layers, 
  BrainCircuit, 
  Bot, 
  Zap, 
  CheckCircle2, 
  BookOpen,
  LayoutDashboard
} from "lucide-react";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { playPronunciation } from "@/lib/speech";
import { useAuth } from "@/context/AuthContext";

interface RetroHeroSectionProps {
  onAnalyzeText: (text: string) => void;
}

export function RetroHeroSection({ onAnalyzeText }: RetroHeroSectionProps) {
  const { user, openAuthModal } = useAuth();
  const [inputText, setInputText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyzeText(inputText.trim());
    } else {
      onAnalyzeText("scrutinize ubiquitous unprecedented corroborate mitigate");
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputText(sample);
    onAnalyzeText(sample);
  };

  const handleAudio = async (word: string) => {
    try {
      setIsPlayingAudio(true);
      await playPronunciation(word);
    } catch {
      // ignore
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <section className="relative z-10 pt-8 sm:pt-14 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 backdrop-blur-md mb-8 animate-fade-up shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef233c]" />
          </span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-red-100/90 tracking-wide font-manrope">
            Vydex AI 2.0 • IELTS &amp; CEFR Lug&apos;at Platformasi
          </span>
          <ArrowRight className="w-3 h-3 text-[#ef233c]" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter font-manrope leading-[1.08] mb-8 animate-fade-up">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-white dark:to-white/40">
            Vocabulary Intelligence
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-white dark:to-white/40">
            for the{" "}
            <span className="text-[#ef233c] inline-block relative">
              Future
              <svg
                className="absolute w-full h-3 -bottom-2 left-0 text-[#ef233c] opacity-60"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-inter font-normal dark:font-light">
          Vydex — O&apos;zbekistonlik o&apos;quvchilar uchun sun&apos;iy intellekt (Gemini 2.5 Flash) va ilmiy Leitner Spaced Repetition (SRS) algoritmlarini birlashtirib, IELTS va C1 akademik so&apos;zlarni 10x tezroq va mustahkam yod olishga yordam beruvchi zamonaviy platforma.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm shadow-[0_0_30px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Foydalanuvchi Kabinetiga O&apos;tish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={() => openAuthModal("register")}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm shadow-[0_0_30px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Hoziroq Boshlash (Google / Telegram)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-800 dark:text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-[#ef233c]" />
                <span>To&apos;plamlarni Ko&apos;rish</span>
              </Link>
            </>
          )}

          <a
            href="https://t.me/vydex_uzbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/40 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            <span>Telegram Bot (@vydex_uzbot)</span>
          </a>
        </div>

        {/* AI Quick Extract Input Form */}
        <div className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl sm:rounded-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-[0_0_35px_rgba(239,35,60,0.12)] focus-within:border-[#ef233c] transition-all"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
              <Bot className="w-5 h-5 text-[#ef233c] shrink-0" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Istalgan inglizcha matn, IELTS essay yoki so'z yozing..."
                className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none font-inter"
              />
            </div>

            <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer shrink-0">
              <span>AI Tahlil</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Sample Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-zinc-500 font-mono">Sinab ko&apos;rish uchun:</span>
            {[
              "scrutinize ubiquitous",
              "Cambridge Reading Passage",
              "Academic Collocations",
            ].map((sample) => (
              <button
                key={sample}
                onClick={() => handleSampleClick(sample)}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Device Showcase Cards */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Card 1: Leitner Memory Box */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Spaced Repetition
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 dark:bg-[#ef233c]/20 text-[#ef233c] border border-red-200 dark:border-[#ef233c]/30">
                Box 5
              </span>
            </div>
            <div className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-1">scrutinize</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-inter mb-4">
              /ˈskruː.tɪ.naɪz/ • sinchkovlik bilan o&apos;rganmoq
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-white/10 text-xs text-zinc-500 font-mono">
              <button
                onClick={() => handleAudio("scrutinize")}
                className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-[#ef233c] transition-colors"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-[#ef233c] animate-pulse" : ""}`} />
                <span>Audio</span>
              </button>
              <span className="text-[#ef233c] font-bold">Unutish: 0%</span>
            </div>
          </div>

          {/* Card 2: AI Context Checking */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                AI Syntax Matcher
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                Band 8.0+
              </span>
            </div>
            <div className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-1">ubiquitous</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-inter mb-4">
              &ldquo;Smartphones are ubiquitous across all generations.&rdquo;
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-white/10 text-xs text-zinc-500 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kontekst to&apos;g&apos;ri
              </span>
              <span>Gemini AI</span>
            </div>
          </div>

          {/* Card 3: Telegram Bot Sync */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 hover:border-zinc-300 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-md relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Daily Notification
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-[#229ED9]/20 text-[#229ED9] border border-sky-200 dark:border-[#229ED9]/30">
                Bot Sync
              </span>
            </div>
            <div className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-1">@vydex_uzbot</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-inter mb-4">
              Har kuni 5 ta yangi IELTS so&apos;zi va interaktiv viktorina
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-white/10 text-xs text-zinc-500 font-mono">
              <span className="text-zinc-600 dark:text-zinc-400">Telegram API v2</span>
              <span className="text-[#ef233c] font-bold">Faol</span>
            </div>
          </div>
        </div>

      </div>

      {/* Integrated with Strip */}
      <div className="w-full mt-20 border-y border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-white/[0.02] backdrop-blur-sm py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase shrink-0 font-manrope">
            Texnologiyalar &amp; Standartlar:
          </p>
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 sm:gap-10 w-full text-zinc-700 dark:text-zinc-300 text-sm font-semibold font-manrope">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.8)]" />
              <span>Google Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ef233c]" />
              <span>Leitner SRS Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#229ED9]" />
              <span>Telegram Webhook Bot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cambridge IELTS Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>CEFR C1 / C2 Academic</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
