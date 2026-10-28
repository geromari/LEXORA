"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Volume2, 
  RotateCcw, 
  XCircle, 
  ArrowRight, 
  CheckCircle2, 
  CalendarCheck 
} from "lucide-react";
import { motion } from "framer-motion";
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

  const handleReviewAnswer = async (correct: boolean) => {
    if (!currentCard || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.submitReview(currentCard.id, correct);

      setReviewedCount((prev) => prev + 1);

      if (currentIndex + 1 < activeCards.length) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      } else {
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
        <div className="w-12 h-12 rounded-full border-2 border-[#ef233c] border-t-transparent animate-spin shadow-[0_0_20px_rgba(239,35,60,0.5)]" />
        <p className="text-sm font-bold font-manrope uppercase text-zinc-400">
          Takrorlash navbati tahlil qilinmoqda...
        </p>
      </div>
    );
  }

  // Queue Empty / Completed Screen
  if (queueFinished || activeCards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <GlassCard padding="xl" className="text-center py-14 space-y-6 relative overflow-hidden border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(239,35,60,0.3)] flex items-center justify-center mx-auto text-[#ef233c]">
            <Flame className="w-10 h-10 fill-[#ef233c]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30 text-xs font-bold font-manrope">
              <CalendarCheck className="w-3.5 h-3.5" />
              {reviewedCount > 0
                ? "Bugungi vazifa to'liq bajarildi!"
                : "Hozircha barcha so'zlar yangilangan!"}
            </div>
            <h2 className="text-3xl font-bold font-manrope text-white">
              Kunlik Seriya: {streakCount} Kun
            </h2>
            <p className="text-sm font-inter text-zinc-400 max-w-md mx-auto">
              {reviewedCount > 0
                ? "Barcha navbatdagi so'zlar takrorlandi. Interval takrorlash (SRS) algoritmi xotirangizni mustahkamladi."
                : "Bugungi SRS navbatida takrorlash uchun so'zlar qolmagan. Xotirangizni sinash uchun qiyin so'zlarni qayta ko'rishingiz mumkin."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-around max-w-sm mx-auto text-xs">
            <div>
              <div className="text-2xl font-bold font-manrope text-white">{reviewedCount}</div>
              <div className="text-zinc-400 font-inter mt-0.5">Takrorlangan so&apos;zlar</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-2xl font-bold font-manrope text-[#ef233c]">100%</div>
              <div className="text-zinc-400 font-inter mt-0.5">Navbat tozaligi</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setActiveQueueType("all");
                fetchDueCards();
              }}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Qiyin so&apos;zlarni yana bir bor ko&apos;rish
            </button>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <Link href="/">
              <button className="shiny-cta py-2.5 px-6">
                <span className="relative z-10 flex items-center gap-2 text-white font-bold text-xs">
                  <span>Bosh Sahifaga Qaytish</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ef233c]" />
                </span>
              </button>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / activeCards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-6 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Bosh sahifa</span>
        </Link>

        {/* Daily Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white">
          <Flame className="w-4 h-4 text-[#ef233c] fill-[#ef233c]" />
          <span>{streakCount} kunlik seriya</span>
        </div>
      </div>

      {/* Queue Segment Selector */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-zinc-950/80 border border-white/10 w-full backdrop-blur-xl">
          <button
            onClick={() => setActiveQueueType("due")}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold font-manrope transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeQueueType === "due"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.5)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bugungi Navbat ({dueData?.total_due || 0})</span>
          </button>

          <button
            onClick={() => setActiveQueueType("hardest")}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold font-manrope transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeQueueType === "hardest"
                ? "bg-[#ef233c] text-white shadow-[0_0_15px_rgba(239,35,60,0.5)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Eng Qiyin So&apos;zlar ({dueData?.total_hardest || 0})</span>
          </button>
        </div>
      </div>

      {/* Progress Counter & Striped Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            So&apos;z {currentIndex + 1} / {activeCards.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
            {activeCards.length - currentIndex} ta karta qoldi
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.6)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Red Noir Review Card */}
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
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-gradient-to-b from-zinc-900/80 to-black border border-white/15 p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(239,35,60,0.15)] [backface-visibility:hidden] absolute inset-0 ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,35,60,0.2)]">
                <Clock className="w-3.5 h-3.5 text-[#ef233c]" />
                Takrorlash Navbati
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

            <div className="my-auto text-center space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-white tracking-tight leading-tight">
                {currentCard.term_en}
              </h2>
              {currentCard.progress && currentCard.progress.wrong_count > 0 && (
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 rounded-md bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono inline-flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Oldin {currentCard.progress.wrong_count} marta xato qilingan</span>
                  </span>
                </div>
              )}
            </div>

            <div className="text-center pt-4 border-t border-white/10 text-xs font-medium text-zinc-400 flex items-center justify-center gap-1.5 font-inter">
              <RotateCcw className="w-3.5 h-3.5 text-[#ef233c]" />
              <span>Javobni ko&apos;rish uchun bosing yoki [Space]</span>
            </div>
          </div>

          {/* BACK */}
          <div
            className={`w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl bg-gradient-to-b from-zinc-950 to-black border border-[#ef233c]/50 p-8 flex flex-col justify-between shadow-[0_0_45px_rgba(239,35,60,0.2)] [transform:rotateY(180deg)] [backface-visibility:hidden] absolute inset-0 ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-bold font-manrope text-xs uppercase">
                O&apos;zbekcha Tarjima &amp; Misol
              </span>
              <button
                type="button"
                onClick={handleAudio}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#ef233c] transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto text-center space-y-4">
              <div className="text-2xl sm:text-3xl font-bold font-manrope text-white leading-relaxed">
                {currentCard.meaning_uz}
              </div>

              {currentCard.synonyms && (
                <div className="mt-1">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 inline-block">
                    Sinonimlar: {currentCard.synonyms}
                  </span>
                </div>
              )}

              {currentCard.example_en && (
                <div className="p-3.5 rounded-xl border-l-2 border-[#ef233c] bg-white/[0.02] text-xs sm:text-sm text-zinc-300 italic leading-relaxed text-left max-w-lg mx-auto font-inter">
                  &ldquo;{currentCard.example_en}&rdquo;
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-xs text-zinc-500 font-inter">
              Qaytadan aylantirish uchun bosing
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decision Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReviewAnswer(false);
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-950/40 hover:bg-[#ef233c] text-red-300 hover:text-white border border-red-500/40 font-bold font-manrope text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-lg active:scale-95"
        >
          <XCircle className="w-5 h-5" />
          <span>Eslay Olmadim [1]</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReviewAnswer(true);
          }}
          disabled={!isFlipped || isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold font-manrope text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-95"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Esladim (+1 SRS) [2]</span>
        </button>
      </div>

      {/* Helper shortcuts */}
      <div className="text-center text-xs font-mono text-zinc-500 flex items-center justify-center gap-3">
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
