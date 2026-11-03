"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Bot, 
  BookOpen, 
  LayoutDashboard, 
  BrainCircuit, 
  Flame,
  Volume2,
  CheckCircle2
} from "lucide-react";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { GlassButton } from "@/components/ui/GlassButton";
import { animeAnimations } from "@/lib/animeAnimations";

interface RetroHeroSectionProps {
  onAnalyzeText: (text: string) => void;
}

export function RetroHeroSection({ onAnalyzeText }: RetroHeroSectionProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");

  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const cardLimeRef = useRef<HTMLDivElement>(null);
  const cardGraphiteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Anime.js Hero Entrance Orchestration
    animeAnimations.heroEntrance({
      badge: heroBadgeRef.current,
      title: heroTitleRef.current,
      description: heroDescRef.current,
      cta: heroCtaRef.current,
      cards: [cardLimeRef.current!, cardGraphiteRef.current!],
    });

    // 2. Anime.js Kinetic Floating Physics on the two reference Squircle Cards
    if (cardLimeRef.current) {
      animeAnimations.floatSquircle(cardLimeRef.current, 1);
    }
    if (cardGraphiteRef.current) {
      animeAnimations.floatSquircle(cardGraphiteRef.current, -1);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyzeText(inputText.trim());
    } else {
      onAnalyzeText("interconnected dominance lingua franca globalization stumbling block");
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputText(sample);
    onAnalyzeText(sample);
  };

  return (
    <section className="relative z-10 pt-6 sm:pt-12 pb-16 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center">

        {/* 1. Release Pill Badge */}
        <div
          ref={heroBadgeRef}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#23262F]/90 border border-zinc-200 dark:border-white/10 backdrop-blur-xl mb-8 shadow-sm dark:shadow-[0_0_20px_rgba(182,255,46,0.15)] transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B6FF2E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B6FF2E]" />
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-wide font-manrope">
            Vydex AI 2.0 • Smart Vocabulary &amp; Memory Mastery
          </span>
          <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-[#B6FF2E]" />
        </div>

        {/* 2. Hero Kinetic Title */}
        <h1
          ref={heroTitleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-manrope leading-[1.05] mb-8"
        >
          <span className="block text-zinc-950 dark:text-white">
            Akademik Lug&apos;atni
          </span>
          <span className="block mt-1">
            <span className="text-[#3F7500] dark:text-[#B6FF2E] drop-shadow-sm dark:drop-shadow-[0_0_35px_rgba(182,255,46,0.35)]">
              10x Tezroq
            </span>{" "}
            <span className="text-zinc-800 dark:text-zinc-300">O&apos;rganing</span>
          </span>
        </h1>

        {/* 3. Hero Subtitle */}
        <p
          ref={heroDescRef}
          className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-inter font-normal"
        >
          Google Gemini 3.5 sun&apos;iy intellekti va 5-bosqichli ilmiy Leitner Spaced Repetition (SRS)
          algoritmi bilan barcha yangi so&apos;zlar xotirangizda umrbod muhrlanadi.
        </p>

        {/* 4. Action Buttons */}
        <div
          ref={heroCtaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                leftIcon={<LayoutDashboard className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Foydalanuvchi Kabinetiga O&apos;tish
              </GlassButton>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-auto">
                <GlassButton
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Hoziroq Boshlash (Bepul)
                </GlassButton>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <GlassButton
                  variant="graphite"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Tizimga Kirish
                </GlassButton>
              </Link>
            </>
          )}

          <a
            href="https://t.me/vydex_uzbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <GlassButton
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto border-[#229ED9]/40 hover:border-[#229ED9]"
              leftIcon={<TelegramIcon className="w-5 h-5 text-[#229ED9]" />}
            >
              Telegram Bot (@vydex_uzbot)
            </GlassButton>
          </a>
        </div>

        {/* 5. VISUAL SHOWCASE: Two Floating Squircle Cards matching user's image */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          {/* Subtle lime glow orb behind cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#B6FF2E]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Card 1: Lime Spark (#B6FF2E) Card */}
            <div
              ref={cardLimeRef}
              className="p-8 sm:p-10 rounded-[32px] bg-[#B6FF2E] text-[#15171C] text-left shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(182,255,46,0.35)] transition-transform select-none"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#15171C]/10 text-[#15171C] text-xs font-mono font-extrabold uppercase">
                  Flagship Aesthetic
                </span>
                <span className="text-xs font-mono font-bold text-[#15171C]/70">
                  HEX: #B6FF2E
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-manrope tracking-tight text-[#15171C]">
                Lime Spark
              </h2>
              <p className="text-sm font-semibold text-[#15171C]/85 mt-2 font-inter leading-relaxed">
                Yuqori energiyali kontrast, eslab qolishni 3 barobar tezlashtiruvchi vizual diqqat rangi.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono font-black text-[#15171C]">
                <CheckCircle2 className="w-4 h-4" />
                <span>SRS Xotira Mustahkamligi</span>
              </div>
            </div>

            {/* Card 2: Graphite (#23262F) Card */}
            <div
              ref={cardGraphiteRef}
              className="p-8 sm:p-10 rounded-[32px] bg-[#23262F] text-white text-left border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform select-none"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/10 text-[#B6FF2E] border border-[#B6FF2E]/30 text-xs font-mono font-bold uppercase">
                  Glass Depth
                </span>
                <span className="text-xs font-mono font-bold text-[#B6FF2E]">
                  HEX: #23262F
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-manrope tracking-tight text-[#B6FF2E]">
                Graphite
              </h2>
              <p className="text-sm font-normal text-zinc-300 mt-2 font-inter leading-relaxed">
                Zamonaviy qorong&apos;u fon arxitekturasi. Ko&apos;zni toliqtirmaydi va uzoq soatlar davomida o&apos;rganish qulayligini ta&apos;minlaydi.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#B6FF2E]" />
                <span>5-Bosqichli Leitner SRS Box</span>
              </div>
            </div>

          </div>
        </div>

        {/* 6. AI Interactive Quick Test Bar */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-3xl bg-white/95 dark:bg-[#23262F]/90 border border-zinc-300 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl focus-within:border-emerald-500 dark:focus-within:border-[#B6FF2E] transition-all"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2 sm:py-0">
              <Bot className="w-5 h-5 text-emerald-600 dark:text-[#B6FF2E] shrink-0" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Istalgan inglizcha so'z yoki matn yozing (AI ajratib beradi)..."
                className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 outline-none font-inter"
              />
            </div>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto shrink-0"
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              AI Tahlil
            </GlassButton>
          </form>

          {/* Sample quick words */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-mono text-[11px] text-zinc-500">Namunalar:</span>
            {[
              "Interconnected",
              "Stumbling block",
              "Lingua franca",
              "Kaleidoscope",
              "Leapfrog",
            ].map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleSampleClick(word)}
                className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-[#B6FF2E] hover:text-[#15171C] dark:bg-[#23262F] dark:hover:bg-[#B6FF2E] dark:hover:text-[#15171C] border border-zinc-300 dark:border-white/5 hover:border-[#B6FF2E] text-zinc-700 dark:text-zinc-300 font-semibold transition-all cursor-pointer"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
