"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  Lightbulb, 
  Eye, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Card, DeckDetail } from "@/lib/api";
import { checkSmartMatch } from "@/lib/smartMatch";
import { playPronunciation } from "@/lib/speech";

interface TypingEngineProps {
  deck: DeckDetail;
  cards: Card[];
  onReviewSubmitted: (cardId: number, correct: boolean) => Promise<any>;
}

export function TypingEngine({
  deck,
  cards,
  onReviewSubmitted,
}: TypingEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [revealedCharsCount, setRevealedCharsCount] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedFullReveal, setUsedFullReveal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, hintsUsed: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswered]);

  const handlePronounce = () => {
    if (currentCard) {
      playPronunciation(currentCard.term_en);
    }
  };

  const handleGiveHint = () => {
    if (!currentCard || isAnswered) return;

    const target = currentCard.term_en.trim();
    const nextCount = Math.min(target.length, revealedCharsCount + 2);
    setRevealedCharsCount(nextCount);

    const hintSlice = target.slice(0, nextCount);
    setTypedInput(hintSlice);

    setStats((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFullReveal = async () => {
    if (!currentCard || isAnswered || isSubmitting) return;

    setUsedFullReveal(true);
    setTypedInput(currentCard.term_en);
    setIsCorrect(false);
    setIsAnswered(true);
    setIsSubmitting(true);

    try {
      await onReviewSubmitted(currentCard.id, false);
      setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentCard || isAnswered || isSubmitting || !typedInput.trim()) return;

    const target = currentCard.term_en;
    const correct = checkSmartMatch(typedInput, target, "en");

    setIsCorrect(correct);
    setIsAnswered(true);
    setIsSubmitting(true);

    try {
      await onReviewSubmitted(currentCard.id, correct);
      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        hintsUsed: prev.hintsUsed,
      }));
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setTypedInput("");
      setRevealedCharsCount(0);
      setIsAnswered(false);
      setIsCorrect(null);
      setUsedFullReveal(false);
    } else {
      setSessionCompleted(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted) return;

      if (e.key === "Enter") {
        if (isAnswered) {
          handleNext();
        } else if (typedInput.trim()) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, typedInput, sessionCompleted, currentIndex]);

  if (!currentCard) return null;

  if (sessionCompleted) {
    const total = stats.correct + stats.wrong;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 100;

    return (
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6 border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(239,35,60,0.3)] flex items-center justify-center mx-auto text-[#ef233c]">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-white">
            Yozma Mashq Yakunlandi!
          </h2>
          <p className="text-sm font-inter text-zinc-400">
            Jami {total} ta akademik so&apos;z yozib mashq qilindi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <div className="text-2xl font-bold font-manrope text-emerald-300">{stats.correct}</div>
            <div className="text-xs text-zinc-400 mt-1">To&apos;g&apos;ri</div>
          </div>
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40">
            <div className="text-2xl font-bold font-manrope text-red-300">{stats.wrong}</div>
            <div className="text-xs text-zinc-400 mt-1">Xato</div>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold font-manrope text-white">{accuracy}%</div>
            <div className="text-xs text-zinc-400 mt-1">Aniqlik</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setTypedInput("");
              setRevealedCharsCount(0);
              setIsAnswered(false);
              setIsCorrect(null);
              setUsedFullReveal(false);
              setStats({ correct: 0, wrong: 0, hintsUsed: 0 });
            }}
            className="shiny-cta py-3 px-6"
          >
            <span className="relative z-10 flex items-center gap-2 text-white font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-[#ef233c]" />
              <span>Qaytadan Boshlash</span>
            </span>
          </button>
        </div>
      </GlassCard>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress & Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            So&apos;z {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
            Inglizcha atamani yozing
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.6)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card: Target Uzbek Definition and Example */}
      <GlassCard padding="xl" className="text-center space-y-6 border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase tracking-wider">
            {deck.level || "C1"} • O&apos;zbekcha Ma&apos;no
          </span>
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
            Uzunligi: <span className="font-bold text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">{currentCard.term_en.length}</span> harf
          </div>
        </div>

        {/* Prompt Uzbek Meaning */}
        <div className="space-y-3 py-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-white leading-relaxed">
            {currentCard.meaning_uz}
          </h2>

          {currentCard.example_en && (
            <p className="text-xs sm:text-sm text-zinc-400 italic max-w-lg mx-auto bg-white/[0.02] p-3 rounded-xl border-l-2 border-[#ef233c] font-inter">
              &ldquo;
              {currentCard.example_en.replace(
                new RegExp(`\\b${currentCard.term_en}\\b`, "gi"),
                "________"
              )}
              &rdquo;
            </p>
          )}
        </div>

        {/* Typing Input */}
        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Inglizcha so'zni yozing..."
              className={`w-full px-5 py-4 rounded-xl border outline-none text-xl text-center font-bold font-manrope tracking-wider transition-all ${
                isAnswered
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                    : "border-[#ef233c] bg-red-950/40 text-red-300"
                  : "border-white/10 bg-zinc-950/80 text-white focus:border-[#ef233c] placeholder:text-zinc-500"
              }`}
            />
          </div>

          {/* Action Buttons: Hint (+Harf) and Reveal (Javobni ko'rish) */}
          {!isAnswered ? (
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleGiveHint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all cursor-pointer"
                title="2 ta harfni ochish"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>+Harf (Hint)</span>
              </button>

              <button
                type="button"
                onClick={handleFullReveal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-medium text-xs transition-all cursor-pointer"
                title="To'liq javobni ko'rish"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Javobni ko&apos;rish</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!typedInput.trim()}
                className="px-5 py-2 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,35,60,0.4)] disabled:opacity-40 transition cursor-pointer"
              >
                <span>Tekshirish [Enter]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </GlassCard>

      {/* Answer Feedback Banner */}
      {isAnswered && (
        <GlassCard
          padding="lg"
          className={`border transition-all animate-in fade-in duration-300 ${
            isCorrect ? "bg-emerald-950/40 border-emerald-500/40" : "bg-red-950/40 border-red-500/40"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-manrope">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    To&apos;g&apos;ri yozildi! (+1 SRS)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold font-manrope">
                    <XCircle className="w-4 h-4 text-red-400" />
                    {usedFullReveal ? "Javob ko'rildi (0-qutiga qaytdi)" : "Xato yozildi (0-qutiga qaytdi)"}
                  </span>
                )}
              </div>

              <div className="pt-1 flex items-center gap-3">
                <span className="text-xl font-bold font-manrope text-white">
                  {currentCard.term_en}
                </span>
                <button
                  onClick={handlePronounce}
                  className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
                  title="Talaffuzni tinglash"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-zinc-500">→</span>
                <span className="text-emerald-400 font-medium text-sm">{currentCard.meaning_uz}</span>
              </div>

              {currentCard.example_en && (
                <p className="text-xs text-zinc-400 italic mt-1 leading-relaxed border-l-2 border-white/20 pl-2 font-inter">
                  &ldquo;{currentCard.example_en}&rdquo;
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              className="shrink-0 px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.4)] transition cursor-pointer"
            >
              <span>Keyingi So&apos;z [Enter]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
