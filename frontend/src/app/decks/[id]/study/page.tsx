"use client";

import React, { useEffect, useState, Suspense, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Layers, 
  BrainCircuit, 
  Keyboard, 
  HelpCircle,
  Sparkles,
  BookOpen,
  Wand2,
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
        // Prioritize cards with lower box level (unmastered first)
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

  // Handle review submission callback from any engine
  const handleReviewSubmitted = async (cardId: number, correct: boolean) => {
    return await api.submitReview(cardId, correct);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-xl border-[3px] border-black border-t-transparent animate-spin bg-yellow-300" />
        <p className="text-sm font-black uppercase tracking-wider text-black">Mashg&apos;ulot xonasi tayyorlanmoqda...</p>
      </div>
    );
  }

  if (error || !deck || cards.length === 0) {
    return (
      <GlassCard padding="xl" className="text-center py-16 space-y-4 max-w-lg mx-auto mt-12">
        <h3 className="text-xl font-black text-black">To&apos;plam topilmadi</h3>
        <p className="text-sm font-medium text-black/70">
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
    <div className="space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] text-xs font-black text-black hover:bg-[#FFCC00] hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← {deck.title} / Lug&apos;atga qaytish</span>
        </Link>

        {/* Deck Level & Card Count Tag */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
            {deck.level || "C1"}
          </span>
          <span className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black font-extrabold text-xs shadow-[2px_2px_0px_#000]">
            {deck.card_count} ta so&apos;z
          </span>
        </div>
      </div>

      {/* 4-Tab Mode Switcher Bar */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] w-full max-w-2xl">
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "quiz"
                ? "bg-[#FFCC00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Quiz (Test)</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "flashcards"
                ? "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3D Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("typing")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "typing"
                ? "bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Yozma</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_writing")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === "ai_writing"
                ? "bg-[#FA5A2A] text-white border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
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
          <div className="w-12 h-12 rounded-xl border-[3px] border-black border-t-transparent animate-spin bg-yellow-300" />
          <p className="text-sm font-black uppercase text-black">Mashg&apos;ulot yuklanmoqda...</p>
        </div>
      }
    >
      <StudyPageContent params={params} />
    </Suspense>
  );
}
