"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  BookOpen,
  Plus,
  Search,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Database,
  ArrowRight,
  TrendingUp,
  Activity,
  Bot
} from "lucide-react";
import { api, DeckListItem } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { CreateDeckModal } from "@/components/dashboard/CreateDeckModal";
import { animeAnimations } from "@/lib/animeAnimations";

export default function AdminPage() {
  const [decks, setDecks] = useState<DeckListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"decks" | "add-card" | "system">("decks");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Card Form state
  const [selectedDeckId, setSelectedDeckId] = useState<number | "">("");
  const [termEn, setTermEn] = useState("");
  const [meaningUz, setMeaningUz] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [exampleEn, setExampleEn] = useState("");
  const [cardSubmitStatus, setCardSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await api.getDecks();
      setDecks(res);
      if (res.length > 0 && selectedDeckId === "") {
        setSelectedDeckId(res[0].id);
      }
    } catch (err) {
      console.error("Failed to load admin decks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      animeAnimations.staggerCards(".admin-stat-card, .admin-deck-card");
    }
  }, [isLoading, activeTab]);

  const totalCards = decks.reduce((acc, d) => acc + (Number(d.card_count) || 0), 0);

  const filteredDecks = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId || !termEn.trim() || !meaningUz.trim()) {
      setCardSubmitStatus({
        type: "error",
        message: "To'plam, inglizcha so'z va o'zbekcha tarjima kiritilishi shart.",
      });
      return;
    }

    try {
      setIsSubmittingCard(true);
      setCardSubmitStatus({ type: null, message: "" });

      const res = await fetch(`/api/decks/${selectedDeckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termEn: termEn.trim(),
          meaningUz: meaningUz.trim(),
          synonyms: synonyms.trim() || undefined,
          exampleEn: exampleEn.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Xatolik yuz berdi");
      }

      setCardSubmitStatus({
        type: "success",
        message: `"${termEn}" so'zi to'plamga muvaffaqiyatli qo'shildi!`,
      });

      // Reset form fields
      setTermEn("");
      setMeaningUz("");
      setSynonyms("");
      setExampleEn("");

      // Refresh deck stats
      loadData();
    } catch (err: any) {
      setCardSubmitStatus({
        type: "error",
        message: err.message || "Karta qo'shishda xatolik yuz berdi.",
      });
    } finally {
      setIsSubmittingCard(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B6FF2E]/10 border border-[#B6FF2E]/30 text-[#B6FF2E] text-xs font-mono font-bold uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(182,255,46,0.2)]">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-manrope text-white tracking-tight">
            Vydex Boshqaruv Paneli
          </h1>
          <p className="text-sm text-zinc-400 mt-2 font-inter max-w-xl">
            Akademik to&apos;plamlar, lug&apos;at kartalari, foydalanuvchilar statistikasi va tizim sinxronizatsiyasini to&apos;liq nazorat qilish markazi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            variant="graphite"
            size="md"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Yangilash
          </GlassButton>

          <GlassButton
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Yangi To&apos;plam
          </GlassButton>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <GlassCard className="admin-stat-card border-white/10 bg-[#23262F]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/30 flex items-center justify-center text-[#B6FF2E]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
              To&apos;plamlar
            </span>
          </div>
          <p className="text-3xl font-black font-manrope text-white">
            {decks.length} <span className="text-sm font-normal text-zinc-400">ta</span>
          </p>
          <p className="text-xs text-zinc-400 mt-1">B2, C1 va C2 flagman kurslar</p>
        </GlassCard>

        <GlassCard className="admin-stat-card border-white/10 bg-[#23262F]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/30 flex items-center justify-center text-[#B6FF2E]">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
              Jami So&apos;zlar
            </span>
          </div>
          <p className="text-3xl font-black font-manrope text-white">
            {totalCards.toLocaleString()} <span className="text-sm font-normal text-zinc-400">ta</span>
          </p>
          <p className="text-xs text-zinc-400 mt-1">Akademik namunalar va sinonimlar</p>
        </GlassCard>

        <GlassCard className="admin-stat-card border-white/10 bg-[#23262F]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/30 flex items-center justify-center text-[#B6FF2E]">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#B6FF2E] uppercase">
              Telegram Bot
            </span>
          </div>
          <p className="text-xl font-black font-manrope text-white">
            @vydex_uzbot
          </p>
          <p className="text-xs text-[#B6FF2E] mt-1 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#B6FF2E] animate-pulse" />
            Faol &amp; Sinxronlashgan
          </p>
        </GlassCard>

        <GlassCard className="admin-stat-card border-white/10 bg-[#23262F]/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#B6FF2E]/10 border border-[#B6FF2E]/30 flex items-center justify-center text-[#B6FF2E]">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
              SRS Algoritm
            </span>
          </div>
          <p className="text-2xl font-black font-manrope text-white">
            5-Quti Leitner
          </p>
          <p className="text-xs text-zinc-400 mt-1">Intervalli takrorlash rejimi</p>
        </GlassCard>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#15171C] border border-white/10 max-w-lg mb-8">
        <button
          type="button"
          onClick={() => setActiveTab("decks")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "decks"
              ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_20px_rgba(182,255,46,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          To&apos;plamlar ({decks.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("add-card")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "add-card"
              ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_20px_rgba(182,255,46,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Yangi So&apos;z Qo&apos;shish
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "system"
              ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_20px_rgba(182,255,46,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Tizim Holati
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: Decks Manager */}
      {activeTab === "decks" && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="To'plamlarni qidirish (nomi yoki daraja bo'yicha)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#23262F]/80 border border-white/10 focus:border-[#B6FF2E] focus:ring-2 focus:ring-[#B6FF2E]/20 text-white placeholder-zinc-500 text-sm outline-none transition-all"
            />
          </div>

          {/* Decks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <GlassCard
                key={deck.id}
                interactive
                className="admin-deck-card flex flex-col justify-between p-6 rounded-[28px] bg-[#23262F]/85 border-white/10 hover:border-[#B6FF2E]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#B6FF2E]/10 text-[#B6FF2E] border border-[#B6FF2E]/30">
                      {deck.level}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      ID: #{deck.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-manrope text-white mb-2 line-clamp-2">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {deck.description || "Tavsif mavjud emas."}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                    <BookOpen className="w-3.5 h-3.5 text-[#B6FF2E]" />
                    <span className="font-bold text-white">{deck.card_count}</span>
                    <span>ta so&apos;z</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/decks/${deck.id}`}>
                      <GlassButton variant="primary" size="sm">
                        O&apos;rganish
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Add Vocabulary Card */}
      {activeTab === "add-card" && (
        <div className="max-w-2xl mx-auto">
          <GlassCard className="rounded-[32px] bg-[#23262F]/90 border-white/10 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#B6FF2E] flex items-center justify-center text-[#15171C] font-bold">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-manrope text-white">
                  Yangi Akademik So&apos;z Qo&apos;shish
                </h2>
                <p className="text-xs text-zinc-400">
                  Tanlangan to&apos;plamga so&apos;z, ma&apos;no va kontekstual namunalarni kiriting
                </p>
              </div>
            </div>

            {cardSubmitStatus.type && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2 ${
                  cardSubmitStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {cardSubmitStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{cardSubmitStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleAddCard} className="space-y-4">
              {/* Select Deck */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
                  To&apos;plamni Tanlang *
                </label>
                <select
                  required
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 text-white text-sm outline-none focus:border-[#B6FF2E] transition-all"
                >
                  {decks.map((d) => (
                    <option key={d.id} value={d.id} className="bg-[#15171C] text-white">
                      {d.title} ({d.level} — {d.card_count} ta so&apos;z)
                    </option>
                  ))}
                </select>
              </div>

              {/* Term English */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
                  Inglizcha So&apos;z yoki Ibora (Term EN) *
                </label>
                <input
                  type="text"
                  required
                  value={termEn}
                  onChange={(e) => setTermEn(e.target.value)}
                  placeholder="masalan: Ubiquitous yoki Stumbling block"
                  className="w-full px-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-[#B6FF2E] transition-all"
                />
              </div>

              {/* Meaning Uzbek */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
                  O&apos;zbekcha Tarjima va Izoh (Meaning UZ) *
                </label>
                <input
                  type="text"
                  required
                  value={meaningUz}
                  onChange={(e) => setMeaningUz(e.target.value)}
                  placeholder="masalan: hamma joyda uchraydigan, universal"
                  className="w-full px-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-[#B6FF2E] transition-all"
                />
              </div>

              {/* Synonyms */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
                  Sinonimlar (Vergullar bilan ajrating)
                </label>
                <input
                  type="text"
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  placeholder="omnipresent, pervasive, universal, rife"
                  className="w-full px-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-[#B6FF2E] transition-all"
                />
              </div>

              {/* Example English */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
                  IELTS / Akademik Namunaviy Gap (Example EN)
                </label>
                <textarea
                  rows={3}
                  value={exampleEn}
                  onChange={(e) => setExampleEn(e.target.value)}
                  placeholder="In modern urban societies, smartphones have become a ubiquitous presence."
                  className="w-full px-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 text-white placeholder-zinc-500 text-sm outline-none focus:border-[#B6FF2E] transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-3">
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmittingCard}
                  className="w-full py-4 text-sm font-bold shadow-[0_0_25px_rgba(182,255,46,0.35)]"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Kartani Saqlash &amp; Tizimga Qo&apos;shish
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: System Status */}
      {activeTab === "system" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <GlassCard className="rounded-[32px] bg-[#23262F]/85 border-white/10 p-8">
            <h3 className="text-xl font-bold font-manrope text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#B6FF2E]" />
              <span>Ma&apos;lumotlar Bazasi &amp; Tizim Arxitekturasi</span>
            </h3>

            <div className="space-y-4 text-xs font-mono text-zinc-300">
              <div className="p-4 rounded-2xl bg-[#15171C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">PostgreSQL Database</p>
                  <p className="text-zinc-500">Prisma ORM &amp; Neon Serverless Postgres</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ONLINE / CONNECTED
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#15171C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">AI Engine (Google Gemini 2.5)</p>
                  <p className="text-zinc-500">Matnlardan so&apos;z ajratish va grammatik tahlil</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#B6FF2E]/10 text-[#B6FF2E] border border-[#B6FF2E]/30">
                  READY
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#15171C] border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Telegram Bot Webhook (@vydex_uzbot)</p>
                  <p className="text-zinc-500">Kundalik takrorlash bildirishnomalari va testlar</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/30">
                  ACTIVE
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Create Deck Modal */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeckCreated={() => loadData()}
      />
    </div>
  );
}
