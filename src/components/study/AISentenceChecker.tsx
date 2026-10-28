"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Volume2, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  Check, 
  Wand2, 
  Trophy, 
  PenLine 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
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
      <GlassCard padding="xl" className="text-center py-12 max-w-xl mx-auto space-y-6 border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(239,35,60,0.3)] flex items-center justify-center mx-auto text-[#ef233c]">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-manrope text-white">
            AI Writing Sessiyasi Yakunlandi!
          </h2>
          <p className="text-sm font-inter text-zinc-400">
            Jami {scoresHistory.length} ta murakkab ibora bilan IELTS akademik gaplari tuzildi.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-xs mx-auto">
          <div className="text-3xl font-bold font-manrope text-[#ef233c]">{avgScore} / 10</div>
          <div className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-wider">
            O&apos;rtacha IELTS Band Bahosi
          </div>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setUserSentence("");
              setEvalResult(null);
              setScoresHistory([]);
            }}
            className="shiny-cta py-3 px-6"
          >
            <span className="relative z-10 flex items-center gap-2 text-white font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-[#ef233c]" />
              <span>Qaytadan Mashq Qilish</span>
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
            Ibora {currentIndex + 1} / {cards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#ef233c]" />
            AI Writing Tahlili
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.6)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Target Phrase Prompt Card */}
      <GlassCard padding="xl" className="text-center space-y-5 border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase tracking-wider">
            {deck.level || "C1"} Target Collocation
          </span>
          <button
            onClick={handlePronounce}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
            title="Talaffuzni tinglash"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Term & Uzbek Meaning */}
        <div className="space-y-2 py-2">
          <h2 className="text-3xl sm:text-4xl font-bold font-manrope text-white tracking-tight">
            &ldquo;{currentCard.term_en}&rdquo;
          </h2>
          <p className="text-base font-medium text-zinc-300 font-inter">
            {currentCard.meaning_uz}
          </p>
          {currentCard.synonyms && (
            <div className="mt-1">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 inline-block">
                Sinonimlar: {currentCard.synonyms}
              </span>
            </div>
          )}
        </div>

        {/* Instruction */}
        <p className="text-xs text-zinc-300 flex items-center justify-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 font-inter">
          <PenLine className="w-4 h-4 text-[#ef233c] shrink-0" />
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
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-950/80 outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 focus:border-[#ef233c] transition-all leading-relaxed resize-none font-inter"
          />

          {!evalResult && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!userSentence.trim() || isEvaluating}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm shadow-[0_0_20px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer"
              >
                <span>{isEvaluating ? "Tahlil qilinmoqda..." : "AI Bilan Tekshirish"}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* AI Evaluation Feedback Card */}
      {evalResult && (
        <GlassCard
          padding="lg"
          className={`border space-y-4 animate-in fade-in duration-300 ${
            evalResult.score >= 7 ? "bg-emerald-950/30 border-emerald-500/40" : "bg-zinc-900/80 border-white/15"
          }`}
        >
          {/* Header Score & Indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-xl font-bold font-manrope text-sm border ${
                  evalResult.score >= 8
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : evalResult.score >= 6
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                }`}
              >
                Baholash: {evalResult.score} / 10
              </div>

              <div className="flex items-center gap-2 text-xs">
                {evalResult.grammar_correct && (
                  <span className="flex items-center gap-1 text-emerald-300 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Grammatika to&apos;g&apos;ri
                  </span>
                )}
                {evalResult.natural_usage && (
                  <span className="flex items-center gap-1 text-cyan-300 font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tabiiy kollokatsiya
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,35,60,0.4)] transition cursor-pointer"
            >
              <span>Keyingi Ibora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback in Uzbek */}
          <div className="space-y-1">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Tahlil va Tavsiya (O&apos;zbek tilida):
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 font-medium leading-relaxed font-inter">
              {evalResult.feedback_uz}
            </p>
          </div>

          {/* Improved C1 Sentence Suggestion */}
          {evalResult.improved_sentence && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ef233c]" />
                  Tavsiya etilgan Band 8.5+ C1 namunasi:
                </span>
                <button
                  onClick={handleCopyImproved}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs cursor-pointer transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa olish</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-medium italic leading-relaxed font-inter">
                &ldquo;{evalResult.improved_sentence}&rdquo;
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
