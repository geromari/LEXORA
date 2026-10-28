"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  RefreshCw, 
  Search,
  Bot,
  BrainCircuit,
  Zap,
  Layers,
  Star,
  Flame,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TelegramIcon } from "@/components/icons/BrandIcons";
import { RetroHeroSection } from "@/components/dashboard/RetroHeroSection";
import { HeroStatsBar } from "@/components/dashboard/HeroStatsBar";
import { DeckGrid } from "@/components/dashboard/DeckGrid";
import { CreateDeckModal } from "@/components/dashboard/CreateDeckModal";
import { AISmartImportModal } from "@/components/dashboard/AISmartImportModal";
import { api, DeckListItem, DueCardsResponse } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<DeckListItem[]>([]);
  const [dueData, setDueData] = useState<DueCardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIImportModalOpen, setIsAIImportModalOpen] = useState(false);
  const [importInitialText, setImportInitialText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ielts" | "c1" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [decksRes, dueRes] = await Promise.all([
        api.getDecks(),
        api.getDueCards().catch(() => ({ total_due: 0, total_hardest: 0, due_cards: [], hardest_cards: [] })),
      ]);
      setDecks(decksRes);
      setDueData(dueRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleOpenModal = () => setIsCreateModalOpen(true);
    const handleOpenAIModal = () => setIsAIImportModalOpen(true);
    const handleAuthChange = () => loadDashboardData();
    const handleFilterMy = () => setSelectedFilter("my");

    window.addEventListener("open-create-deck-modal", handleOpenModal);
    window.addEventListener("open-ai-import-modal", handleOpenAIModal);
    window.addEventListener("lexora-auth-changed", handleAuthChange);
    window.addEventListener("filter-my-decks", handleFilterMy);

    if (typeof window !== "undefined") {
      if (window.location.search.includes("create=true")) {
        setIsCreateModalOpen(true);
      }
      if (window.location.search.includes("ai=true")) {
        setIsAIImportModalOpen(true);
      }
      if (window.location.search.includes("filter=my")) {
        setSelectedFilter("my");
      }
    }

    return () => {
      window.removeEventListener("open-create-deck-modal", handleOpenModal);
      window.removeEventListener("open-ai-import-modal", handleOpenAIModal);
      window.removeEventListener("lexora-auth-changed", handleAuthChange);
      window.removeEventListener("filter-my-decks", handleFilterMy);
    };
  }, []);

  // Compute aggregate stats safely
  const totalCards = decks.reduce((acc, d) => acc + (Number(d.card_count) || 0), 0);
  const totalLearned = decks.reduce((acc, d) => acc + (Number(d.learned_count) || 0), 0);
  const totalDue = Number.isFinite(dueData?.total_due)
    ? Math.max(0, dueData!.total_due)
    : decks.reduce((acc, d) => acc + (Number(d.due_count) || 0), 0);
  
  // Calculate weighted overall accuracy safely
  const overallAccuracy =
    decks.length > 0
      ? Math.round(
          decks.reduce((acc, d) => acc + (Number(d.mastery_percentage) || 0), 0) / decks.length
        )
      : 88;

  // Filtered decks by level pills + search query
  const filteredDecks = decks.filter((deck) => {
    // 1. Filter pill check
    if (selectedFilter === "my") {
      if (!deck.is_owner) return false;
    } else if (selectedFilter === "ielts") {
      const isIelts =
        (deck.level && deck.level.toUpperCase().includes("IELTS")) ||
        deck.title.toUpperCase().includes("IELTS");
      if (!isIelts) return false;
    } else if (selectedFilter === "c1") {
      const isC1 =
        (deck.level && (deck.level.toUpperCase().includes("C1") || deck.level.toUpperCase().includes("C2"))) ||
        deck.title.toUpperCase().includes("C1");
      if (!isC1) return false;
    }

    // 2. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = deck.title.toLowerCase().includes(q);
      const matchesDesc = deck.description?.toLowerCase().includes(q);
      const matchesLevel = deck.level?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesLevel) return false;
    }

    return true;
  });

  const handleHeroAnalyze = (text: string) => {
    setImportInitialText(text);
    setIsAIImportModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION (Red Noir Style) */}
      <RetroHeroSection onAnalyzeText={handleHeroAnalyze} />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-16">
        
        {/* 2. STATS BAR (Bento Metric Overview) */}
        <section id="stats">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.8)]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                SRS Xotira &amp; Progress Statistikasi
              </h2>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <HeroStatsBar
            totalLearned={Number.isFinite(totalLearned) ? totalLearned : 0}
            totalDue={Number.isFinite(totalDue) ? totalDue : 0}
            totalCards={Number.isFinite(totalCards) ? totalCards : 0}
            streakDays={Number.isFinite(user?.streak_count) ? user!.streak_count : 3}
            accuracyPercentage={overallAccuracy}
            isLoading={isLoading}
          />
        </section>

        {/* 3. DUE REVIEW CALLOUT BANNER (if cards are due) */}
        {totalDue > 0 && decks.length > 0 && (
          <section>
            <div className="p-6 sm:p-8 rounded-2xl border border-[#ef233c] bg-zinc-950/80 shadow-[0_0_40px_rgba(239,35,60,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,35,60,0.3)]">
                  <Clock className="w-6 h-6 animate-pulse text-[#ef233c]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-manrope text-white tracking-tight">
                    Bugun takrorlash uchun <span className="text-[#ef233c]">{totalDue} ta so&apos;z</span> kutmoqda!
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-zinc-400 mt-1 font-inter">
                    Spaced Repetition xotira algoritmi bo&apos;yicha so&apos;zlarni uzoq muddatli xotiraga muhrlang.
                  </p>
                </div>
              </div>

              <Link href="/review" className="w-full sm:w-auto shrink-0 relative z-10">
                <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,35,60,0.4)] transition cursor-pointer">
                  <span>Hozir Takrorlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              {/* Ambient Red Hover Gradient */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 65%)" }}
              />
            </div>
          </section>
        )}

        {/* 4. DECK EXPLORER GRID SECTION */}
        <section className="space-y-6" id="decks">
          <div className="flex flex-col gap-5">
            {/* Header Row: Title on Left, Action buttons on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ef233c]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-white tracking-tight">
                  Mavjud To&apos;plamlar
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  {filteredDecks.length}
                </span>
              </div>

              {/* Quick Actions in Section Header */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => {
                    setImportInitialText("");
                    setIsAIImportModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#ef233c] hover:bg-red-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.35)] transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Matndan lug&apos;at</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ef233c]" />
                  <span>Yangi to&apos;plam</span>
                </button>
              </div>
            </div>

            {/* Search bar & Filter Pills Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To'plamlarni qidirish..."
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-[#ef233c]/60 outline-none transition"
                />
              </div>

              {/* Level Filter Pills: Barchasi, IELTS, C1, Shaxsiy */}
              <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "Barchasi" },
                  { id: "ielts", label: "IELTS" },
                  { id: "c1", label: "C1 Academic" },
                  { id: "my", label: "Shaxsiy" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedFilter(pill.id as any)}
                    className={`px-3.5 py-1.5 rounded-full font-medium text-xs border transition-all cursor-pointer ${
                      selectedFilter === pill.id
                        ? "bg-[#ef233c] text-white border-[#ef233c] shadow-[0_0_15px_rgba(239,35,60,0.4)]"
                        : "bg-white/5 text-zinc-400 hover:text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deck Cards Grid */}
          <DeckGrid
            decks={filteredDecks}
            isLoading={isLoading}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        </section>

        {/* 5. FEATURES BENTO GRID (matching reference style) */}
        <section className="pt-16 pb-8" id="features">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight font-manrope mb-4">
              The Operating System for <br />
              <span className="text-[#ef233c]">Academic Vocabulary Mastery</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 font-light font-inter">
              An&apos;anaviy quruq yodlash o&apos;rniga sun&apos;iy intellekt va ilmiy xotira algoritmi asosida o&apos;rganing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Main Feature Card - Spans 2 cols */}
            <div className="lg:col-span-2 group relative overflow-hidden p-8 border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-5 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#ef233c]">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white font-manrope mb-3 tracking-tight">
                  Generative AI Text-to-Deck
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Istalgan inglizcha matn, yangilik yoki IELTS reading qismini yuklang. Google Gemini AI undagi eng muhim akademik so&apos;zlarni, o&apos;zbekcha aniq tarjimasi, CEFR darajasi va misol jumlalari bilan ajratib beradi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between relative z-10">
                <span className="text-xs font-mono text-[#ef233c]">GEMINI 2.5 FLASH</span>
                <Sparkles className="w-4 h-4 text-[#ef233c]" />
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 70%)" }}
              />
            </div>

            {/* Feature 2: Leitner SRS */}
            <div className="lg:col-span-2 group relative overflow-hidden p-8 border border-white/10 bg-gradient-to-b from-zinc-900/50 to-black hover:border-white/20 transition-all rounded-2xl flex flex-col justify-between">
              <div className="relative z-10">
                <div className="mb-5 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#ef233c]">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white font-manrope mb-3 tracking-tight">
                  Spaced Repetition (SRS)
                </h3>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Ebbinghaus unutish egri chizig&apos;i asosidagi 5 bosqichli Leitner tizimi. Oson so&apos;zlar kamroq, qiyin so&apos;zlar tez-tez takrorlanib, 100% uzoq muddatli xotiraga aylanadi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between relative z-10">
                <span className="text-xs font-mono text-[#ef233c]">LEITNER 5-BOX ENGINE</span>
                <Clock className="w-4 h-4 text-[#ef233c]" />
              </div>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 70%)" }}
              />
            </div>

            {/* Feature 3: Telegram Bot Sync */}
            <div className="group relative overflow-hidden p-6 sm:p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#229ED9]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">Telegram Bot</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-inter">
                  Platformaga kirmasdan ham har kuni Telegram orqali 5 ta yangi so&apos;z va testlar yeching.
                </p>
              </div>
            </div>

            {/* Feature 4: Contextual Syntax Checker */}
            <div className="group relative overflow-hidden p-6 sm:p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">Kontekst Tekshiruvi</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-inter">
                  Yodlagan so&apos;zingiz bilan jumla tuzing — AI grammatika va kollokatsiyani darhol baholaydi.
                </p>
              </div>
            </div>

            {/* Feature 5: Native Audio Pronunciation */}
            <div className="group relative overflow-hidden p-6 sm:p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">US / UK Talaffuz</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-inter">
                  Har bir so&apos;z uchun britaniya va amerika aksentlarida yuqori sifatli audio talaffuz.
                </p>
              </div>
            </div>

            {/* Feature 6: Daily Streak Motivation */}
            <div className="group relative overflow-hidden p-6 sm:p-8 border border-white/10 bg-black hover:border-white/20 transition-all rounded-2xl">
              <div className="relative z-10">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-white/5 border border-white/10 text-[#ef233c]">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white font-manrope mb-2">Streak &amp; Reyting</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-inter">
                  Kunlik uzluksiz o&apos;qish seriyasini saqlang va doimiy o&apos;sish ritmiga kiring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. RED NOIR TESTIMONIAL BANNER (matching reference style) */}
        <section className="w-full bg-[#ef233c] py-14 sm:py-20 px-6 rounded-3xl shadow-[0_0_50px_rgba(239,35,60,0.3)]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 text-black mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-black text-black" />
              ))}
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black font-manrope leading-tight mb-8">
              &ldquo;Lexora orqali 3 oy ichida 1500 dan ortiq C1 akademik so&apos;zlarni o&apos;zlashtirdim va IELTS Readingdan 8.5 oldim.&rdquo;
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full overflow-hidden flex items-center justify-center text-white font-bold font-manrope">
                SZ
              </div>
              <div className="text-left">
                <div className="text-black font-bold text-lg font-manrope">Shahzod Zokirov</div>
                <div className="text-black/80 font-medium text-xs font-inter">IELTS Overall 8.5 • Toshkent</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CTA BANNER matching reference */}
        <section className="py-20 text-center relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/60 p-8 sm:p-14">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl font-bold font-manrope mb-6 tracking-tight text-white">
              Lug&apos;at boyligingizni <br />
              <span className="text-[#ef233c]">bugunoq kuchaytiring</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-xl mx-auto font-inter font-light">
              Hech qanday to&apos;lov talab qilinmaydi. Bir tugma bilan ro&apos;yxatdan o&apos;ting yoki Telegram orqali boshlang.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-create-deck-modal"));
                  }
                }}
                className="shiny-cta group w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-medium text-sm">
                  <span>Yangi To&apos;plam Yaratish</span>
                  <ArrowRight className="w-4 h-4 text-[#ef233c] group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <a
                href="https://t.me/lexora_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>Telegram Botda Boshlash</span>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* MODALS */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeckCreated={(newDeck) => {
          const formattedDeck: DeckListItem = {
            ...newDeck,
            learned_count: Number(newDeck.learned_count) || 0,
            due_count:
              newDeck.due_count !== undefined
                ? Number(newDeck.due_count) || 0
                : Number(newDeck.card_count) || newDeck.cards?.length || 0,
            card_count: Number(newDeck.card_count) || newDeck.cards?.length || 0,
            mastery_percentage: Number(newDeck.mastery_percentage) || 0,
          };
          setDecks((prev) => [formattedDeck, ...prev]);
        }}
      />

      <AISmartImportModal
        isOpen={isAIImportModalOpen}
        initialText={importInitialText}
        onClose={() => setIsAIImportModalOpen(false)}
        onDeckCreated={(newDeck) => {
          const formattedDeck: DeckListItem = {
            ...newDeck,
            learned_count: Number(newDeck.learned_count) || 0,
            due_count:
              newDeck.due_count !== undefined
                ? Number(newDeck.due_count) || 0
                : Number(newDeck.card_count) || newDeck.cards?.length || 0,
            card_count: Number(newDeck.card_count) || newDeck.cards?.length || 0,
            mastery_percentage: Number(newDeck.mastery_percentage) || 0,
          };
          setDecks((prev) => [formattedDeck, ...prev]);
        }}
      />
    </div>
  );
}
