"use client";

import React, { useEffect, useState, useMemo, Suspense, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Volume2, 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Check, 
  RotateCcw, 
  BookOpen 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { api, DeckDetail, Card } from "@/lib/api";
import { playPronunciation } from "@/lib/speech";

function DeckDictionaryContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const deckId = Number(resolvedParams.id);

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<"all" | "box0" | "learning" | "mastered">("all");
  const [preferredAccent, setPreferredAccent] = useState<"en-US" | "en-GB">("en-US");
  const [playingTerm, setPlayingTerm] = useState<string | null>(null);
  const [reviewingCardId, setReviewingCardId] = useState<number | null>(null);

  const fetchDeck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getDeck(deckId);
      setDeck(data);
    } catch (err: any) {
      console.error("Failed to load deck:", err);
      setError(err.message || "To'plamni yuklashda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deckId) {
      fetchDeck();
    }
  }, [deckId]);

  // Handle pronunciation audio
  const handlePlayAudio = async (term: string) => {
    setPlayingTerm(term);
    await playPronunciation(term, preferredAccent);
    setPlayingTerm(null);
  };

  // Inline Quick Review action
  const handleInlineReview = async (cardId: number, correct: boolean) => {
    try {
      setReviewingCardId(cardId);
      const res = await api.submitReview(cardId, correct);
      
      if (deck) {
        const updatedCards = deck.cards.map((c) => {
          if (c.id === cardId) {
            return {
              ...c,
              progress: {
                id: c.progress?.id || 0,
                card_id: cardId,
                box_level: res.box_level,
                next_review_at: res.next_review_at,
                correct_streak: res.correct_streak,
                wrong_count: res.wrong_count,
              },
            };
          }
          return c;
        });

        const totalBoxPoints = updatedCards.reduce(
          (acc, c) => acc + (c.progress?.box_level || 0),
          0
        );
        const newMastery =
          updatedCards.length > 0
            ? roundTo((totalBoxPoints / (updatedCards.length * 5.0)) * 100.0, 1)
            : 0;

        setDeck({
          ...deck,
          cards: updatedCards,
          mastery_percentage: newMastery,
        });
      }
    } catch (err) {
      console.error("Review update failed:", err);
    } finally {
      setReviewingCardId(null);
    }
  };

  function roundTo(num: number, decimals: number) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  // Filtered Cards List
  const filteredCards = useMemo(() => {
    if (!deck) return [];

    return deck.cards.filter((card) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.term_en.toLowerCase().includes(q) ||
        card.meaning_uz.toLowerCase().includes(q) ||
        (card.synonyms && card.synonyms.toLowerCase().includes(q)) ||
        (card.example_en && card.example_en.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      const box = card.progress?.box_level ?? 0;
      if (selectedBoxFilter === "box0") return box === 0;
      if (selectedBoxFilter === "learning") return box >= 1 && box <= 2;
      if (selectedBoxFilter === "mastered") return box >= 3;

      return true;
    });
  }, [deck, searchQuery, selectedBoxFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#ef233c] border-t-transparent animate-spin shadow-[0_0_20px_rgba(239,35,60,0.5)]" />
        <p className="text-sm font-bold font-manrope uppercase tracking-wider text-zinc-400">
          Lug&apos;at to&apos;plami yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <GlassCard padding="xl" className="text-center py-16 space-y-4 max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-[#ef233c] mx-auto" />
        <h3 className="text-xl font-bold font-manrope text-white">To&apos;plam topilmadi</h3>
        <p className="text-sm font-inter text-zinc-400">{error || "Bunday to'plam mavjud emas yoki o'chirilgan."}</p>
        <Link href="/">
          <GlassButton variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4 mr-1.5" />}>
            Bosh sahifaga qaytish
          </GlassButton>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 pb-20">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Bosh sahifa / Lug&apos;atlar</span>
        </Link>

        {/* Accent Selector (US vs UK) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs">
          <span className="text-zinc-400 px-2 font-mono text-[11px] uppercase">Talaffuz:</span>
          <button
            onClick={() => setPreferredAccent("en-US")}
            className={`px-3 py-1 rounded-full font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              preferredAccent === "en-US"
                ? "bg-[#ef233c] text-white shadow-[0_0_10px_rgba(239,35,60,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>US</span>
          </button>
          <button
            onClick={() => setPreferredAccent("en-GB")}
            className={`px-3 py-1 rounded-full font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              preferredAccent === "en-GB"
                ? "bg-[#ef233c] text-white shadow-[0_0_10px_rgba(239,35,60,0.5)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Volume2 className="w-3 h-3" />
            <span>UK</span>
          </button>
        </div>
      </div>

      {/* Deck Overview Header Card */}
      <GlassCard padding="lg" className="relative overflow-hidden border-white/10 bg-gradient-to-b from-zinc-900/60 to-black">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-[#ef233c]/15 text-[#ef233c] border border-[#ef233c]/30 font-bold font-manrope text-xs uppercase shadow-[0_0_10px_rgba(239,35,60,0.2)]">
                {deck.level || "C1 / IELTS"}
              </span>
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-mono text-xs">
                {deck.card_count} ta so&apos;z
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-manrope text-white tracking-tight">
              {deck.title}
            </h1>

            <p className="text-sm font-inter text-zinc-400 leading-relaxed">
              {deck.description || "IELTS va CEFR akademik lug'at boyligini oshirish to'plami."}
            </p>
          </div>

          {/* Action CTA & Mastery Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="w-full sm:w-44 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                O&apos;zlashtirish
              </div>
              <div className="text-3xl font-bold font-manrope text-white">
                {deck.mastery_percentage}%
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 rounded-full shadow-[0_0_8px_rgba(239,35,60,0.6)]"
                  style={{ width: `${Math.max(5, deck.mastery_percentage)}%` }}
                />
              </div>
            </div>

            <Link href={`/decks/${deck.id}/study`} className="w-full sm:w-auto">
              <button className="shiny-cta group w-full py-3.5 px-6">
                <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wide">
                  <BrainCircuit className="w-4 h-4 text-[#ef233c]" />
                  <span>Mashg&apos;ulotni Boshlash</span>
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Ambient Red Hover Gradient in Card */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 65%)" }}
        />
      </GlassCard>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Inglizcha yoki o'zbekcha so'z qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-zinc-950/80 text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 focus:border-[#ef233c] outline-none transition"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: `Barchasi (${deck.card_count})` },
            { id: "box0", label: "0-quti (Yangi)" },
            { id: "learning", label: "1-2-quti (O'rganilmoqda)" },
            { id: "mastered", label: "3-5-quti (Yodlangan)" },
          ].map((tab) => {
            const isActive = selectedBoxFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedBoxFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.4)]"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Cards Table / Grid */}
      {filteredCards.length === 0 ? (
        <GlassCard padding="xl" className="text-center py-16 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#ef233c]">
            <Search className="w-8 h-8 text-[#ef233c]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold font-manrope text-white">Mos keluvchi so&apos;z topilmadi</h4>
            <p className="text-xs text-zinc-400 font-inter max-w-xs mx-auto">
              Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring yoki tanlangan quti filtrini tozalang.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedBoxFilter("all");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ef233c] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(239,35,60,0.35)]"
          >
            Filtrlarni tozalash
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredCards.map((card, idx) => {
            const isPlaying = playingTerm === card.term_en;
            const boxLevel = card.progress?.box_level ?? 0;
            const wrongCount = card.progress?.wrong_count ?? 0;

            return (
              <GlassCard
                key={card.id}
                padding="md"
                interactive
                className="group transition-all duration-200 border-white/10 bg-zinc-950/70 hover:border-[#ef233c]/40"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Term, Audio, Meaning, Synonyms */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-zinc-500 min-w-[24px]">
                        #{idx + 1}
                      </span>

                      {/* Term En */}
                      <span className="text-lg sm:text-xl font-bold font-manrope text-white group-hover:text-[#ef233c] transition-colors">
                        {card.term_en}
                      </span>

                      {/* Pronunciation Button */}
                      <button
                        onClick={() => handlePlayAudio(card.term_en)}
                        disabled={isPlaying}
                        className={`p-1.5 rounded-lg border border-white/10 transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-[#ef233c] text-white animate-pulse"
                            : "bg-white/5 hover:bg-white/10 text-[#ef233c]"
                        }`}
                        title={`Tinglash (${preferredAccent === "en-US" ? "American" : "British"})`}
                        aria-label={`Talaffuz: ${card.term_en}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* SRS Box Level Dots Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
                        <span>{boxLevel}-quti:</span>
                        <div className="flex items-center gap-1 ml-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <span
                              key={lvl}
                              className={`w-2 h-2 rounded-full ${
                                lvl <= boxLevel
                                  ? "bg-[#ef233c] shadow-[0_0_6px_rgba(239,35,60,0.8)]"
                                  : "bg-zinc-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {wrongCount > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-950/60 border border-red-500/40 text-red-300">
                          {wrongCount} marta xato
                        </span>
                      )}
                    </div>

                    {/* Uzbek Meaning */}
                    <div className="text-sm font-medium text-zinc-300 pl-8 font-inter">
                      {card.meaning_uz}
                    </div>

                    {/* Synonyms */}
                    {card.synonyms && (
                      <div className="pl-8 flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-zinc-500">Sinonimlar:</span>
                        <span className="text-zinc-300 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {card.synonyms}
                        </span>
                      </div>
                    )}

                    {/* Example Sentence in IELTS Context */}
                    {card.example_en && (
                      <div className="pl-8 pt-1 text-xs text-zinc-400 italic leading-relaxed border-l-2 border-[#ef233c] bg-white/[0.02] p-2 rounded-r-lg ml-8 my-1 font-inter">
                        &ldquo;{card.example_en}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Right Column: Inline Quick Review Buttons */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 md:min-w-[140px] pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                    <button
                      onClick={() => handleInlineReview(card.id, true)}
                      disabled={reviewingCardId === card.id}
                      className="flex-1 sm:w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                      title="To'g'ri esladim (+1 SRS daraja)"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Bilaman</span>
                    </button>

                    <button
                      onClick={() => handleInlineReview(card.id, false)}
                      disabled={reviewingCardId === card.id}
                      className="flex-1 sm:w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#ef233c]/20 text-zinc-400 hover:text-[#ef233c] border border-white/10 hover:border-[#ef233c]/40 text-xs font-medium transition-all cursor-pointer active:scale-95"
                      title="Qiyin yoki xato (0-qutiga qaytarish)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Qiyin</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DeckDictionaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#ef233c] border-t-transparent animate-spin shadow-[0_0_20px_rgba(239,35,60,0.5)]" />
          <p className="text-sm font-bold font-manrope uppercase text-zinc-400">To&apos;plam yuklanmoqda...</p>
        </div>
      }
    >
      <DeckDictionaryContent params={params} />
    </Suspense>
  );
}
