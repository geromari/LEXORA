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
        className="rounded-3xl bg-white border-2 border-[#121212] p-1.5 shadow-[4px_4px_0px_#121212] flex items-center justify-around relative"
      >
        {/* 1. Bosh sahifa */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all duration-200 ${
            pathname === "/"
              ? "text-[#121212] bg-[#FFCC00] border border-[#121212]"
              : "text-zinc-600 hover:text-[#121212]"
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Asosiy</span>
        </Link>

        {/* 2. Bugungi Takrorlash Arena */}
        <Link
          href="/review"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all duration-200 relative ${
            pathname === "/review"
              ? "text-white bg-[#FA5A2A] border border-[#121212]"
              : "text-zinc-600 hover:text-[#121212]"
          }`}
        >
          <div className="relative">
            <Flame
              className={`w-5 h-5 mb-0.5 ${
                pathname === "/review"
                  ? "text-white fill-white animate-pulse"
                  : "text-[#FA5A2A]"
              }`}
            />
            {hasDueCards && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-ping" />
            )}
          </div>
          <span>Takrorlash</span>
        </Link>

        {/* 3. AI Text-to-Deck Center Action */}
        <Link
          href="/?ai=true"
          onClick={handleOpenAiModal}
          className="flex flex-col items-center justify-center -mt-6 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center shadow-[2px_2px_0px_#121212] group-hover:scale-105 group-active:scale-95 transition-transform duration-200">
            <Sparkles className="w-6 h-6 text-[#121212]" />
          </div>
          <span className="text-[10px] font-black text-[#121212] mt-1 tracking-tight">
            AI Import
          </span>
        </Link>

        {/* 4. Lug'atlar to'plamlari */}
        <Link
          href="/#decks"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black text-zinc-600 hover:text-[#121212] transition-all duration-200"
        >
          <BookOpen className="w-5 h-5 mb-0.5 text-[#2563EB]" />
          <span>To&apos;plamlar</span>
        </Link>

        {/* 5. Yangi to'plam yaratish */}
        <Link
          href="/?create=true"
          onClick={handleOpenCreateModal}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black text-zinc-600 hover:text-[#121212] transition-all duration-200"
        >
          <Plus className="w-5 h-5 mb-0.5 text-[#10B981] stroke-[2.5]" />
          <span>Yangi</span>
        </Link>
      </nav>
    </aside>
  );
}
