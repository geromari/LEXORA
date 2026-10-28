"use client";

import React, { useEffect, useState, Suspense, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Layers, 
  Keyboard, 
  ListChecks, 
  PenLine 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { QuizEngine } from "@/components/study/QuizEngine";
import { FlashcardEngine } from "@/components/study/FlashcardEngine";
import { TypingEngine } from "@/components/study/TypingEngine";
import { AISentenceChecker } from "@/components/study/AISentenceChecker";
import { api, DeckDetail, Card } from "@/lib/api";

type StudyTab = "quiz" | "flashcards" | "typing" | "ai_writing";

function StudyPageContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const deckId = Number(resolvedParams.id);

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<StudyTab>("quiz");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDeck() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getDeck(deckId);
        setDeck(data);
        const sorted = [...data.cards].sort((a, b) => {
          const aBox = a.progress?.box_level ?? 0;
          const bBox = b.progress?.box_level ?? 0;
          return aBox - bBox;
        });
        setCards(sorted);
      } catch (err: any) {
        console.error("Failed to load deck:", err);
        setError(err.message || "To'plamni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    }
    if (deckId) {
      loadDeck();
    }
  }, [deckId]);

  const handleReviewSubmitted = async (cardId: number, correct: boolean) => {
    return await api.submitReview(cardId, correct);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#ef233c] border-t-transparent animate-spin shadow-[0_0_20px_rgba(239,35,60,0.5)]" />
        <p className="text-sm font-bold font-manrope uppercase tracking-wider text-zinc-400">
          Mashg&apos;ulot xonasi tayyorlanmoqda...
        </p>
      </div>
    );
  }

  if (error || !deck || cards.length === 0) {
    return (
      <GlassCard padding="xl" className="text-center py-16 space-y-4 max-w-lg mx-auto mt-12">
        <h3 className="text-xl font-bold font-manrope text-white">To&apos;plam topilmadi</h3>
        <p className="text-sm font-inter text-zinc-400">
          {error || "Ushbu to'plamda mashq qilish uchun kartochkalar mavjud emas."}
        </p>
        <Link href={`/decks/${deckId}`}>
          <GlassButton variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4 mr-1.5" />}>
            Lug&apos;atga qaytish
          </GlassButton>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← {deck.title} / Lug&apos;atga qaytish</span>
        </Link>

        {/* Deck Level & Card Count Tag */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase shadow-[0_0_10px_rgba(239,35,60,0.2)]">
            {deck.level || "C1"}
          </span>
          <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-mono text-xs">
            {deck.card_count} ta so&apos;z
          </span>
        </div>
      </div>

      {/* 4-Tab Mode Switcher Bar */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-zinc-950/80 border border-white/10 shadow-2xl w-full max-w-2xl backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-full text-xs sm:text-sm font-bold font-manrope transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Quiz (Test)</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-full text-xs sm:text-sm font-bold font-manrope transition-all cursor-pointer ${
              activeTab === "flashcards"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3D Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("typing")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-full text-xs sm:text-sm font-bold font-manrope transition-all cursor-pointer ${
              activeTab === "typing"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Yozma</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_writing")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-full text-xs sm:text-sm font-bold font-manrope transition-all cursor-pointer ${
              activeTab === "ai_writing"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.4)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span>AI Writing</span>
          </button>
        </div>
      </div>

      {/* Render Active Study Engine */}
      <div className="pt-2">
        {activeTab === "quiz" && (
          <QuizEngine
            deck={deck}
            cards={cards}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {activeTab === "flashcards" && (
          <FlashcardEngine
            deck={deck}
            cards={cards}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {activeTab === "typing" && (
          <TypingEngine
            deck={deck}
            cards={cards}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {activeTab === "ai_writing" && (
          <AISentenceChecker
            deck={deck}
            cards={cards}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>

    </div>
  );
}

export default function StudyFlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#ef233c] border-t-transparent animate-spin shadow-[0_0_20px_rgba(239,35,60,0.5)]" />
          <p className="text-sm font-bold font-manrope uppercase text-zinc-400">Mashg&apos;ulot yuklanmoqda...</p>
        </div>
      }
    >
      <StudyPageContent params={params} />
    </Suspense>
  );
}
