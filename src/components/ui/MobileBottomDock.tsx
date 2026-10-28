"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Plus 
} from "lucide-react";

export function MobileBottomDock() {
  const pathname = usePathname();
  const [hasDueCards, setHasDueCards] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedDue = localStorage.getItem("lexora_due_count");
      if (cachedDue && Number(cachedDue) > 0) {
        setHasDueCards(true);
      }
    }
  }, []);

  const handleOpenCreateModal = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-create-deck-modal"));
    }
  };

  const handleOpenAiModal = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
    }
  };

  return (
    <aside 
      aria-label="Mobil boshqaruv paneli"
      className="md:hidden fixed bottom-4 inset-x-3 max-w-md mx-auto z-50 pointer-events-auto"
    >
      <nav 
        aria-label="Mobil navigatsiya menyusi"
        className="rounded-full bg-black/85 border border-white/10 p-1.5 backdrop-blur-2xl shadow-2xl flex items-center justify-around relative"
      >
        {/* 1. Asosiy */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 ${
            pathname === "/"
              ? "text-white bg-[#ef233c] shadow-[0_0_12px_rgba(239,35,60,0.5)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Asosiy</span>
        </Link>

        {/* 2. Bugungi Takrorlash Arena */}
        <Link
          href="/review"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 relative ${
            pathname === "/review"
              ? "text-white bg-[#ef233c] shadow-[0_0_12px_rgba(239,35,60,0.5)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <div className="relative">
            <Flame
              className={`w-4 h-4 mb-0.5 ${
                pathname === "/review"
                  ? "text-white fill-white animate-pulse"
                  : "text-[#ef233c]"
              }`}
            />
            {hasDueCards && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef233c] animate-ping" />
            )}
          </div>
          <span>Arena</span>
        </Link>

        {/* 3. AI Text-to-Deck Center Action */}
        <Link
          href="/?ai=true"
          onClick={handleOpenAiModal}
          className="flex flex-col items-center justify-center -mt-5 group"
        >
          <div className="w-11 h-11 rounded-full bg-[#ef233c] text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,35,60,0.6)] group-hover:scale-105 group-active:scale-95 transition-transform duration-200 border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-zinc-300 mt-1 tracking-tight">
            AI Import
          </span>
        </Link>

        {/* 4. Lug'atlar to'plamlari */}
        <Link
          href="/#decks"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold text-zinc-400 hover:text-white transition-all duration-200"
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>To&apos;plamlar</span>
        </Link>

        {/* 5. Yangi to'plam yaratish */}
        <Link
          href="/?create=true"
          onClick={handleOpenCreateModal}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold text-zinc-400 hover:text-white transition-all duration-200"
        >
          <Plus className="w-4 h-4 mb-0.5 text-[#ef233c]" />
          <span>Yangi</span>
        </Link>
      </nav>
    </aside>
  );
}
