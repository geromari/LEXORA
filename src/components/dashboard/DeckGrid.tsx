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
          <div key={i} className="rounded-2xl border-[2.5px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_#121212] space-y-4 animate-pulse">
            <div className="flex justify-between">
              <div className="w-16 h-5 bg-zinc-200 rounded" />
              <div className="w-16 h-5 bg-zinc-200 rounded" />
            </div>
            <div className="w-3/4 h-6 bg-zinc-200 rounded" />
            <div className="w-full h-10 bg-zinc-100 rounded" />
            <div className="w-full h-2 bg-zinc-200 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="rounded-2xl border-[2.5px] border-[#121212] bg-white shadow-[4px_4px_0px_#121212] text-center p-8 sm:p-14 flex flex-col items-center justify-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center shadow-[3px_3px_0px_#121212]">
          <BookOpen className="w-8 h-8 text-[#121212]" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-2xl font-black text-[#121212] tracking-tight">
            To&apos;plamlar topilmadi
          </h3>
          <p className="text-sm text-zinc-600 leading-relaxed">
            IELTS yoki CEFR darajangizga mos lug&apos;at to&apos;plamini yarating yoki istalgan inglizcha matndan AI yordamida so&apos;zlar ajratib oling.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FFCC00] text-[#121212] font-black text-sm flex items-center gap-2 shadow-[2px_2px_0px_#121212] hover:bg-[#f0c000] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi To&apos;plam Yaratish</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
              }
            }}
            className="px-5 py-2.5 rounded-xl border-2 border-[#121212] bg-white text-[#121212] font-black text-sm flex items-center gap-2 shadow-[2px_2px_0px_#121212] hover:bg-[#F4EFEA] transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FA5A2A]" />
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
        const levelBadgeColor = isIelts 
          ? "bg-[#FFCC00] text-[#121212]" 
          : "bg-[#2563EB] text-white";

        return (
          <div
            key={deck.id}
            className="rounded-2xl border-[2.5px] border-[#121212] bg-white p-5 sm:p-6 shadow-[4px_4px_0px_#121212] hover:shadow-[6px_6px_0px_#121212] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group h-full"
          >
            <div>
              {/* Top row: Level badge on left, Word count badge on right */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border-2 border-[#121212] shadow-[1px_1px_0px_#121212] ${levelBadgeColor}`}>
                    {deck.level || "C1 / IELTS"}
                  </span>
                  {deck.is_owner && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10B981] text-white border border-[#121212]">
                      <User className="w-3 h-3" />
                      Shaxsiy
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 bg-[#F4EFEA] px-2.5 py-0.5 rounded-md border border-[#121212]/30">
                  <Layers className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{deck.card_count} so&apos;z</span>
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-black text-[#121212] group-hover:text-[#FA5A2A] transition line-clamp-1">
                {deck.title}
              </h3>

              <p className="text-sm font-medium text-zinc-600 line-clamp-2 leading-relaxed mt-2 min-h-[2.5rem]">
                {deck.description || "IELTS va CEFR akademik lug'at boyligini oshirish uchun maxsus to'plam."}
              </p>

              {/* Progress Section */}
              <div className="space-y-2 mt-4 pt-3.5 border-t-2 border-[#121212]/10">
                <div className="flex items-center justify-between font-mono text-xs font-black">
                  <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Xotira darajasi</span>
                  <span className="text-[#10B981]">
                    {Math.round(deck.mastery_percentage || 0)}%
                  </span>
                </div>

                <div className="h-2 w-full bg-[#F4EFEA] rounded-full border border-[#121212] overflow-hidden">
                  <div
                    className="h-full bg-[#10B981] transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, deck.mastery_percentage || 0))}%`,
                    }}
                  />
                </div>

                {/* Due / Learned status indicator */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FA5A2A]" />
                    {deck.due_count > 0 ? (
                      <span className="text-[#FA5A2A] font-bold">{deck.due_count} ta navbatda</span>
                    ) : (
                      <span className="text-zinc-500">Hammasi takrorlangan</span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-zinc-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{deck.learned_count} yodlandi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action Row */}
            <div className="mt-5 pt-3.5 border-t-2 border-[#121212]/10 flex items-center gap-2.5">
              <Link
                href={`/decks/${deck.id}/study`}
                className="flex-1 bg-[#FFCC00] hover:bg-[#F0C000] text-[#121212] font-black py-2.5 rounded-xl border-2 border-[#121212] shadow-[2px_2px_0px_#121212] flex items-center justify-center gap-2 text-xs sm:text-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
              >
                <BrainCircuit className="w-4 h-4 stroke-[2.5]" />
                <span>O&apos;rganish</span>
              </Link>

              <Link
                href={`/decks/${deck.id}`}
                className="bg-white hover:bg-[#F4EFEA] text-[#121212] font-bold p-2.5 rounded-xl border-2 border-[#121212] shadow-[2px_2px_0px_#121212] flex items-center justify-center transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                title="Barcha so'zlar ro'yxati"
              >
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
