"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  Trophy,
  BrainCircuit,
  Zap,
  Flame
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Card, DeckDetail } from "@/lib/api";
import { playPronunciation } from "@/lib/speech";

interface FlashcardEngineProps {
  deck: DeckDetail;
  cards: Card[];
  onReviewSubmitted: (cardId: number, correct: boolean) => Promise<any>;
}

export function FlashcardEngine({
  deck,
  cards,
  onReviewSubmitted,
}: FlashcardEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({
    hard: 0,
    good: 0,
    easy: 0,
  });

  const currentCard = cards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleAudio = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (currentCard) {
        playPronunciation(currentCard.term_en);
      }
    },
    [currentCard]
  );

  const handleGrade = useCallback(
    async (grade: "hard" | "good" | "easy") => {
      if (!currentCard || isSubmitting) return;

      setIsSubmitting(true);
      const isCorrect = grade !== "hard";

      try {
        await onReviewSubmitted(currentCard.id, isCorrect);

        setStats((prev) => ({
          ...prev,
          [grade]: prev[grade] + 1,
        }));

        if (currentIndex + 1 < cards.length) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setSessionCompleted(true);
        }
      } catch (err) {
        console.error("Failed to submit review:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, currentIndex, cards.length, isSubmitting, onReviewSubmitted]
  );

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNextCard = useCallback(() => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  // Keyboard navigation: Space, ArrowLeft, ArrowRight, 1, 2, 3, A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === "1" && isFlipped) {
        e.preventDefault();
        handleGrade("hard");
      } else if (e.key === "2" && isFlipped) {
        e.preventDefault();
        handleGrade("good");
      } else if (e.key === "3" && isFlipped) {
        e.preventDefault();
        handleGrade("easy");
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handlePrev, handleNextCard, handleGrade, handleAudio, isFlipped, sessionCompleted]);

  if (!currentCard) return null;

  if (sessionCompleted) {
    const total = stats.hard + stats.good + stats.easy;
    return (
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-[#00E5FF] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto text-black">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Flashcard Mashg&apos;uloti Yakunlandi!
          </h2>
          <p className="text-sm font-bold text-black/70">
            Jami {total} ta kartochka takrorlandi va xotirangiz mustahkamlandi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#FF8080] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{stats.hard}</div>
            <div className="text-xs font-bold text-black/80 mt-1">Qiyin (0-quti)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FFCC00] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{stats.good}</div>
            <div className="text-xs font-bold text-black/80 mt-1">Yaxshi (+1)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#A3E635] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{stats.easy}</div>
            <div className="text-xs font-bold text-black/80 mt-1">Oson (Yodlangan)</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <GlassButton
            variant="ai"
            size="md"
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setIsFlipped(false);
              setStats({ hard: 0, good: 0, easy: 0 });
            }}
            leftIcon={<RotateCcw className="w-4 h-4 mr-1.5" />}
          >
            Qaytadan Takrorlash
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar with Navigation Arrows and Counter */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Oldingi karta [←]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-black text-black bg-[#FFCC00] px-4 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
          <BrainCircuit className="w-3.5 h-3.5 text-black" />
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <button
          onClick={handleNextCard}
          disabled={currentIndex + 1 >= cards.length}
          className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Keyingi karta [→]"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Striped Ruler Bar */}
      <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] p-0.5">
        <div
          className="h-full bg-[#00E5FF] border-r-2 border-black rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Retro Flashcard */}
      <div
        className="w-full min-h-[380px] sm:min-h-[420px] perspective-[1200px] cursor-pointer select-none"
        onClick={handleFlip}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative [transform-style:preserve-3d]"
        >
          {/* FRONT SIDE (English Term) */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-white border-[3px] border-black p-8 flex flex-col justify-between shadow-[6px_6px_0px_#000] [backface-visibility:hidden] absolute inset-0 ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Front Top */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                {deck.level || "C1"} • #{currentIndex + 1}
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                title="Talaffuzni tinglash (A)"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Front Main */}
            <div className="my-auto text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
                {currentCard.term_en}
              </h2>
              {currentCard.synonyms && (
                <div className="mt-2">
                  <span className="px-3 py-1 rounded-lg border border-black/30 bg-[#F4EFEA] text-xs font-mono text-black inline-block">
                    Sinonimlar: {currentCard.synonyms}
                  </span>
                </div>
              )}
            </div>

            {/* Front Bottom */}
            <div className="text-center pt-4 border-t-2 border-black/10 text-xs font-bold text-black/70 flex items-center justify-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-black" />
              <span>Aylantirish uchun bosing yoki [Space] tugmasini uring</span>
            </div>
          </div>

          {/* BACK SIDE (Uzbek Meaning & Context Sentence) */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-[#FEF9C3] border-[3px] border-black p-8 flex flex-col justify-between shadow-[6px_6px_0px_#000] [transform:rotateY(180deg)] [backface-visibility:hidden] absolute inset-0 ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Back Top */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
                O&apos;zbekcha Tarjima & Kontekst
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                title="Talaffuzni tinglash"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Back Main */}
            <div className="my-auto text-center space-y-4">
              <div className="text-2xl sm:text-3xl font-black text-black leading-relaxed">
                {currentCard.meaning_uz}
              </div>

              {currentCard.example_en && (
                <div className="p-4 rounded-xl border-2 border-black bg-white text-xs sm:text-sm text-black italic leading-relaxed text-left max-w-lg mx-auto shadow-[2px_2px_0px_#000]">
                  &ldquo;{currentCard.example_en}&rdquo;
                </div>
              )}
            </div>

            {/* Back Bottom */}
            <div className="text-center pt-2 text-xs font-bold text-black/60">
              Qaytadan aylantirish uchun bosing
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3-Tier Self-Grading Buttons: Qiyin [1] | Yaxshi [2] | Oson [3] */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <GlassButton
          variant="danger"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("hard");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full text-xs sm:text-sm font-black bg-[#FF8080] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          Qiyin [1]
        </GlassButton>

        <GlassButton
          variant="ai"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("good");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full text-xs sm:text-sm font-black bg-[#FFCC00] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          Yaxshi [2]
        </GlassButton>

        <GlassButton
          variant="success"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("easy");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full text-xs sm:text-sm font-black bg-[#A3E635] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          Oson [3]
        </GlassButton>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="text-center text-xs font-bold text-black/60 flex items-center justify-center gap-3 flex-wrap">
        <span>[Space] Aylantirish</span>
        <span>•</span>
        <span>[← / →] Harakatlanish</span>
        <span>•</span>
        <span>[1] Qiyin</span>
        <span>•</span>
        <span>[2] Yaxshi</span>
        <span>•</span>
        <span>[3] Oson</span>
        <span>•</span>
        <span>[A] Audio</span>
      </div>
    </div>
  );
}
