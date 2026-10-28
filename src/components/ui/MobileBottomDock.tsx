"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Flame, 
  Sparkles, 
  LayoutDashboard,
  BookMarked,
  Menu,
  LogIn,
  Zap,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileBottomDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [hasDueCards, setHasDueCards] = useState(false);

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

  const handleFilterMy = (e: React.MouseEvent) => {
    if (pathname === "/dashboard") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("filter-my-decks"));
      router.replace("/dashboard?filter=my");
    }
  };

  const handleToggleMenu = () => {
    window.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
  };

  const isUserPanel =
    Boolean(user) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/decks");

  return (
    <aside 
      aria-label="Mobil boshqaruv paneli"
      className="md:hidden fixed bottom-4 inset-x-3 max-w-md mx-auto z-40 pointer-events-auto"
    >
      <nav 
        aria-label="Mobil navigatsiya menyusi"
        className="rounded-full bg-white/90 dark:bg-black/85 border border-zinc-200/90 dark:border-white/10 p-1.5 backdrop-blur-2xl shadow-xl dark:shadow-2xl flex items-center justify-around relative transition-colors duration-300"
      >
        {isUserPanel ? (
          /* ========================================================= */
          /* A. AUTHENTICATED USER PANEL BOTTOM DOCK                   */
          /* ========================================================= */
          <>
            {/* 1. Dashboard */}
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "text-white bg-[#ef233c] shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Dashboard</span>
            </Link>

            {/* 2. Lug'atlarim */}
            <Link
              href="/dashboard?filter=my"
              onClick={handleFilterMy}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white`}
            >
              <BookMarked className="w-4 h-4 mb-0.5" />
              <span>Lug&apos;atlar</span>
            </Link>

            {/* 3. AI Smart Import Floating Action */}
            <button
              onClick={handleOpenAiModal}
              className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
              aria-label="AI Import"
            >
              <div className="w-11 h-11 rounded-full bg-[#ef233c] text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,35,60,0.6)] group-hover:scale-105 group-active:scale-95 transition-transform duration-200 border-2 border-white dark:border-zinc-900">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1 tracking-tight">
                AI Import
              </span>
            </button>

            {/* 4. SRS Arena */}
            <Link
              href="/review"
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 relative ${
                pathname === "/review"
                  ? "text-white bg-[#ef233c] shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                <Flame
                  className={`w-4 h-4 mb-0.5 ${
                    pathname === "/review"
                      ? "text-white fill-white"
                      : "text-[#ef233c]"
                  }`}
                />
                {hasDueCards && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef233c] animate-ping" />
                )}
              </div>
              <span>Takrorlash</span>
            </Link>

            {/* 5. Mobile Menu Trigger */}
            <button
              onClick={handleToggleMenu}
              className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full text-[10px] font-bold font-manrope text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span>Menyu</span>
            </button>
          </>
        ) : (
          /* ========================================================= */
          /* B. GUEST LANDING BOTTOM DOCK                              */
          /* ========================================================= */
          <>
            {/* 1. Asosiy (Landing) */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope transition-all duration-200 ${
                pathname === "/"
                  ? "text-white bg-[#ef233c] shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span>Bosh</span>
            </Link>

            {/* 2. Loyiha haqida */}
            <Link
              href="/#about"
              className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full text-[10px] font-bold font-manrope text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all duration-200"
            >
              <HelpCircle className="w-4 h-4 mb-0.5" />
              <span>Loyiha</span>
            </Link>

            {/* 3. AI Text-to-Deck Center Action */}
            <button
              onClick={handleOpenAiModal}
              className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-[#ef233c] text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,35,60,0.6)] group-hover:scale-105 group-active:scale-95 transition-transform duration-200 border-2 border-white dark:border-zinc-900">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1 tracking-tight">
                AI Import
              </span>
            </button>

            {/* 4. Imkoniyatlar */}
            <Link
              href="/#features"
              className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full text-[10px] font-bold font-manrope text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all duration-200"
            >
              <Zap className="w-4 h-4 mb-0.5" />
              <span>Funksiyalar</span>
            </Link>

            {/* 5. Kirish */}
            <button
              onClick={() => openAuthModal("login")}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-bold font-manrope text-zinc-600 dark:text-zinc-400 hover:text-[#ef233c] transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4 mb-0.5 text-[#ef233c]" />
              <span>Kirish</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
