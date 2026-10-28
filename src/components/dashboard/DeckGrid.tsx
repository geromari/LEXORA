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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 p-6 space-y-4 animate-pulse"
          >
            <div className="flex justify-between">
              <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="w-3/4 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="w-full h-10 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 text-center p-8 sm:p-14 flex flex-col items-center justify-center space-y-5 shadow-sm dark:shadow-none">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center shadow-sm dark:shadow-[0_0_30px_rgba(239,35,60,0.15)]">
          <BookOpen className="w-8 h-8 text-[#ef233c]" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight">
            To&apos;plamlar topilmadi
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
            IELTS yoki CEFR darajangizga mos lug&apos;at to&apos;plamini yarating yoki istalgan inglizcha matndan AI yordamida so&apos;zlar ajratib oling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-2.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(239,35,60,0.35)] transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi To&apos;plam Yaratish</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
              }
            }}
            className="px-6 py-2.5 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-white font-medium text-sm flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#ef233c]" />
            <span>Matndan AI Import</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {decks.map((deck) => {
        const isIelts = (deck.level && deck.level.toUpperCase().includes("IELTS")) || deck.title.toUpperCase().includes("IELTS");

        return (
          <div
            key={deck.id}
            className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/80 hover:border-[#ef233c]/60 dark:hover:border-[#ef233c]/50 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_0_35px_rgba(239,35,60,0.12)] h-full"
          >
            <div>
              {/* Top row: Level badge on left, Word count on right */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase font-manrope bg-red-50 dark:bg-[#ef233c]/15 text-[#ef233c] border border-red-200 dark:border-[#ef233c]/30 shadow-sm">
                    {deck.level || (isIelts ? "IELTS" : "C1 Academic")}
                  </span>
                  {deck.is_owner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300">
                      <User className="w-3 h-3 text-[#ef233c]" />
                      Shaxsiy
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-white/10">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{deck.card_count} so&apos;z</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white group-hover:text-[#ef233c] transition-colors line-clamp-1 relative z-10">
                {deck.title}
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter line-clamp-2 leading-relaxed mt-2 min-h-[2.5rem] relative z-10">
                {deck.description || "IELTS va CEFR akademik lug'at boyligini oshirish uchun maxsus to'plam."}
              </p>

              {/* Progress Bar Section */}
              <div className="space-y-2 mt-5 pt-4 border-t border-zinc-100 dark:border-white/10 relative z-10">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Xotira darajasi</span>
                  <span className="text-[#ef233c] font-bold">
                    {Math.round(deck.mastery_percentage || 0)}%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ef233c] to-rose-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(239,35,60,0.6)]"
                    style={{
                      width: `${Math.max(4, Math.min(100, deck.mastery_percentage || 0))}%`,
                    }}
                  />
                </div>

                {/* Due / Learned status indicator */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#ef233c]" />
                    {deck.due_count > 0 ? (
                      <span className="text-[#ef233c] font-semibold">{deck.due_count} ta navbatda</span>
                    ) : (
                      <span className="text-zinc-400">Hammasi takrorlangan</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{deck.learned_count} yodlandi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center gap-2.5 relative z-10">
              <Link
                href={`/decks/${deck.id}/study`}
                className="flex-1 bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-[0_0_20px_rgba(239,35,60,0.25)] transition-all active:scale-[0.98]"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>O&apos;rganish</span>
              </Link>

              <Link
                href={`/decks/${deck.id}`}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white p-2.5 rounded-xl flex items-center justify-center transition"
                title="Barcha so'zlar ro'yxati"
              >
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>

            {/* Ambient Red Hover Gradient in Card */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 70%)" }}
            />
          </div>
        );
      })}
    </div>
  );
}
