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
  Layers,
  Flame,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { HeroStatsBar } from "@/components/dashboard/HeroStatsBar";
import { DeckGrid } from "@/components/dashboard/DeckGrid";
import { CreateDeckModal } from "@/components/dashboard/CreateDeckModal";
import { AISmartImportModal } from "@/components/dashboard/AISmartImportModal";
import { api, DeckListItem, DueCardsResponse } from "@/lib/api";

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
  
  // Calculate weighted overall accuracy safely
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
    <div className="w-full">
      {/* Top Breadcrumb & User Welcome Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#ef233c] font-semibold tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-[#ef233c] animate-pulse" />
              <span>Foydalanuvchi Kabineti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight">
              {user ? `Xush kelibsiz, ${user.username}!` : "Shaxsiy O'quv Maydoni"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter mt-1">
              Spaced Repetition xotira algoritmi va AI orqali so&apos;zlarni uzoq muddatga yodlang.
            </p>
          </div>

          {!user ? (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => openAuthModal("register")}
                className="px-5 py-2.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                Google / Telegram orqali Saqlash
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Flame className="w-4 h-4 text-[#ef233c] fill-[#ef233c]" />
                <span>{user.streak_count} kunlik uzluksiz seriya</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 space-y-12">
        
        {/* 1. STATS BAR (Bento Metric Overview) */}
        <section id="stats">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef233c] shadow-[0_0_8px_rgba(239,35,60,0.8)]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                SRS Xotira &amp; Progress Statistikasi
              </h2>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
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

        {/* 2. DUE REVIEW CALLOUT BANNER (if cards are due) */}
        {totalDue > 0 && decks.length > 0 && (
          <section>
            <div className="p-6 sm:p-8 rounded-2xl border border-[#ef233c] bg-white dark:bg-zinc-950/80 shadow-md dark:shadow-[0_0_40px_rgba(239,35,60,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm dark:shadow-[0_0_15px_rgba(239,35,60,0.3)]">
                  <Clock className="w-6 h-6 animate-pulse text-[#ef233c]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight">
                    Bugun takrorlash uchun <span className="text-[#ef233c]">{totalDue} ta so&apos;z</span> kutmoqda!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-inter">
                    Spaced Repetition xotira algoritmi bo&apos;yicha so&apos;zlarni unutilmas xotiraga muhrlang.
                  </p>
                </div>
              </div>

              <Link href="/review" className="w-full sm:w-auto shrink-0 relative z-10">
                <button className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(239,35,60,0.35)] transition cursor-pointer">
                  <span>Hozir Takrorlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </section>
        )}

        {/* 3. DECK EXPLORER GRID SECTION */}
        <section className="space-y-6" id="decks">
          <div className="flex flex-col gap-5">
            {/* Header Row: Title on Left, Action buttons on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center text-[#ef233c]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight">
                  Mavjud To&apos;plamlar
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300">
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
                  className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
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
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To'plamlarni qidirish..."
                  className="w-full bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-[#ef233c] outline-none transition"
                />
              </div>

              {/* Level Filter Pills: Barchasi, IELTS, C1, Shaxsiy */}
              <div className="flex items-center gap-2 text-xs shrink-0 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "Barchasi" },
                  { id: "ielts", label: "IELTS" },
                  { id: "c1", label: "C1 Academic" },
                  { id: "my", label: "Mening to'plamlarim" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedFilter(pill.id as any)}
                    className={`px-3.5 py-1.5 rounded-full font-medium text-xs border transition-all cursor-pointer ${
                      selectedFilter === pill.id
                        ? "bg-[#ef233c] text-white border-[#ef233c] shadow-sm"
                        : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10"
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
