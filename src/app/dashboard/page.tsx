"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Plus, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  RefreshCw, 
  Search,
  Layers,
  Flame,
  ShieldCheck,
  UserCheck,
  BrainCircuit,
  Filter
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HeroStatsBar } from "@/components/dashboard/HeroStatsBar";
import { DeckGrid } from "@/components/dashboard/DeckGrid";
import { CreateDeckModal } from "@/components/dashboard/CreateDeckModal";
import { AISmartImportModal } from "@/components/dashboard/AISmartImportModal";
import { api, DeckListItem, DueCardsResponse } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { animeAnimations } from "@/lib/animeAnimations";

export default function DashboardPage() {
  const { user, openAuthModal } = useAuth();
  const [decks, setDecks] = useState<DeckListItem[]>([]);
  const [dueData, setDueData] = useState<DueCardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIImportModalOpen, setIsAIImportModalOpen] = useState(false);
  const [importInitialText, setImportInitialText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ielts" | "c1" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pageRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener("vydex-auth-changed", handleAuthChange);
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
      window.removeEventListener("vydex-auth-changed", handleAuthChange);
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

  const overallAccuracy =
    decks.length > 0
      ? Math.round(
          decks.reduce((acc, d) => acc + (Number(d.mastery_percentage) || 0), 0) / decks.length
        )
      : 88;

  // Filtered decks by level pills + search query
  const filteredDecks = decks.filter((deck) => {
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = deck.title.toLowerCase().includes(q);
      const matchesDesc = deck.description?.toLowerCase().includes(q);
      const matchesLevel = deck.level?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesLevel) return false;
    }

    return true;
  });

  return (
    <div ref={pageRef} className="w-full">
      {/* 1. Top Breadcrumb & User Welcome Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
        <GlassCard className="p-6 sm:p-7 rounded-[30px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-[#B6FF2E] font-bold tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-[#B6FF2E] animate-pulse" />
              <span>O&apos;quvchi Kabineti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight">
              {user ? `Xush kelibsiz, ${user.username}!` : "Shaxsiy O'quv Maydoni"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter mt-1">
              Leitner Spaced Repetition (SRS) xotira algoritmi va AI orqali so&apos;zlarni uzoq muddatga yodlang.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 flex items-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-white">
              <Flame className="w-4 h-4 text-amber-500 dark:text-[#B6FF2E]" />
              <span className="text-amber-600 dark:text-[#B6FF2E]">{user?.streak_count || 0}</span>
              <span className="text-zinc-500">kunlik seriya</span>
            </div>

            <GlassButton
              variant="graphite"
              size="sm"
              onClick={loadDashboardData}
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </GlassButton>
          </div>
        </GlassCard>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 space-y-10">
        
        {/* STATS BAR (Bento Metric Overview) */}
        <section id="stats">
          <HeroStatsBar
            totalLearned={Number.isFinite(totalLearned) ? totalLearned : 0}
            totalDue={Number.isFinite(totalDue) ? totalDue : 0}
            totalCards={Number.isFinite(totalCards) ? totalCards : 0}
            streakDays={Number.isFinite(user?.streak_count) ? user!.streak_count : 3}
            accuracyPercentage={overallAccuracy}
            isLoading={isLoading}
          />
        </section>

        {/* DUE REVIEW CALLOUT BANNER (if cards are due) */}
        {totalDue > 0 && decks.length > 0 && (
          <section>
            <div className="p-6 sm:p-8 rounded-[30px] border border-emerald-500/30 dark:border-[#B6FF2E]/40 bg-white/95 dark:bg-[#23262F]/90 shadow-md dark:shadow-[0_0_35px_rgba(182,255,46,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/40 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse text-emerald-700 dark:text-[#B6FF2E]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-manrope text-zinc-950 dark:text-white tracking-tight">
                    Bugun takrorlash uchun <span className="text-emerald-700 dark:text-[#B6FF2E] font-black">{totalDue} ta so&apos;z</span> kutmoqda!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-inter">
                    Spaced Repetition xotira algoritmi bo&apos;yicha so&apos;zlarni unutilmas uzoq muddatli xotiraga muhrlang.
                  </p>
                </div>
              </div>

              <Link href="/review" className="w-full sm:w-auto shrink-0 relative z-10">
                <GlassButton
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Hozir Takrorlash
                </GlassButton>
              </Link>
            </div>
          </section>
        )}

        {/* DECK EXPLORER GRID SECTION */}
        <section className="space-y-6" id="decks">
          <div className="flex flex-col gap-5">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#B6FF2E] flex items-center justify-center text-[#15171C]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight">
                  Mavjud To&apos;plamlar
                </h2>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-emerald-800 dark:text-[#B6FF2E]">
                  {filteredDecks.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <GlassButton
                  variant="ai"
                  size="sm"
                  onClick={() => {
                    setImportInitialText("");
                    setIsAIImportModalOpen(true);
                  }}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  AI Smart Import
                </GlassButton>

                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  To&apos;plam Yaratish
                </GlassButton>
              </div>
            </div>

            {/* Filter Tabs and Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-[#23262F]/80 border border-zinc-200 dark:border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "Barchasi" },
                  { id: "ielts", label: "IELTS" },
                  { id: "c1", label: "C1 / C2 Akademik" },
                  { id: "my", label: "Mening To'plamlarim" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedFilter(tab.id as any)}
                    className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedFilter === tab.id
                        ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_15px_rgba(182,255,46,0.3)]"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To'plam nomi bo'yicha qidirish..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white dark:bg-[#23262F]/80 border border-zinc-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-[#B6FF2E] focus:ring-1 focus:ring-[#B6FF2E]/30 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-xs outline-none transition-all"
                />
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

      </div>

      {/* Modals */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeckCreated={() => loadDashboardData()}
      />

      <AISmartImportModal
        isOpen={isAIImportModalOpen}
        onClose={() => setIsAIImportModalOpen(false)}
        onDeckCreated={() => loadDashboardData()}
        initialText={importInitialText}
      />
    </div>
  );
}
