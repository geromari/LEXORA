"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Trophy, 
  PenLine, 
  ListChecks,
  Languages
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Card, DeckDetail } from "@/lib/api";
import { checkSmartMatch } from "@/lib/smartMatch";
import { playPronunciation } from "@/lib/speech";

interface QuizEngineProps {
  deck: DeckDetail;
  cards: Card[];
  onReviewSubmitted: (cardId: number, correct: boolean) => Promise<any>;
}

export function QuizEngine({
  deck,
  cards,
  onReviewSubmitted,
}: QuizEngineProps) {
  // Settings
  const [mode, setMode] = useState<"mcq" | "written" | "mixed">("mixed");
  const [direction, setDirection] = useState<"en_to_uz" | "uz_to_en">("en_to_uz");

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [writtenInput, setWrittenInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const currentCard = cards[currentIndex];

  const currentQuestionType = useMemo(() => {
    if (mode === "mcq") return "mcq";
    if (mode === "written") return "written";
    return currentIndex % 2 === 0 ? "mcq" : "written";
  }, [mode, currentIndex]);

  const mcqOptions = useMemo(() => {
    if (!currentCard || cards.length < 2) return [];

    const isEnToUz = direction === "en_to_uz";
    const correctAnswer = isEnToUz ? currentCard.meaning_uz : currentCard.term_en;

    const distractors = cards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => (isEnToUz ? c.meaning_uz : c.term_en))
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correctAnswer, ...shuffledDistractors];

    return combined.sort(() => 0.5 - Math.random());
  }, [currentCard, cards, direction, currentIndex]);

  const handlePronounce = (term?: string) => {
    playPronunciation(term || currentCard?.term_en || "");
  };

  const handleSubmitAnswer = async (givenAnswer: string, optionIdx?: number) => {
    if (isAnswered || !currentCard || isSubmitting) return;

    if (optionIdx !== undefined) {
      setSelectedOption(optionIdx);
    }

    const isEnToUz = direction === "en_to_uz";
    const targetText = isEnToUz ? currentCard.meaning_uz : currentCard.term_en;
    const targetLang = isEnToUz ? "uz" : "en";

    const correct =
      optionIdx !== undefined
        ? givenAnswer.trim() === targetText.trim()
        : checkSmartMatch(givenAnswer, targetText, targetLang);

    setIsCorrect(correct);
    setIsAnswered(true);
    setIsSubmitting(true);

    try {
      await onReviewSubmitted(currentCard.id, correct);
      setStats((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
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
      setIsAnswered(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setWrittenInput("");
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
        } else if (currentQuestionType === "written" && writtenInput.trim()) {
          handleSubmitAnswer(writtenInput);
        }
      } else if (!isAnswered && currentQuestionType === "mcq" && ["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < mcqOptions.length) {
          handleSubmitAnswer(mcqOptions[idx], idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAnswered, sessionCompleted, currentQuestionType, writtenInput, mcqOptions, currentIndex]);

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
            Quiz Yakunlandi!
          </h2>
          <p className="text-sm font-inter text-zinc-400">
            {deck.title} to&apos;plamidan {total} ta so&apos;z sinovdan o&apos;tkazildi.
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
              setIsAnswered(false);
              setIsCorrect(null);
              setSelectedOption(null);
              setWrittenInput("");
              setStats({ correct: 0, wrong: 0 });
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

  const promptText = direction === "en_to_uz" ? currentCard.term_en : currentCard.meaning_uz;
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode & Direction Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {[
            { id: "mcq", label: "Variantli", icon: ListChecks },
            { id: "written", label: "Yozma", icon: PenLine },
            { id: "mixed", label: "50/50 Aralash", icon: Sparkles },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id as any);
                  setIsAnswered(false);
                  setSelectedOption(null);
                  setWrittenInput("");
                }}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold font-manrope transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Direction Selector */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => {
              setDirection("en_to_uz");
              setIsAnswered(false);
              setSelectedOption(null);
              setWrittenInput("");
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold font-manrope transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              direction === "en_to_uz"
                ? "bg-white/15 text-white border border-white/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>EN → UZ</span>
          </button>
          <button
            onClick={() => {
              setDirection("uz_to_en");
              setIsAnswered(false);
              setSelectedOption(null);
              setWrittenInput("");
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold font-manrope transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              direction === "uz_to_en"
                ? "bg-white/15 text-white border border-white/20"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>UZ → EN</span>
          </button>
        </div>
      </div>

      {/* Progress Counter & Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            Savol {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
            {currentQuestionType === "mcq" ? "Variantni tanlang" : "Javobni yozing"}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.6)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <GlassCard padding="xl" className="text-center relative overflow-hidden border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase tracking-wider">
            {deck.level || "C1"} • {direction === "en_to_uz" ? "Inglizcha so'z" : "O'zbekcha ma'no"}
          </span>
          {direction === "en_to_uz" && (
            <button
              onClick={() => handlePronounce()}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
              title="Talaffuzni tinglash"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Prompt */}
        <div className="py-6">
          <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-white tracking-tight leading-snug">
            {promptText}
          </h2>
          {direction === "en_to_uz" && currentCard.synonyms && (
            <div className="mt-3">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 inline-block">
                Sinonimlar: {currentCard.synonyms}
              </span>
            </div>
          )}
        </div>

        {/* Interaction Area: MCQ Options OR Written Input */}
        {currentQuestionType === "mcq" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
            {mcqOptions.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isTarget =
                opt.trim() ===
                (direction === "en_to_uz"
                  ? currentCard.meaning_uz.trim()
                  : currentCard.term_en.trim());

              let btnStyle = "bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-[#ef233c]/50";

              if (isAnswered) {
                if (isTarget) {
                  btnStyle = "bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                } else if (isSelected && !isTarget) {
                  btnStyle = "bg-red-950/60 border border-[#ef233c] text-red-300 font-bold shadow-[0_0_20px_rgba(239,35,60,0.3)]";
                } else {
                  btnStyle = "opacity-30 border border-white/5 bg-black/40 text-zinc-500";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSubmitAnswer(opt, idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl text-sm font-medium text-left transition-all duration-150 flex items-start gap-3 select-none cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed flex-1 font-inter">{opt}</span>
                  {isAnswered && isTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-auto" />
                  )}
                  {isAnswered && isSelected && !isTarget && (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Written Mode */
          <div className="max-w-lg mx-auto pt-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={writtenInput}
                onChange={(e) => setWrittenInput(e.target.value)}
                disabled={isAnswered}
                autoFocus
                placeholder={
                  direction === "en_to_uz"
                    ? "O'zbekcha tarjimasini kiriting..."
                    : "Inglizcha so'zni yozing..."
                }
                className={`w-full px-5 py-3.5 rounded-xl border outline-none text-base font-medium text-white placeholder:text-zinc-500 transition-all font-inter ${
                  isAnswered
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                      : "border-[#ef233c] bg-red-950/40 text-red-300"
                    : "border-white/10 bg-zinc-950/80 focus:border-[#ef233c]"
                }`}
              />
            </div>

            {!isAnswered && (
              <button
                type="button"
                onClick={() => handleSubmitAnswer(writtenInput)}
                disabled={!writtenInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.4)] disabled:opacity-40 transition cursor-pointer"
              >
                <span>Tekshirish [Enter]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </GlassCard>

      {/* Answer Feedback Banner */}
      {isAnswered && (
        <GlassCard
          padding="lg"
          className={`border transition-all animate-in fade-in duration-300 ${
            isCorrect
              ? "bg-emerald-950/40 border-emerald-500/40"
              : "bg-red-950/40 border-red-500/40"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-manrope">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    To&apos;g&apos;ri javob! (+1 SRS)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold font-manrope">
                    <XCircle className="w-4 h-4 text-red-400" />
                    Xato javob (0-qutiga qaytdi)
                  </span>
                )}
              </div>

              {/* Correct Dictionary Entry */}
              <div className="pt-1">
                <div className="text-base font-bold font-manrope text-white flex items-center gap-2">
                  <span>{currentCard.term_en}</span>
                  <span className="text-zinc-500">→</span>
                  <span className="text-emerald-400 underline">{currentCard.meaning_uz}</span>
                </div>
                {currentCard.example_en && (
                  <p className="text-xs text-zinc-400 italic mt-1 leading-relaxed border-l-2 border-white/20 pl-2 font-inter">
                    &ldquo;{currentCard.example_en}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="shrink-0 px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.4)] transition cursor-pointer"
            >
              <span>Keyingi Savol [Enter]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
