"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame,
  Plus,
  Sparkles,
  BookMarked,
  LogOut,
  ChevronDown,
  Layers,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Shield,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/ui/GlassButton";
import { TelegramIcon } from "@/components/icons/BrandIcons";

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, openAuthModal } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateDeck = () => {
    window.dispatchEvent(new CustomEvent("open-create-deck-modal"));
  };

  const handleAIImport = () => {
    window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
      <nav className="rounded-full bg-white/90 dark:bg-[#23262F]/85 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 px-5 sm:px-7 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between transition-colors">
        {/* Brand with Dashboard badge */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Lexora Logo"
              width={34}
              height={34}
              className="w-8 h-8 rounded-xl object-contain shadow-[0_0_20px_rgba(182,255,46,0.35)] group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center">
              <span className="text-xl font-black font-manrope tracking-tight text-zinc-950 dark:text-white">
                vydex
              </span>
              <span className="text-emerald-600 dark:text-[#B6FF2E] font-black text-xl">.ai</span>
            </div>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/20 dark:border-[#B6FF2E]/30">
            KABINET
          </span>
        </div>

        {/* Center Quick Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_15px_rgba(182,255,46,0.3)]"
                : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Mening To&apos;plamlarim
          </Link>

          <Link
            href="/review"
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/review"
                ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_15px_rgba(182,255,46,0.3)]"
                : "text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>Takrorlash Arenasi</span>
          </Link>

          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-[#B6FF2E] hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick AI Import button */}
          <button
            type="button"
            onClick={handleAIImport}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#15171C] text-emerald-800 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 text-xs font-bold hover:bg-[#B6FF2E]/10 hover:border-[#B6FF2E] transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Import</span>
          </button>

          {/* Create Deck Button */}
          <button
            type="button"
            onClick={handleCreateDeck}
            className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#B6FF2E] text-[#15171C] text-xs font-extrabold hover:bg-[#a5ee24] transition-all cursor-pointer shadow-[0_0_20px_rgba(182,255,46,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi To&apos;plam</span>
          </button>

          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-800 dark:text-zinc-200">
            <Flame className="w-4 h-4 text-amber-500 dark:text-[#B6FF2E] animate-pulse" />
            <span className="font-bold text-amber-600 dark:text-[#B6FF2E]">
              {user?.streak_count || 0}
            </span>
            <span className="hidden sm:inline text-zinc-500">kun</span>
          </div>

          <ThemeToggle />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-[#B6FF2E]/40 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#B6FF2E] text-[#15171C] font-black text-xs flex items-center justify-center">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 mr-1" />
              </button>
            ) : (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => openAuthModal("login")}
              >
                Kirish
              </GlassButton>
            )}

            {/* Dropdown Menu */}
            {profileOpen && user && (
              <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-white/95 dark:bg-[#23262F]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 p-3 shadow-2xl space-y-2 z-50">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-white/10">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Tizimdagi foydalanuvchi:</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  {user.email && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-[#B6FF2E]" />
                    <span>Mening Kabinetim</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-[#B6FF2E]"
                  >
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-[#B6FF2E]" />
                    <span>Admin Boshqaruv Paneli</span>
                  </Link>

                  <a
                    href="https://t.me/vydex_uzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                  >
                    <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                    <span>Telegram Bot (@vydex_uzbot)</span>
                  </a>

                  <Link
                    href="/"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Landing Sahifasiga O&apos;tish</span>
                  </Link>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      router.push("/");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
