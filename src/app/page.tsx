"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Bot, 
  BrainCircuit, 
  Zap, 
  Layers, 
  Flame, 
  CheckCircle2,
  HelpCircle,
  Volume2,
  LayoutDashboard,
  Award,
  Users,
  Compass,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { RetroHeroSection } from "@/components/dashboard/RetroHeroSection";
import { AISmartImportModal } from "@/components/dashboard/AISmartImportModal";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { animeAnimations } from "@/lib/animeAnimations";

export default function LandingPage() {
  const { user } = useAuth();
  const [isAIImportModalOpen, setIsAIImportModalOpen] = useState(false);
  const [importInitialText, setImportInitialText] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stagger feature cards on landing page
    if (featuresRef.current) {
      animeAnimations.staggerCards(".landing-bento-card, .methodology-card");
    }
  }, []);

  const handleHeroAnalyze = (text: string) => {
    setImportInitialText(text);
    setIsAIImportModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION (Anime.js Choreographed with Lime Spark & Graphite) */}
      <RetroHeroSection onAnalyzeText={handleHeroAnalyze} />

      {/* Main Landing Sections */}
      <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-28">

        {/* 2. ABOUT THE PROJECT SECTION */}
        <section id="about" className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B6FF2E]/15 border border-emerald-500/20 dark:border-[#B6FF2E]/30 text-emerald-800 dark:text-[#B6FF2E] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm dark:shadow-[0_0_15px_rgba(182,255,46,0.15)]">
              <Compass className="w-3.5 h-3.5" />
              <span>Ilmiy Metodika</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight leading-tight">
              Nega an&apos;anaviy yodlash usullari <br />
              <span className="text-emerald-600 dark:text-[#B6FF2E]">ish bermaydi?</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter mt-4 leading-relaxed">
              Nemis psixologi German Ebbinghaus aniqlaganidek, inson yangi o&apos;rgangan so&apos;zlarining <strong>80% qismini 48 soat ichida unutib yuboradi</strong>. Daftar tutish yoki quruq ro&apos;yxat yodlash — vaqtni behuda sarflashdir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <GlassCard className="methodology-card p-8 rounded-[30px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 flex flex-col justify-between hover:border-emerald-500 dark:hover:border-[#B6FF2E]/50 shadow-md dark:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 flex items-center justify-center text-emerald-800 dark:text-[#B6FF2E] mb-6">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-3">
                  Spaced Repetition (SRS)
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  5 bosqichli Leitner xotira qutisi yordamida so&apos;zlar aniq esingizdan chiqayotgan paytda takrorlanadi. Natijada so&apos;zlar qisqa muddatli xotiradan uzoq muddatli xotiraga 100% o&apos;tadi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-[#B6FF2E] font-bold">
                <span>Leitner Algorithm</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </GlassCard>

            {/* Pillar 2 */}
            <GlassCard className="methodology-card p-8 rounded-[30px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 flex flex-col justify-between hover:border-emerald-500 dark:hover:border-[#B6FF2E]/50 shadow-md dark:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 flex items-center justify-center text-emerald-800 dark:text-[#B6FF2E] mb-6">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-3">
                  Google Gemini 3.5 AI
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  Istalgan inglizcha maqola, rasm yoki matn parchasini tashlang. AI undagi eng boy va kuchli so&apos;zlarni ajratib, o&apos;zbekcha aniq kontekstual tarjimasi, sinonimlari va darajasi bilan takrorlash to&apos;plamiga aylantiradi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-[#B6FF2E] font-bold">
                <span>Text-to-Deck AI Generator</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </GlassCard>

            {/* Pillar 3 */}
            <GlassCard className="methodology-card p-8 rounded-[30px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 flex flex-col justify-between hover:border-[#229ED9]/50 shadow-md dark:shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-3">
                  Telegram Bot Ekosistemasi
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  Har kuni Telegram orqali 5 ta yangi so&apos;z o&apos;rganing, viktorinalar yeching va xotirangizni faol saqlang. Web platforma va Telegram bot real-vaqtda sinxronlashadi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-[#229ED9] font-bold">
                <span>24/7 Mobile Sync (@vydex_uzbot)</span>
                <TelegramIcon className="w-4 h-4" />
              </div>
            </GlassCard>
          </div>
        </section>

        {/* 3. HOW IT WORKS (3 Simple Steps) */}
        <section id="methodology" className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight mb-4">
              Vydex qanday ishlaydi?
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Kuniga atigi 10 daqiqa sarflab, 3 oyda 1500+ C1 so&apos;zni mustahkam o&apos;zlashtiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <GlassCard className="p-8 rounded-[32px] bg-white/95 dark:bg-[#23262F]/75 border-zinc-200 dark:border-white/10 relative shadow-md dark:shadow-xl">
              <span className="text-5xl font-black font-manrope text-emerald-600/30 dark:text-[#B6FF2E]/30 mb-4 block">01</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                Lug&apos;at to&apos;plamini tanlang
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Tayyor Super Vocab Mastery, High-Impact Collocations, English as a Global Language to&apos;plamlaridan foydalaning yoki matningizni AI orqali takrorlash to&apos;plamiga aylantiring.
              </p>
            </GlassCard>

            {/* Step 2 */}
            <GlassCard className="p-8 rounded-[32px] bg-white/95 dark:bg-[#23262F]/75 border-zinc-200 dark:border-white/10 relative shadow-md dark:shadow-xl">
              <span className="text-5xl font-black font-manrope text-emerald-600/30 dark:text-[#B6FF2E]/30 mb-4 block">02</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                4 xil rejimda mashq qiling
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Interaktiv Fleshkardlar, 4 variantli Viktorina (Quiz), Yozma Diktant (Typing) va AI yordamida jumla tuzib kontekstni mustahkamlang.
              </p>
            </GlassCard>

            {/* Step 3 */}
            <GlassCard className="p-8 rounded-[32px] bg-white/95 dark:bg-[#23262F]/75 border-zinc-200 dark:border-white/10 relative shadow-md dark:shadow-xl">
              <span className="text-5xl font-black font-manrope text-emerald-600/30 dark:text-[#B6FF2E]/30 mb-4 block">03</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                SRS takrorlash bilan muhrlang
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Tizim unutish xavfi tug&apos;ilgan so&apos;zlarni o&apos;zi oldingizga olib chiqadi. Siz faqat eslaysiz va baholaysiz.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* 4. FEATURES BENTO GRID */}
        <section id="features" className="scroll-mt-32">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight font-manrope mb-4">
              Muntazam Lug&apos;at Takrorlash Uchun <br />
              <span className="text-emerald-600 dark:text-[#B6FF2E]">Intensiv Xotira Tizimi</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Har bir xususiyat til o&apos;rganuvchilarning amaliy ehtiyojlaridan kelib chiqib loyihalangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <GlassCard className="landing-bento-card lg:col-span-2 p-8 rounded-[32px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between hover:border-emerald-500 dark:hover:border-[#B6FF2E]/50 shadow-md dark:shadow-xl">
              <div>
                <div className="mb-5 inline-flex p-3 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 text-emerald-800 dark:text-[#B6FF2E]">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 dark:text-white font-manrope mb-3 tracking-tight">
                  Generative AI Text-to-Deck
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Istalgan inglizcha maqola yoki matn qismini yuklang. Google Gemini AI undagi eng sara va kuchli so&apos;zlarni, o&apos;zbekcha aniq tarjimasi, sinonimlari va jonli misol jumlalari bilan ajratib beradi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#B6FF2E]">GEMINI 3.5 MULTIMODAL</span>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#B6FF2E]" />
              </div>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard className="landing-bento-card lg:col-span-2 p-8 rounded-[32px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between hover:border-emerald-500 dark:hover:border-[#B6FF2E]/50 shadow-md dark:shadow-xl">
              <div>
                <div className="mb-5 inline-flex p-3 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 text-emerald-800 dark:text-[#B6FF2E]">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 dark:text-white font-manrope mb-3 tracking-tight">
                  Spaced Repetition (SRS Engine)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Ebbinghaus unutish egri chizig&apos;i asosidagi 5 bosqichli Leitner tizimi. Oson so&apos;zlar kamroq, qiyin so&apos;zlar tez-tez takrorlanib, 100% uzoq muddatli xotiraga aylanadi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#B6FF2E]">LEITNER 5-BOX ENGINE</span>
                <Clock className="w-4 h-4 text-emerald-600 dark:text-[#B6FF2E]" />
              </div>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard className="landing-bento-card p-6 sm:p-8 rounded-[28px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 shadow-md dark:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white font-manrope mb-2">Telegram Bot</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Platformaga kirmasdan ham har kuni Telegram orqali 5 ta yangi so&apos;z va testlar yeching.
              </p>
            </GlassCard>

            {/* Feature 4 */}
            <GlassCard className="landing-bento-card p-6 sm:p-8 rounded-[28px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 shadow-md dark:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white font-manrope mb-2">Kontekst Tekshiruvi</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Yodlagan so&apos;zingiz bilan jumla tuzing — AI grammatika va kollokatsiyani darhol baholaydi.
              </p>
            </GlassCard>

            {/* Feature 5 */}
            <GlassCard className="landing-bento-card p-6 sm:p-8 rounded-[28px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 shadow-md dark:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 text-emerald-800 dark:text-[#B6FF2E]">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white font-manrope mb-2">Ovozli Talaffuz</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Har bir akademik so&apos;zning tabiiy britancha va amerika talaffuzini tinglang.
              </p>
            </GlassCard>

            {/* Feature 6 */}
            <GlassCard className="landing-bento-card p-6 sm:p-8 rounded-[28px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 shadow-md dark:shadow-xl">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 text-emerald-800 dark:text-[#B6FF2E]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 dark:text-white font-manrope mb-2">10 Ta Flagman Kurs</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Cambridge 2000, Invest in the Young, English Global, Luck vs Grit kabi 2,500+ ta akademik so&apos;z.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* 5. FEATURED DECKS SHOWCASE */}
        <section id="decks" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] text-xs font-mono font-bold uppercase mb-3 border border-emerald-500/20 dark:border-[#B6FF2E]/30">
                <BookOpen className="w-3.5 h-3.5" />
                <span>To&apos;plamlar Arxivi</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight">
                Eng Ommabop Akademik To&apos;plamlar
              </h2>
            </div>

            <Link href="/dashboard">
              <GlassButton variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Barcha To&apos;plamlar (Dashboard)
              </GlassButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Deck 1: Invest in the Young */}
            <GlassCard interactive className="p-7 rounded-[30px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-md dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 text-xs font-mono font-extrabold">
                    B2–C2
                  </span>
                  <span className="text-xs font-mono text-emerald-700 dark:text-[#B6FF2E] font-bold">YANGI</span>
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                  Invest in the Young
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-inter">
                  Yoshlar salohiyati, maktab sport va san&apos;at ta&apos;limi mavzusidagi 63 ta muhim B2–C2 leksikasi.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">63 ta karta</span>
                <Link href="/dashboard" className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold">
                  O&apos;rganish &rarr;
                </Link>
              </div>
            </GlassCard>

            {/* Deck 2: English as a Global Language */}
            <GlassCard interactive className="p-7 rounded-[30px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-md dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 text-xs font-mono font-extrabold">
                    B2–C2
                  </span>
                  <span className="text-xs font-mono text-zinc-500">72 ta karta</span>
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                  English as a Global Language
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-inter">
                  Globallashuv, til siyosati va xalqaro aloqa mavzusidagi 72 ta eng muhim B2–C2 leksikasi.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">72 ta karta</span>
                <Link href="/dashboard" className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold">
                  O&apos;rganish &rarr;
                </Link>
              </div>
            </GlassCard>

            {/* Deck 3: Luck vs Grit */}
            <GlassCard interactive className="p-7 rounded-[30px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-md dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 text-xs font-mono font-extrabold">
                    B2–C2
                  </span>
                  <span className="text-xs font-mono text-zinc-500">69 ta karta</span>
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                  Luck vs Grit
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-inter">
                  Omad va matonat mavzusidagi 69 ta muhim B2, C1 va C2 darajadagi leksika va metaforalar.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">69 ta karta</span>
                <Link href="/dashboard" className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold">
                  O&apos;rganish &rarr;
                </Link>
              </div>
            </GlassCard>

            {/* Deck 4: Cambridge Essential Top 2000 */}
            <GlassCard interactive className="p-7 rounded-[30px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between shadow-md dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 text-xs font-mono font-extrabold">
                    Super Vocab
                  </span>
                  <span className="text-xs font-mono text-emerald-700 dark:text-[#B6FF2E] font-bold">ENG KATTA</span>
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white mb-2">
                  Cambridge Top 2000: Oltin Leksika
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-inter">
                  60 ta nufuzli ilmiy va publitsistik matndan saralangan 2,000 ta oltin so&apos;z va iboralar.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-700 dark:text-zinc-300 font-bold">2,000 ta karta</span>
                <Link href="/dashboard" className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold">
                  O&apos;rganish &rarr;
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* 6. FAQ ACCORDION */}
        <section id="faq" className="scroll-mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-5xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight mb-4">
              Ko&apos;p Beriladigan Savollar
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Vydex platformasi va SRS xotira tizimi haqida barcha javoblar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Vydex platformasidan foydalanish bepulmi?",
                a: "Ha! Barcha 10 ta flagman to'plam, 2500+ ta akademik so'z, 4 ta o'rganish rejimi va Telegram bot integratsiyasi 100% bepul.",
              },
              {
                q: "Spaced Repetition (SRS) qanday qilib yodlashni tezlashtiradi?",
                a: "German Ebbinghaus unutish egri chizig'iga ko'ra, inson miyasi ma'lumotni unutayotgan lahzada takrorlash xotira neyronlarini 10x mustahkamlaydi. 5 ta qutidan o'tgan so'zlar umrbod saqlanadi.",
              },
              {
                q: "AI Text-to-Deck nima va undan qanday foydalanaman?",
                a: "Google Gemini 3.5 sun'iy intellekti matnlardan eng muhim va unutiluvchan so'zlarni ajratib, o'zbekcha tarjima, sinonimlar va kontekst bilan maxsus takrorlash to'plamini yasab beradi.",
              },
              {
                q: "Telegram bot bilan qanday ulanadi?",
                a: "@vydex_uzbot botiga start bosing yoki saytdagi 'Telegram Bot' tugmasini bosing — bot sizning o'rganish profilingiz bilan bir zumda bog'lanadi.",
              },
            ].map((faq, idx) => (
              <GlassCard
                key={idx}
                interactive
                onClick={() => toggleFaq(idx)}
                className="p-6 rounded-[24px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-base sm:text-lg font-bold font-manrope text-zinc-950 dark:text-white">
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-600 dark:text-[#B6FF2E] shrink-0 transition-transform duration-300 ${
                      activeFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {activeFaq === idx && (
                  <p className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 7. HIGH CONVERTING BOTTOM CTA */}
        <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-zinc-900 to-[#15171C] border border-zinc-800 dark:border-white/15 p-8 sm:p-14 text-center shadow-2xl text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B6FF2E]/10 rounded-full blur-[120px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-black font-manrope text-white tracking-tight mb-4 relative z-10">
            Lug&apos;at Boyligingizni Bugunoq Mustahkamlang
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mb-8 font-inter relative z-10 leading-relaxed">
            Ro&apos;yxatdan o&apos;tish atigi 30 soniya vaqt oladi. 2400+ ta akademik so&apos;z va AI yordamchi sizni kutmoqda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/register" className="w-full sm:w-auto">
              <GlassButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-9 py-4 text-base"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Hoziroq Ro&apos;yxatdan O&apos;tish
              </GlassButton>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <GlassButton
                variant="graphite"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-base bg-white/10 hover:bg-white/20 text-white"
              >
                To&apos;plamlarni Ko&apos;rish
              </GlassButton>
            </Link>
          </div>
        </section>

      </div>

      {/* AI Smart Import Modal */}
      <AISmartImportModal
        isOpen={isAIImportModalOpen}
        onClose={() => setIsAIImportModalOpen(false)}
        onDeckCreated={() => {
          setIsAIImportModalOpen(false);
          window.location.href = "/dashboard";
        }}
        initialText={importInitialText}
      />
    </div>
  );
}
