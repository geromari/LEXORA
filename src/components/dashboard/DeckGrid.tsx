"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  BrainCircuit, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Layers, 
  User, 
  ArrowRight 
} from "lucide-react";
import { DeckListItem } from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

interface DeckGridProps {
  decks: DeckListItem[];
  isLoading?: boolean;
  onOpenCreateModal: () => void;
}

export function DeckGrid({
  decks,
  isLoading = false,
  onOpenCreateModal,
}: DeckGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[28px] border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#23262F]/40 p-7 space-y-4 animate-pulse h-64"
          />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <GlassCard className="rounded-[32px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 text-center p-8 sm:p-14 flex flex-col items-center justify-center space-y-5 shadow-sm dark:shadow-md">
        <div className="w-16 h-16 rounded-2xl bg-[#B6FF2E]/15 border border-emerald-500/30 dark:border-[#B6FF2E]/30 flex items-center justify-center shadow-[0_0_25px_rgba(182,255,46,0.2)]">
          <BookOpen className="w-8 h-8 text-emerald-700 dark:text-[#B6FF2E]" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold font-manrope text-zinc-950 dark:text-white tracking-tight">
            To&apos;plamlar topilmadi
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm font-inter">
            Ushbu filtr bo&apos;yicha hech qanday to&apos;plam topilmadi. O&apos;zingiz yangi to&apos;plam yarating yoki AI orqali import qiling.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <GlassButton
            variant="primary"
            size="md"
            onClick={onOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Yangi To&apos;plam Yaratish
          </GlassButton>

          <GlassButton
            variant="graphite"
            size="md"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
            }}
            leftIcon={<Sparkles className="w-4 h-4 text-[#B6FF2E]" />}
          >
            Matndan AI Import
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => {
        const isIelts = (deck.level && deck.level.toUpperCase().includes("IELTS")) || deck.title.toUpperCase().includes("IELTS");

        return (
          <GlassCard
            key={deck.id}
            interactive
            className="p-7 rounded-[28px] bg-white/95 dark:bg-[#23262F]/85 border-zinc-200 dark:border-white/10 flex flex-col justify-between group relative overflow-hidden h-full shadow-sm dark:shadow-md hover:border-emerald-500/50 dark:hover:border-[#B6FF2E]/50"
          >
            <div>
              {/* Top row: Level badge on left, Word count on right */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/35 shadow-sm">
                    {deck.level || (isIelts ? "IELTS" : "C1 Academic")}
                  </span>
                  {deck.is_owner && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300">
                      <User className="w-3 h-3 text-emerald-700 dark:text-[#B6FF2E]" />
                      Shaxsiy
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#15171C] px-3 py-1 rounded-full border border-zinc-200 dark:border-white/10">
                  <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-[#B6FF2E]" />
                  <span className="font-bold">{deck.card_count}</span>
                  <span className="text-zinc-500">so&apos;z</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold font-manrope text-zinc-950 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#B6FF2E] transition-colors line-clamp-1 relative z-10">
                {deck.title}
              </h3>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-inter line-clamp-2 leading-relaxed mt-2 min-h-[2.5rem] relative z-10">
                {deck.description || "IELTS va CEFR akademik lug'at boyligini oshirish uchun maxsus to'plam."}
              </p>

              {/* Progress Bar Section */}
              <div className="space-y-2 mt-5 pt-4 border-t border-zinc-200 dark:border-white/10 relative z-10">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px]">Xotira darajasi</span>
                  <span className="text-emerald-700 dark:text-[#B6FF2E] font-extrabold">
                    {Math.round(deck.mastery_percentage || 0)}%
                  </span>
                </div>

                <div className="h-2 w-full bg-zinc-100 dark:bg-[#15171C] rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#B6FF2E] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(182,255,46,0.5)]"
                    style={{
                      width: `${Math.max(4, Math.min(100, deck.mastery_percentage || 0))}%`,
                    }}
                  />
                </div>

                {/* Due / Learned status indicator */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 dark:text-[#B6FF2E]" />
                    {deck.due_count > 0 ? (
                      <span className="text-emerald-700 dark:text-[#B6FF2E] font-bold">{deck.due_count} ta navbatda</span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">Takrorlangan</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{deck.learned_count} yodlandi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center gap-2.5 relative z-10">
              <Link
                href={`/decks/${deck.id}/study`}
                className="flex-1"
              >
                <GlassButton
                  variant="primary"
                  size="md"
                  className="w-full text-xs font-bold"
                  leftIcon={<BrainCircuit className="w-4 h-4" />}
                >
                  O&apos;rganish
                </GlassButton>
              </Link>

              <Link
                href={`/decks/${deck.id}`}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-[#15171C] dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white p-2.5 rounded-full flex items-center justify-center transition"
                title="Barcha so'zlar ro'yxati"
              >
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
