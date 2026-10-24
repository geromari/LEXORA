"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Volume2, 
  RotateCcw, 
  XCircle, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Filter, 
  CheckCircle2, 
  CalendarCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { api, Card, DueCardsResponse } from "@/lib/api";

import { playPronunciation } from "@/lib/speech";
import { useAuth } from "@/context/AuthContext";

export default function ReviewArenaPage() {
  const { user, refreshUser } = useAuth();
  const [dueData, setDueData] = useState<DueCardsResponse | null>(null);
  const [activeQueueType, setActiveQueueType] = useState<"due" | "hardest" | "all">("due");
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [streakCount, setStreakCount] = useState(user?.streak_count || 4);
  const [streakIncremented, setStreakIncremented] = useState(false);
  const [queueFinished, setQueueFinished] = useState(false);

  // Sync daily streak from user profile or localStorage
  useEffect(() => {
    if (user) {
      setStreakCount(user.streak_count);
    } else if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("lexora_streak");
      if (savedStreak) {
        setStreakCount(Number(savedStreak));
      }
    }
  }, [user]);


  const fetchDueCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getDueCards(100);
      setDueData(res);

      let initial: Card[] = [];
      if (activeQueueType === "due") {
        initial = res.due_cards.length > 0 ? res.due_cards : res.hardest_cards;
      } else if (activeQueueType === "hardest") {
        initial = res.hardest_cards;
      } else {
        // Combined unique cards
        const seen = new Set<number>();
        initial = [...res.due_cards, ...res.hardest_cards].filter((c) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
      }

      setActiveCards(initial);
      setCurrentIndex(0);
      setIsFlipped(false);
      setQueueFinished(initial.length === 0);
    } catch (err) {
      console.error("Failed to load review cards:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeQueueType]);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  const currentCard = activeCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentCard) {
      playPronunciation(currentCard.term_en);
    }
  };

  // Submit Review and advance
  const handleReviewAnswer = async (correct: boolean) => {
    if (!currentCard || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.submitReview(currentCard.id, correct);

      setReviewedCount((prev) => prev + 1);

      // Check if queue completed
      if (currentIndex + 1 < activeCards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Queue finished! Increment daily streak
        setQueueFinished(true);
        if (!streakIncremented) {
          const newStreak = streakCount + 1;
          setStreakCount(newStreak);
          setStreakIncremented(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("lexora_streak", String(newStreak));
            localStorage.setItem("lexora_last_review", new Date().toISOString());
          }
          refreshUser();
        }

      }
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (queueFinished || !currentCard) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "1" && isFlipped) {
        e.preventDefault();
        handleReviewAnswer(false);
      } else if (e.key === "2" && isFlipped) {
        e.preventDefault();
        handleReviewAnswer(true);
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, queueFinished, currentCard]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-xl border-[3px] border-black border-t-transparent animate-spin bg-yellow-300" />
        <p className="text-sm font-black uppercase text-black">Takrorlash navbati tahlil qilinmoqda...</p>
      </div>
    );
  }

  // Queue Empty / Completed Screen
  if (queueFinished || activeCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-6">
        <GlassCard padding="xl" className="text-center py-14 space-y-6 relative overflow-hidden">
          <div className="w-20 h-20 rounded-2xl bg-[#FFCC00] border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto text-black">
            <Flame className="w-10 h-10 text-black fill-black" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-black bg-[#A3E635] text-black text-xs font-black shadow-[2px_2px_0px_#000]">
              <CalendarCheck className="w-3.5 h-3.5 text-black" />
              {reviewedCount > 0
                ? "Bugungi vazifa to'liq bajarildi!"
                : "Hozircha barcha so'zlar yangilangan!"}
            </div>
            <h2 className="text-3xl font-black text-black">
              Kunlik Seriya: {streakCount} Kun
            </h2>
            <p className="text-sm font-medium text-black/70 max-w-md mx-auto">
              {reviewedCount > 0
                ? "Barcha navbatdagi so'zlar takrorlandi. Interval takrorlash (SRS) algoritmi xotirangizni mustahkamladi."
                : "Bugungi SRS navbatida takrorlash uchun so'zlar qolmagan. Xotirangizni sinash uchun qiyin so'zlarni qayta ko'rishingiz mumkin."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-around max-w-sm mx-auto text-xs">
            <div>
              <div className="text-2xl font-black text-black">{reviewedCount}</div>
              <div className="text-black/60 font-bold mt-0.5">Takrorlangan so&apos;zlar</div>
            </div>
            <div className="w-0.5 h-8 bg-black/20" />
            <div>
              <div className="text-2xl font-black text-black">100%</div>
              <div className="text-black/60 font-bold mt-0.5">Navbat tozaligi</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveQueueType("all");
                fetchDueCards();
              }}
              className="text-xs font-black text-black hover:underline cursor-pointer"
            >
              Qiyin so&apos;zlarni yana bir bor ko&apos;rish
            </button>
            <span className="hidden sm:inline text-black/40">•</span>
            <Link href="/">
              <GlassButton variant="ai" size="md" rightIcon={<ArrowRight className="w-4 h-4 ml-1.5" />}>
                Bosh Sahifaga Qaytish
              </GlassButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / activeCards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] text-xs font-black text-black hover:bg-[#FFCC00] hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Bosh sahifa</span>
        </Link>

        {/* Daily Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#FFCC00] text-xs font-black text-black shadow-[2px_2px_0px_#000]">
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>{streakCount} kunlik seriya</span>
        </div>
      </div>

      {/* Queue Segment Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-black shadow-[3px_3px_0px_#000] w-full">
          <button
            onClick={() => setActiveQueueType("due")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeQueueType === "due"
                ? "bg-[#FFCC00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black border-2 border-transparent"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>Bugungi Navbat ({dueData?.total_due || 0})</span>
          </button>

          <button
            onClick={() => setActiveQueueType("hardest")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeQueueType === "hardest"
                ? "bg-[#FF8080] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                : "text-black/70 hover:text-black border-2 border-transparent"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-black" />
            <span>Eng Qiyin So&apos;zlar ({dueData?.total_hardest || 0})</span>
          </button>
        </div>
      </div>

      {/* Progress Counter & Striped Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-black">
          <span>
            So&apos;z {currentIndex + 1} / {activeCards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded border border-black bg-yellow-200 text-black uppercase shadow-[1px_1px_0px_#000]">
            {activeCards.length - currentIndex} ta karta qoldi
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-[2px_2px_0px_#000] p-0.5">
          <div
            className="h-full bg-[#FFCC00] border-r-2 border-black rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Retro Review Card */}
      <div
        className="w-full min-h-[380px] sm:min-h-[420px] perspective-[1200px] cursor-pointer select-none"
        onClick={handleFlip}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative [transform-style:preserve-3d]"
        >
          {/* FRONT */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-white border-[3px] border-black p-8 flex flex-col justify-between shadow-[6px_6px_0px_#000] [backface-visibility:hidden] absolute inset-0 ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-black" />
                Takrorlash Navbati
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
                title="Talaffuzni tinglash (A)"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
                {currentCard.term_en}
              </h2>
              {currentCard.progress && currentCard.progress.wrong_count > 0 && (
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 rounded-lg border border-black bg-[#FF8080] text-black text-xs font-black inline-flex items-center gap-1.5 shadow-[1px_1px_0px_#000]">
                    <AlertTriangle className="w-3.5 h-3.5 text-black" />
                    <span>Oldin {currentCard.progress.wrong_count} marta xato qilingan</span>
                  </span>
                </div>
              )}
            </div>

            <div className="text-center pt-4 border-t-2 border-black/10 text-xs font-bold text-black/70 flex items-center justify-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-black" />
              <span>Javobni ko&apos;rish uchun bosing yoki [Space]</span>
            </div>
          </div>

          {/* BACK */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-[#FEF9C3] border-[3px] border-black p-8 flex flex-col justify-between shadow-[6px_6px_0px_#000] [transform:rotateY(180deg)] [backface-visibility:hidden] absolute inset-0 ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
                O&apos;zbekcha Tarjima & Namunaviy Gap
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2 rounded-xl border-2 border-black bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center space-y-4">
              <div className="text-2xl sm:text-3xl font-black text-black leading-relaxed">
                {currentCard.meaning_uz}
              </div>

              {currentCard.synonyms && (
                <div className="mt-1">
                  <span className="px-3 py-1 rounded-lg border border-black/30 bg-[#F4EFEA] text-xs font-mono text-black inline-block">
                    Sinonimlar: {currentCard.synonyms}
                  </span>
                </div>
              )}

              {currentCard.example_en && (
                <div className="p-3.5 rounded-xl border-2 border-black bg-white text-xs sm:text-sm text-black italic leading-relaxed text-left max-w-lg mx-auto shadow-[2px_2px_0px_#000]">
                  &ldquo;{currentCard.example_en}&rdquo;
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-xs font-bold text-black/60">
              Qaytadan aylantirish uchun bosing
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decision Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <GlassButton
          variant="danger"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleReviewAnswer(false);
          }}
          disabled={!isFlipped || isSubmitting}
          leftIcon={<XCircle className="w-5 h-5 mr-1.5 text-black" />}
          className="w-full text-sm font-black bg-[#FF8080] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          Eslay Olmadim [1]
        </GlassButton>

        <GlassButton
          variant="success"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            handleReviewAnswer(true);
          }}
          disabled={!isFlipped || isSubmitting}
          rightIcon={<CheckCircle2 className="w-5 h-5 ml-1.5 text-black" />}
          className="w-full text-sm font-black bg-[#A3E635] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          Esladim (+1 SRS) [2]
        </GlassButton>
      </div>

      {/* Helper shortcuts */}
      <div className="text-center text-xs font-bold text-black/60 flex items-center justify-center gap-3">
        <span>[Space] Aylantirish</span>
        <span>•</span>
        <span>[1] Xato</span>
        <span>•</span>
        <span>[2] To&apos;g&apos;ri</span>
        <span>•</span>
        <span>[A] Talaffuz</span>
      </div>
    </div>
  );
}
