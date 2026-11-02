"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Flame, 
  Sparkles, 
  LayoutDashboard,
  BookMarked,
  Shield,
  Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [hasDueCards, setHasDueCards] = useState(false);

  // Hide dock on landing page and auth pages
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedDue =
        localStorage.getItem("vydex_due_count") ||
        localStorage.getItem("lexora_due_count");
      if (cachedDue && Number(cachedDue) > 0) {
        setHasDueCards(true);
      }
    }
    if (user?.total_due_words && user.total_due_words > 0) {
      setHasDueCards(true);
    }
  }, [user]);

  const handleOpenAiModal = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/dashboard") {
      window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
    } else {
      router.push("/dashboard?ai=true");
    }
  };

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-1 px-4 py-2.5 rounded-full bg-[#23262F]/90 backdrop-blur-2xl border border-white/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(182,255,46,0.15)] max-w-sm w-full">
        {/* 1. Dashboard Decks */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
            pathname === "/dashboard"
              ? "text-[#B6FF2E] font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">To&apos;plamlar</span>
        </Link>

        {/* 2. SRS Review Arena */}
        <Link
          href="/review"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all ${
            pathname === "/review"
              ? "text-[#B6FF2E] font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {hasDueCards && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#B6FF2E] shadow-[0_0_8px_#B6FF2E] animate-ping" />
          )}
          <Flame className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Takrorlash</span>
        </Link>

        {/* 3. Center AI Spark Button */}
        <button
          type="button"
          onClick={handleOpenAiModal}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#B6FF2E] text-[#15171C] shadow-[0_0_20px_rgba(182,255,46,0.4)] active:scale-95 transition-transform cursor-pointer -mt-4 border-2 border-[#15171C]"
          aria-label="AI Import"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* 4. Admin Link */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
            pathname.startsWith("/admin")
              ? "text-[#B6FF2E] font-bold"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Admin</span>
        </Link>
      </nav>
    </div>
  );
}
