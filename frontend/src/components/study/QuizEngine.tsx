"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Volume2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle,
  Trophy, 
  Shuffle, 
  PenLine, 
  ListChecks,
  Languages
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
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

  // Determine question type for mixed mode
  const currentQuestionType = useMemo(() => {
    if (mode === "mcq") return "mcq";
    if (mode === "written") return "written";
    // Mixed: alternates or picks based on index
    return currentIndex % 2 === 0 ? "mcq" : "written";
  }, [mode, currentIndex]);

  // Generate 4 randomized options for MCQ
  const mcqOptions = useMemo(() => {
    if (!currentCard || cards.length < 2) return [];

    const isEnToUz = direction === "en_to_uz";
    const correctAnswer = isEnToUz ? currentCard.meaning_uz : currentCard.term_en;

    // Pick 3 distractors from other cards
    const distractors = cards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => (isEnToUz ? c.meaning_uz : c.term_en))
      .filter((v, i, arr) => arr.indexOf(v) === i); // unique

    // Shuffle distractors and pick 3
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correctAnswer, ...shuffledDistractors];

    // Shuffle combined options
    return combined.sort(() => 0.5 - Math.random());
  }, [currentCard, cards, direction, currentIndex]);

  // Trigger audio pronunciation
  const handlePronounce = (term?: string) => {
    playPronunciation(term || currentCard?.term_en || "");
  };

  // Submit answer
  const handleSubmitAnswer = async (givenAnswer: string, optionIdx?: number) => {
    if (isAnswered || !currentCard || isSubmitting) return;

    if (optionIdx !== undefined) {
      setSelectedOption(optionIdx);
    }

    const isEnToUz = direction === "en_to_uz";
    const targetText = isEnToUz ? currentCard.meaning_uz : currentCard.term_en;
    const targetLang = isEnToUz ? "uz" : "en";

    // Validate using checkSmartMatch
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

  // Next Question
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

  // Keyboard navigation: Enter to submit written / advance
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

  // Session Completed Screen
  if (sessionCompleted) {
    const total = stats.correct + stats.wrong;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 100;

    return (
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-[#FFCC00] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto text-black">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Quiz Yakunlandi!
          </h2>
          <p className="text-sm font-bold text-black/70">
            {deck.title} to&apos;plamidan {total} ta so&apos;z sinovdan o&apos;tkazildi.
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
          <div className="p-3.5 rounded-xl bg-[#00E5FF] border-2 border-black shadow-[2px_2px_0px_#000]">
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
              setIsAnswered(false);
              setIsCorrect(null);
              setSelectedOption(null);
              setWrittenInput("");
              setStats({ correct: 0, wrong: 0 });
            }}
            leftIcon={<RotateCcw className="w-4 h-4 mr-1.5" />}
          >
            Qaytadan Boshlash
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  const promptText = direction === "en_to_uz" ? currentCard.term_en : currentCard.meaning_uz;
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode & Direction Selectors Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
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
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center justify-center gap-1.5 ${
                  isActive
                    ? "bg-[#FFCC00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                    : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Direction Selector */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => {
              setDirection("en_to_uz");
              setIsAnswered(false);
              setSelectedOption(null);
              setWrittenInput("");
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center justify-center gap-1.5 ${
              direction === "en_to_uz"
                ? "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-black" />
            <span>EN → UZ</span>
          </button>
          <button
            onClick={() => {
              setDirection("uz_to_en");
              setIsAnswered(false);
              setSelectedOption(null);
              setWrittenInput("");
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black transition-all inline-flex items-center justify-center gap-1.5 ${
              direction === "uz_to_en"
                ? "bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black hover:bg-[#F4EFEA] border-2 border-transparent"
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-black" />
            <span>UZ → EN</span>
          </button>
        </div>
      </div>

      {/* Progress Counter & Striped Ruler Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-black">
          <span>
            Savol {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-black bg-yellow-200 text-black uppercase shadow-[1px_1px_0px_#000]">
            {currentQuestionType === "mcq" ? "Variantni tanlang" : "Javobni yozing"}
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] p-0.5">
          <div
            className="h-full bg-[#FFCC00] border-r-2 border-black rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <GlassCard padding="xl" className="text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            {deck.level || "C1"} • {direction === "en_to_uz" ? "Inglizcha so'z" : "O'zbekcha ma'no"}
          </span>
          {direction === "en_to_uz" && (
            <button
              onClick={() => handlePronounce()}
              className="p-2 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="Talaffuzni tinglash"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Prompt */}
        <div className="py-6">
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-snug">
            {promptText}
          </h2>
          {direction === "en_to_uz" && currentCard.synonyms && (
            <div className="mt-3">
              <span className="px-3 py-1 rounded-lg border border-black/30 bg-[#F4EFEA] text-xs font-mono text-black inline-block">
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

              let btnStyle = "bg-[#FFFDF9] hover:bg-[#FEF08A] border-2 border-black text-black shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#000] hover:-translate-y-0.5";

              if (isAnswered) {
                if (isTarget) {
                  btnStyle = "bg-[#A3E635] border-2 border-black text-black font-black shadow-[4px_4px_0px_#000]";
                } else if (isSelected && !isTarget) {
                  btnStyle = "bg-[#FF8080] border-2 border-black text-black font-black shadow-[4px_4px_0px_#000]";
                } else {
                  btnStyle = "opacity-40 border-2 border-black/30 bg-zinc-100 text-black/50 shadow-none";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSubmitAnswer(opt, idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-xl text-sm font-bold text-left transition-all duration-150 flex items-start gap-3 select-none cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-black shrink-0 shadow-[1px_1px_0px_#333]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed flex-1 text-black font-bold">{opt}</span>
                  {isAnswered && isTarget && (
                    <CheckCircle2 className="w-5 h-5 text-black shrink-0 ml-auto" />
                  )}
                  {isAnswered && isSelected && !isTarget && (
                    <XCircle className="w-5 h-5 text-black shrink-0 ml-auto" />
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
                className={`w-full px-5 py-3.5 rounded-xl border-2 outline-none text-base font-bold text-black placeholder-zinc-500 transition-all ${
                  isAnswered
                    ? isCorrect
                      ? "border-black bg-[#A3E635] shadow-[3px_3px_0px_#000]"
                      : "border-black bg-[#FF8080] shadow-[3px_3px_0px_#000]"
                    : "border-black bg-white shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000]"
                }`}
              />
            </div>

            {!isAnswered && (
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => handleSubmitAnswer(writtenInput)}
                disabled={!writtenInput.trim()}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
              >
                Tekshirish [Enter]
              </GlassButton>
            )}
          </div>
        )}
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
                    To&apos;g&apos;ri javob! (+1 SRS)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-black bg-[#FF8080] text-black text-xs font-black shadow-[1px_1px_0px_#000]">
                    <XCircle className="w-4 h-4 text-black" />
                    Xato javob (0-qutiga qaytdi)
                  </span>
                )}
              </div>

              {/* Correct Dictionary Entry */}
              <div className="pt-1">
                <div className="text-base font-black text-black flex items-center gap-2">
                  <span>{currentCard.term_en}</span>
                  <span className="text-black/50">→</span>
                  <span className="text-emerald-700 underline">{currentCard.meaning_uz}</span>
                </div>
                {currentCard.example_en && (
                  <p className="text-xs text-black/80 italic mt-1 leading-relaxed border-l-2 border-black/40 pl-2">
                    &ldquo;{currentCard.example_en}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <GlassButton
              variant="ai"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}
              className="shrink-0"
            >
              Keyingi Savol [Enter]
            </GlassButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
