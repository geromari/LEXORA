"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Volume2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Wand2,
  Trophy,
  BrainCircuit,
  PenLine
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Card, DeckDetail, CheckSentenceResponse, api } from "@/lib/api";
import { playPronunciation } from "@/lib/speech";

interface AISentenceCheckerProps {
  deck: DeckDetail;
  cards: Card[];
  onReviewSubmitted: (cardId: number, correct: boolean) => Promise<any>;
}

export function AISentenceChecker({
  deck,
  cards,
  onReviewSubmitted,
}: AISentenceCheckerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSentence, setUserSentence] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<CheckSentenceResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [scoresHistory, setScoresHistory] = useState<number[]>([]);

  const currentCard = cards[currentIndex];

  const handlePronounce = () => {
    if (currentCard) {
      playPronunciation(currentCard.term_en);
    }
  };

  const handleEvaluate = async () => {
    if (!currentCard || !userSentence.trim() || isEvaluating) return;

    try {
      setIsEvaluating(true);
      const res = await api.checkSentence({
        target_term: currentCard.term_en,
        sentence: userSentence.trim(),
        deck_title: deck.title,
      });

      setEvalResult(res);
      setScoresHistory((prev) => [...prev, res.score]);

      // If score is 7 or higher, consider it mastered/correct for SRS
      const isPassed = res.score >= 7;
      await onReviewSubmitted(currentCard.id, isPassed);
    } catch (err: any) {
      console.error("Sentence evaluation failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserSentence("");
      setEvalResult(null);
      setCopied(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handleCopyImproved = () => {
    if (evalResult?.improved_sentence) {
      navigator.clipboard.writeText(evalResult.improved_sentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentCard) return null;

  if (sessionCompleted) {
    const avgScore =
      scoresHistory.length > 0
        ? Math.round(
            (scoresHistory.reduce((a, b) => a + b, 0) / scoresHistory.length) * 10
          ) / 10
        : 8.5;

    return (
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-[#FA5A2A] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto text-white">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            AI Writing Sessiyasi Yakunlandi!
          </h2>
          <p className="text-sm font-bold text-black/70">
            Jami {scoresHistory.length} ta murakkab ibora bilan IELTS akademik gaplari tuzildi.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFCC00] border-2 border-black shadow-[3px_3px_0px_#000] max-w-xs mx-auto">
          <div className="text-3xl font-black text-black">{avgScore} / 10</div>
          <div className="text-xs font-black text-black/80 mt-1 uppercase tracking-wider">O&apos;rtacha IELTS Band Bahosi</div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <GlassButton
            variant="ai"
            size="md"
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setUserSentence("");
              setEvalResult(null);
              setScoresHistory([]);
            }}
            leftIcon={<RotateCcw className="w-4 h-4 mr-1.5" />}
          >
            Qaytadan Mashq Qilish
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
            Ibora {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-black bg-yellow-200 text-black uppercase shadow-[1px_1px_0px_#000] flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" />
            AI Writing Tahlili
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] p-0.5">
          <div
            className="h-full bg-[#FA5A2A] border-r-2 border-black rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Target Phrase Prompt Card */}
      <GlassCard padding="xl" className="text-center space-y-5">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            {deck.level || "C1"} Target Collocation
          </span>
          <button
            onClick={handlePronounce}
            className="p-2 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            title="Talaffuzni tinglash"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Term & Uzbek Meaning */}
        <div className="space-y-2 py-2">
          <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            &ldquo;{currentCard.term_en}&rdquo;
          </h2>
          <p className="text-base font-bold text-black/80">
            {currentCard.meaning_uz}
          </p>
          {currentCard.synonyms && (
            <div className="mt-1">
              <span className="px-3 py-1 rounded-lg border border-black/30 bg-[#F4EFEA] text-xs font-mono text-black inline-block">
                Sinonimlar: {currentCard.synonyms}
              </span>
            </div>
          )}
        </div>

        {/* Instruction */}
        <p className="text-xs text-black font-black flex items-center justify-center gap-1.5 bg-[#FEF08A] p-2.5 rounded-xl border border-black/30">
          <PenLine className="w-4 h-4 text-black shrink-0" />
          <span>Ushbu so&apos;z yoki iborani qatnashtirib IELTS darajasidagi akademik gap tuzing:</span>
        </p>

        {/* Input Textarea */}
        <div className="space-y-3">
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            disabled={evalResult !== null || isEvaluating}
            rows={3}
            placeholder={`Masalan: In modern society, multinational corporations wield outsized influence over...`}
            className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white outline-none text-xs sm:text-sm font-bold text-black placeholder-zinc-500 shadow-[3px_3px_0px_#000] focus:shadow-[4px_4px_0px_#000] transition-all leading-relaxed resize-none"
          />

          {!evalResult && (
            <div className="flex items-center justify-end">
              <GlassButton
                variant="ai"
                size="md"
                onClick={handleEvaluate}
                isLoading={isEvaluating}
                disabled={!userSentence.trim() || isEvaluating}
                rightIcon={<Send className="w-4 h-4 ml-1.5" />}
                className="w-full sm:w-auto"
              >
                AI Bilan Tekshirish
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>

      {/* AI Evaluation Feedback Card */}
      {evalResult && (
        <GlassCard
          padding="lg"
          className={`border-2 border-black shadow-[4px_4px_0px_#000] space-y-4 animate-in fade-in duration-300 ${
            evalResult.score >= 7 ? "bg-[#DCFCE7]" : "bg-[#FEF3C7]"
          }`}
        >
          {/* Header Score & Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/20">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-xl font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000] ${
                  evalResult.score >= 8
                    ? "bg-[#A3E635] text-black"
                    : evalResult.score >= 6
                    ? "bg-[#FFCC00] text-black"
                    : "bg-[#FF8080] text-black"
                }`}
              >
                Baholash: {evalResult.score} / 10
              </div>

              <div className="flex items-center gap-2 text-xs">
                {evalResult.grammar_correct && (
                  <span className="flex items-center gap-1 text-black font-black px-2 py-0.5 rounded border border-black bg-[#A3E635]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    Grammatika to&apos;g&apos;ri
                  </span>
                )}
                {evalResult.natural_usage && (
                  <span className="flex items-center gap-1 text-black font-black px-2 py-0.5 rounded border border-black bg-[#00E5FF]">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    Tabiiy kollokatsiya
                  </span>
                )}
              </div>
            </div>

            <GlassButton
              variant="ai"
              size="sm"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
            >
              Keyingi Ibora
            </GlassButton>
          </div>

          {/* Feedback in Uzbek */}
          <div className="space-y-1">
            <div className="text-xs font-black text-black uppercase tracking-wider">
              Tahlil va Tavsiya (O&apos;zbek tilida):
            </div>
            <p className="text-xs sm:text-sm text-black font-bold leading-relaxed">
              {evalResult.feedback_uz}
            </p>
          </div>

          {/* Improved C1 Sentence Suggestion */}
          {evalResult.improved_sentence && (
            <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tavsiya etilgan Band 8.5+ C1 namunasi:
                </span>
                <button
                  onClick={handleCopyImproved}
                  className="text-black font-bold hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa olish</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-black font-medium italic leading-relaxed font-sans">
                &ldquo;{evalResult.improved_sentence}&rdquo;
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
