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
  Filter,
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
      
      // Update local card progress state
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

        // Recalculate deck mastery
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
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.term_en.toLowerCase().includes(q) ||
        card.meaning_uz.toLowerCase().includes(q) ||
        (card.synonyms && card.synonyms.toLowerCase().includes(q)) ||
        (card.example_en && card.example_en.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 2. Box Filter
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
        <div className="w-12 h-12 rounded-xl border-[3px] border-black border-t-transparent animate-spin bg-yellow-300" />
        <p className="text-sm font-black uppercase text-black">Lug&apos;at to&apos;plami yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <GlassCard padding="xl" className="text-center py-16 space-y-4 max-w-lg mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-[#FA5A2A] mx-auto" />
        <h3 className="text-xl font-black text-black">To&apos;plam topilmadi</h3>
        <p className="text-sm font-medium text-black/70">{error || "Bunday to'plam mavjud emas yoki o'chirilgan."}</p>
        <Link href="/">
          <GlassButton variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4 mr-1.5" />}>
            Bosh sahifaga qaytish
          </GlassButton>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] text-xs font-black text-black hover:bg-[#FFCC00] hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Bosh sahifa / Lug&apos;atlar</span>
        </Link>

        {/* Accent Selector (US vs UK) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs">
          <span className="text-black/70 px-2 font-black uppercase text-[11px]">Talaffuz:</span>
          <button
            onClick={() => setPreferredAccent("en-US")}
            className={`px-2.5 py-1 rounded-lg font-black transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              preferredAccent === "en-US"
                ? "bg-[#FFCC00] text-black border border-black shadow-[1px_1px_0px_#000]"
                : "text-black/70 hover:text-black"
            }`}
          >
            <Volume2 className="w-3 h-3 text-black" />
            <span>US</span>
          </button>
          <button
            onClick={() => setPreferredAccent("en-GB")}
            className={`px-2.5 py-1 rounded-lg font-black transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              preferredAccent === "en-GB"
                ? "bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_#000]"
                : "text-black/70 hover:text-black"
            }`}
          >
            <Volume2 className="w-3 h-3 text-black" />
            <span>UK</span>
          </button>
        </div>
      </div>

      {/* Deck Overview Header Card */}
      <GlassCard padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-[#FFCC00] text-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
                {deck.level || "C1 / IELTS"}
              </span>
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-white text-black font-extrabold text-xs shadow-[2px_2px_0px_#000]">
                {deck.card_count} ta so&apos;z
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
              {deck.title}
            </h1>

            <p className="text-sm font-medium text-black/70 leading-relaxed">
              {deck.description || "IELTS va CEFR akademik lug'at boyligini oshirish to'plami."}
            </p>
          </div>

          {/* Action CTA & Mastery Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="w-full sm:w-44 p-3.5 rounded-2xl bg-[#FFFDF9] border-2 border-black shadow-[2px_2px_0px_#000] text-center">
              <div className="text-[11px] font-black uppercase tracking-wider text-black/60 mb-0.5">O&apos;zlashtirish</div>
              <div className="text-3xl font-black text-black">{deck.mastery_percentage}%</div>
              <div className="w-full h-3 bg-white border-2 border-black rounded-full mt-2 overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#A3E635] border-r border-black rounded-full"
                  style={{ width: `${Math.max(5, deck.mastery_percentage)}%` }}
                />
              </div>
            </div>

            <Link href={`/decks/${deck.id}/study`} className="w-full sm:w-auto">
              <GlassButton
                variant="ai"
                size="lg"
                className="w-full text-base font-black"
                leftIcon={<BrainCircuit className="w-5 h-5 mr-1" />}
              >
                Mashg&apos;ulotni Boshlash
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Inglizcha yoki o'zbekcha so'z qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] focus:shadow-[3px_3px_0px_#000] outline-none text-xs sm:text-sm font-bold text-black placeholder-zinc-400 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFCC00] text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                    : "bg-white text-black/70 hover:text-black border-2 border-black/20 hover:border-black"
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
          <div className="w-16 h-16 rounded-2xl bg-[#FFCC00] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto text-black">
            <Search className="w-8 h-8 text-black" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-black">Mos keluvchi so&apos;z topilmadi</h4>
            <p className="text-xs font-medium text-black/70 max-w-xs mx-auto">
              Qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring yoki tanlangan quti filtrini tozalang.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedBoxFilter("all");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-black transition-all cursor-pointer"
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
                className="group transition-all duration-150"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Term, Audio, Meaning, Synonyms */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-black text-black/50 min-w-[24px]">
                        #{idx + 1}
                      </span>

                      {/* Term En */}
                      <span className="text-lg sm:text-xl font-black text-black group-hover:text-blue-600 transition-colors">
                        {card.term_en}
                      </span>

                      {/* Pronunciation Button (Web Speech API) */}
                      <button
                        onClick={() => handlePlayAudio(card.term_en)}
                        disabled={isPlaying}
                        className={`p-1.5 rounded-lg border-2 border-black transition-all cursor-pointer ${
                          isPlaying
                            ? "bg-[#FFCC00] text-black shadow-none animate-pulse"
                            : "bg-white hover:bg-yellow-200 text-black shadow-[2px_2px_0px_#000]"
                        }`}
                        title={`Tinglash (${preferredAccent === "en-US" ? "American" : "British"})`}
                        aria-label={`Talaffuz: ${card.term_en}`}
                      >
                        <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-bounce" : ""}`} />
                      </button>

                      {/* SRS Box Level Dots Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-black shadow-[1px_1px_0px_#000] text-xs text-black">
                        <span className="font-bold">{boxLevel}-quti:</span>
                        <div className="flex items-center gap-1 ml-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <span
                              key={lvl}
                              className={`w-2 h-2 rounded-full border border-black ${
                                lvl <= boxLevel
                                  ? "bg-[#A3E635]"
                                  : "bg-zinc-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {wrongCount > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-black bg-[#FF8080] text-black">
                          {wrongCount} marta xato
                        </span>
                      )}
                    </div>

                    {/* Uzbek Meaning */}
                    <div className="text-sm font-bold text-black pl-8">
                      {card.meaning_uz}
                    </div>

                    {/* Synonyms */}
                    {card.synonyms && (
                      <div className="pl-8 flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-black/60 font-bold">Sinonimlar:</span>
                        <span className="text-black font-mono font-bold bg-[#F4EFEA] px-2 py-0.5 rounded border border-black/30">
                          {card.synonyms}
                        </span>
                      </div>
                    )}

                    {/* Example Sentence in IELTS Context */}
                    {card.example_en && (
                      <div className="pl-8 pt-1 text-xs text-black/80 italic leading-relaxed border-l-2 border-black/40 bg-[#F4EFEA] p-2 rounded-r-lg ml-8 my-1">
                        &ldquo;{card.example_en}&rdquo;
                      </div>
                    )}
                  </div>

                  {/* Right Column: Inline Quick Review Buttons */}
                  <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 md:min-w-[140px] pt-2 md:pt-0 border-t md:border-t-0 border-black/10">
                    <button
                      onClick={() => handleInlineReview(card.id, true)}
                      disabled={reviewingCardId === card.id}
                      className="flex-1 sm:w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#A3E635] hover:bg-[#86EFAC] text-black text-xs font-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                      title="To'g'ri esladim (+1 SRS daraja)"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Bilaman</span>
                    </button>

                    <button
                      onClick={() => handleInlineReview(card.id, false)}
                      disabled={reviewingCardId === card.id}
                      className="flex-1 sm:w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FF8080] text-black text-xs font-bold shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
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
          <div className="w-12 h-12 rounded-xl border-[3px] border-black border-t-transparent animate-spin bg-yellow-300" />
          <p className="text-sm font-black uppercase text-black">To&apos;plam yuklanmoqda...</p>
        </div>
      }
    >
      <DeckDictionaryContent params={params} />
    </Suspense>
  );
}

