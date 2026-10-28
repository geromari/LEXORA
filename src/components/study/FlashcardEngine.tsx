"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Volume2, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Trophy,
  BrainCircuit
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
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
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6 border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(239,35,60,0.3)] flex items-center justify-center mx-auto text-[#ef233c]">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-white">
            Flashcard Mashg&apos;uloti Yakunlandi!
          </h2>
          <p className="text-sm font-inter text-zinc-400">
            Jami {total} ta kartochka takrorlandi va xotirangiz mustahkamlandi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40">
            <div className="text-2xl font-bold font-manrope text-red-300">{stats.hard}</div>
            <div className="text-xs text-zinc-400 mt-1">Qiyin (0-quti)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold font-manrope text-white">{stats.good}</div>
            <div className="text-xs text-zinc-400 mt-1">Yaxshi (+1)</div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <div className="text-2xl font-bold font-manrope text-emerald-300">{stats.easy}</div>
            <div className="text-xs text-zinc-400 mt-1">Oson (Yodlangan)</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setIsFlipped(false);
              setStats({ hard: 0, good: 0, easy: 0 });
            }}
            className="shiny-cta py-3 px-6"
          >
            <span className="relative z-10 flex items-center gap-2 text-white font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-[#ef233c]" />
              <span>Qaytadan Takrorlash</span>
            </span>
          </button>
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
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Oldingi karta [←]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
          <BrainCircuit className="w-3.5 h-3.5 text-[#ef233c]" />
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <button
          onClick={handleNextCard}
          disabled={currentIndex + 1 >= cards.length}
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Keyingi karta [→]"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Striped Ruler Bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.6)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Red Noir Flashcard */}
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
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-gradient-to-b from-zinc-900/80 to-black border border-white/15 p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(239,35,60,0.15)] [backface-visibility:hidden] absolute inset-0 text-white ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Front Top */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase tracking-wider">
                {deck.level || "C1"} • #{currentIndex + 1}
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
                title="Talaffuzni tinglash (A)"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Front Main */}
            <div className="my-auto text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-white tracking-tight leading-tight">
                {currentCard.term_en}
              </h2>
              {currentCard.synonyms && (
                <div className="mt-2">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 inline-block">
                    Sinonimlar: {currentCard.synonyms}
                  </span>
                </div>
              )}
            </div>

            {/* Front Bottom */}
            <div className="text-center pt-4 border-t border-white/10 text-xs font-medium text-zinc-400 flex items-center justify-center gap-1.5 font-inter">
              <RotateCcw className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>Aylantirish uchun bosing yoki [Space] tugmasini uring</span>
            </div>
          </div>

          {/* BACK SIDE (Uzbek Meaning & Context Sentence) */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-[#ef233c]/50 p-8 flex flex-col justify-between shadow-[0_0_45px_rgba(239,35,60,0.2)] [transform:rotateY(180deg)] [backface-visibility:hidden] absolute inset-0 text-white ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Back Top */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-bold font-manrope text-xs uppercase">
                O&apos;zbekcha Tarjima &amp; Kontekst
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
                title="Talaffuzni tinglash"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Back Main */}
            <div className="my-auto text-center space-y-4">
              <div className="text-2xl sm:text-3xl font-bold font-manrope text-white leading-relaxed">
                {currentCard.meaning_uz}
              </div>

              {currentCard.example_en && (
                <div className="p-4 rounded-xl border-l-2 border-[#ef233c] bg-white/[0.02] text-xs sm:text-sm text-zinc-300 italic leading-relaxed text-left max-w-lg mx-auto font-inter">
                  &ldquo;{currentCard.example_en}&rdquo;
                </div>
              )}
            </div>

            {/* Back Bottom */}
            <div className="text-center pt-2 text-xs text-zinc-500 font-inter">
              Qaytadan aylantirish uchun bosing
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3-Tier Self-Grading Buttons: Qiyin [1] | Yaxshi [2] | Oson [3] */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("hard");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full py-3.5 rounded-xl bg-red-950/40 hover:bg-[#ef233c] text-red-300 hover:text-white border border-red-500/40 font-bold font-manrope text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer active:scale-95"
        >
          Qiyin [1]
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("good");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 font-bold font-manrope text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer active:scale-95"
        >
          Yaxshi [2]
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleGrade("easy");
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full py-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold font-manrope text-xs sm:text-sm transition-all disabled:opacity-40 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          Oson [3]
        </button>
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-3 flex-wrap">
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
