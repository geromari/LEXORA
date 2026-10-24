"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Volume2, 
  Lightbulb, 
  Eye, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
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
    // Autofocus input when index changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswered]);

  // Pronunciation
  const handlePronounce = () => {
    if (currentCard) {
      playPronunciation(currentCard.term_en);
    }
  };

  // +Harf (Hint) button: Reveals 2 characters at a time
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

  // Javobni ko'rish (Full Reveal)
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

  // Submit Typing Answer
  const handleSubmit = async () => {
    if (!currentCard || isAnswered || isSubmitting || !typedInput.trim()) return;

    const target = currentCard.term_en;
    // Check match using smartMatch (ignores leading "to ", handles case and hyphens)
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

  // Next Card
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

  // Keyboard navigation: Enter
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
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-[#A3E635] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto text-black">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Yozma Mashq Yakunlandi!
          </h2>
          <p className="text-sm font-bold text-black/70">
            Jami {total} ta akademik so&apos;z yozib mashq qilindi.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#A3E635] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{stats.correct}</div>
            <div className="text-xs font-bold text-black/80 mt-1">To&apos;g&apos;ri</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FF8080] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{stats.wrong}</div>
            <div className="text-xs font-bold text-black/80 mt-1">Xato</div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FFCC00] border-2 border-black shadow-[2px_2px_0px_#000]">
            <div className="text-2xl font-black text-black">{accuracy}%</div>
            <div className="text-xs font-bold text-black/80 mt-1">Aniqlik</div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <GlassButton
            variant="ai"
            size="md"
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
            leftIcon={<RotateCcw className="w-4 h-4 mr-1.5" />}
          >
            Qaytadan Boshlash
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress & Counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-black">
          <span>
            So&apos;z {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-black bg-yellow-200 text-black uppercase shadow-[1px_1px_0px_#000]">
            Inglizcha atamani yozing
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] p-0.5">
          <div
            className="h-full bg-[#A3E635] border-r-2 border-black rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card: Target Uzbek Definition and Example */}
      <GlassCard padding="xl" className="text-center space-y-6">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            {deck.level || "C1"} • O&apos;zbekcha Ma&apos;no
          </span>
          <div className="text-xs font-bold text-black/70 flex items-center gap-1">
            Uzunligi: <span className="font-mono font-black text-black px-1.5 py-0.5 rounded bg-white border border-black shadow-[1px_1px_0px_#000]">{currentCard.term_en.length}</span> harf
          </div>
        </div>

        {/* Prompt Uzbek Meaning */}
        <div className="space-y-3 py-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black leading-relaxed">
            {currentCard.meaning_uz}
          </h2>

          {currentCard.example_en && (
            <p className="text-xs sm:text-sm text-black italic max-w-lg mx-auto bg-[#F4EFEA] p-3 rounded-xl border-2 border-black/20 shadow-[2px_2px_0px_#000]">
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
              className={`w-full px-5 py-4 rounded-xl border-2 outline-none text-xl text-center font-black tracking-wider transition-all ${
                isAnswered
                  ? isCorrect
                    ? "border-black bg-[#A3E635] text-black shadow-[3px_3px_0px_#000]"
                    : "border-black bg-[#FF8080] text-black shadow-[3px_3px_0px_#000]"
                  : "border-black bg-white text-black shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] placeholder-zinc-400"
              }`}
            />
          </div>

          {/* Action Buttons: Hint (+Harf) and Reveal (Javobni ko'rish) */}
          {!isAnswered ? (
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleGiveHint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-black bg-[#FFCC00] text-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                title="2 ta harfni ochish"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>+Harf (Hint)</span>
              </button>

              <button
                type="button"
                onClick={handleFullReveal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-black bg-white text-black font-bold text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                title="To'liq javobni ko'rish"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Javobni ko&apos;rish</span>
              </button>

              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={!typedInput.trim()}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Tekshirish [Enter]
              </GlassButton>
            </div>
          ) : null}
        </div>
      </GlassCard>

      {/* Answer Feedback Banner */}
      {isAnswered && (
        <GlassCard
          padding="lg"
          className={`border-2 border-black shadow-[4px_4px_0px_#000] transition-all animate-in fade-in duration-300 ${
            isCorrect ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black bg-[#A3E635] text-black text-xs font-black shadow-[1px_1px_0px_#000]">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    To&apos;g&apos;ri yozildi! (+1 SRS)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black bg-[#FF8080] text-black text-xs font-black shadow-[1px_1px_0px_#000]">
                    <XCircle className="w-4 h-4 text-black" />
                    {usedFullReveal ? "Javob ko'rildi (0-qutiga qaytdi)" : "Xato yozildi (0-qutiga qaytdi)"}
                  </span>
                )}
              </div>

              <div className="pt-1 flex items-center gap-3">
                <span className="text-xl font-black text-black">
                  {currentCard.term_en}
                </span>
                <button
                  onClick={handlePronounce}
                  className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[1px_1px_0px_#000] transition-all cursor-pointer"
                  title="Talaffuzni tinglash"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-black/50">→</span>
                <span className="text-black font-bold text-sm">{currentCard.meaning_uz}</span>
              </div>

              {currentCard.example_en && (
                <p className="text-xs text-black/80 italic mt-1 leading-relaxed border-l-2 border-black/40 pl-2">
                  &ldquo;{currentCard.example_en}&rdquo;
                </p>
              )}
            </div>

            <GlassButton
              variant="ai"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
              className="shrink-0"
            >
              Keyingi So&apos;z [Enter]
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
