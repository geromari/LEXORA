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
  Wand2,
  Search,
  Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
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
      {/* ====================================================================
          1. HERO SECTION (exact reproduction of doesitfit.lol from image)
          ==================================================================== */}
      <RetroHeroSection onAnalyzeText={handleHeroAnalyze} />

      {/* Main Content Area below the Ruler */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-12">
        
        {/* ====================================================================
            2. STATS BAR (Neobrutalist 4-card metric overview)
            ==================================================================== */}
        <section id="stats">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FA5A2A] border border-[#121212]" />
              <h2 className="text-sm font-mono font-black uppercase tracking-wider text-[#121212]">
                SRS Xotira & Progress Statistikasi
              </h2>
            </div>
            <button
              onClick={loadDashboardData}
              className="p-1.5 rounded-lg border border-[#121212] bg-white text-zinc-600 hover:text-[#121212] hover:bg-[#F4EFEA] transition cursor-pointer"
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


        {/* ====================================================================
            3. DUE REVIEW CALLOUT BANNER (if cards are due)
            ==================================================================== */}
        {totalDue > 0 && decks.length > 0 && (
          <section>
            <div className="p-6 rounded-2xl border-[2.5px] border-[#121212] bg-[#FFCC00] shadow-[5px_5px_0px_#121212] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#121212] flex items-center justify-center text-[#121212] shrink-0 shadow-[2px_2px_0px_#121212]">
                  <Clock className="w-6 h-6 animate-pulse text-[#FA5A2A]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#121212] tracking-tight">
                    Bugun takrorlash uchun {totalDue} ta so&apos;z kutmoqda!
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-zinc-800 mt-1">
                    Spaced Repetition xotira algoritmi bo&apos;yicha so&apos;zlarni uzoq muddatga mustahkamlang.
                  </p>
                </div>
              </div>

              <Link href="/review" className="w-full sm:w-auto shrink-0">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-[#121212] bg-[#FA5A2A] hover:bg-[#E04719] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer">
                  <span>Hozir Takrorlash</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </Link>
            </div>
          </section>
        )}


        {/* ====================================================================
            4. DECK EXPLORER GRID SECTION
            ==================================================================== */}
        <section className="space-y-6" id="decks">
          <div className="flex flex-col gap-4">
            {/* Header Row: Title on Left, Action buttons on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center shadow-[1px_1px_0px_#121212]">
                  <BookOpen className="w-4 h-4 text-[#121212]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#121212] tracking-tight">
                  Mavjud To&apos;plamlar
                </h2>
                <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-md border-2 border-[#121212] bg-white text-[#121212] shadow-[1px_1px_0px_#121212]">
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
                  className="px-4 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FA5A2A] hover:bg-[#E04719] text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Matndan lug&apos;at</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FFCC00] hover:bg-[#F0C000] text-[#121212] text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Yangi to&apos;plam</span>
                </button>
              </div>
            </div>

            {/* Search bar & Filter Pills Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To'plamlarni qidirish..."
                  className="w-full bg-white border-2 border-[#121212] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm font-medium text-[#121212] placeholder:text-zinc-400 shadow-[2px_2px_0px_#121212] outline-none transition"
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
                    className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 border-[#121212] transition-all cursor-pointer ${
                      selectedFilter === pill.id
                        ? "bg-[#FFCC00] text-[#121212] shadow-[2px_2px_0px_#121212] -translate-y-0.5"
                        : "bg-white text-zinc-700 hover:bg-[#F4EFEA]"
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

      {/* ====================================================================
          MODALS
          ==================================================================== */}
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
