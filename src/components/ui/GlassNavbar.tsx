"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Plus, 
  Menu, 
  X, 
  Flame, 
  LogOut, 
  ChevronDown, 
  BookMarked, 
  ArrowRight,
  LayoutDashboard,
  Sparkles,
  Home,
  HelpCircle,
  Zap,
  Layers,
  ExternalLink,
  UserCheck
} from "lucide-react";
import { TelegramIcon } from "@/components/icons/BrandIcons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function GlassNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuthModal, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current view is inside the user personal cabinet or user is authenticated
  const isUserPanel =
    Boolean(user) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/decks");

  const handleLinkTelegram = async () => {
    try {
      setIsLinkingTelegram(true);
      const isMobile =
        typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let authTab: Window | null = null;
      if (!isMobile && typeof window !== "undefined") {
        authTab = window.open("about:blank", "_blank");
      }

      const res = await api.initTelegramAuth();
      if (authTab) {
        authTab.location.href = res.bot_url;
      } else if (typeof window !== "undefined") {
        window.location.href = res.bot_url;
      }

      if (linkPollingRef.current) clearInterval(linkPollingRef.current);
      linkPollingRef.current = setInterval(async () => {
        try {
          const statusRes = await api.checkTelegramAuthStatus(res.session_token);
          if (statusRes.status === "completed") {
            if (linkPollingRef.current) clearInterval(linkPollingRef.current);
            setIsLinkingTelegram(false);
            await refreshUser();
          }
        } catch {
          // ignore error
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to link telegram:", err);
      setIsLinkingTelegram(false);
    }
  };

  useEffect(() => {
    return () => {
      if (linkPollingRef.current) clearInterval(linkPollingRef.current);
    };
  }, []);

  // Listen to toggle-mobile-menu event from bottom dock
  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-menu", handleToggle);
    return () => window.removeEventListener("toggle-mobile-menu", handleToggle);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick Action: Open Create Deck
  const handleOpenCreateDeck = () => {
    setMobileMenuOpen(false);
    if (pathname === "/dashboard") {
      window.dispatchEvent(new CustomEvent("open-create-deck-modal"));
    } else {
      router.push("/dashboard?create=true");
    }
  };

  // Quick Action: Open AI Smart Import
  const handleOpenAiImport = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (pathname === "/dashboard") {
      window.dispatchEvent(new CustomEvent("open-ai-import-modal"));
    } else {
      router.push("/dashboard?ai=true");
    }
  };

  // Quick Action: Filter My Decks
  const handleFilterMyDecks = (e?: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (pathname === "/dashboard") {
      if (e) e.preventDefault();
      window.dispatchEvent(new CustomEvent("filter-my-decks"));
      router.replace("/dashboard?filter=my");
    } else {
      router.push("/dashboard?filter=my");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-4 sm:pt-5 px-3 sm:px-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-lg dark:shadow-2xl transition-colors duration-300">
        
        {/* Brand Logo with Red Diamond */}
        <Link 
          href={isUserPanel ? "/dashboard" : "/"} 
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.7)] group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold font-manrope tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
            <span>Vydex<span className="text-[#ef233c]">.ai</span></span>
            {isUserPanel && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#ef233c] border border-red-200 dark:border-red-900/50">
                Kabinet
              </span>
            )}
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          {isUserPanel ? (
            /* ============================================================ */
            /* 1. AUTHENTICATED USER PANEL NAVIGATION                       */
            /* ============================================================ */
            <>
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/dashboard"
                    ? "text-[#ef233c]"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#ef233c]" />
                <span>Dashboard</span>
              </Link>

              {/* Mening Lug'atlarim */}
              <Link
                href="/dashboard?filter=my"
                onClick={handleFilterMyDecks}
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <BookMarked className="w-4 h-4 text-[#ef233c]" />
                <span>Mening lug&apos;atlarim</span>
              </Link>

              {/* SRS Takrorlash Arenasi */}
              <Link
                href="/review"
                className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 relative ${
                  pathname === "/review"
                    ? "text-[#ef233c]"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4 fill-[#ef233c] text-[#ef233c]" />
                <span>SRS Takrorlash</span>
                {user?.total_due_words && user.total_due_words > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#ef233c] text-white text-[10px] font-mono font-bold leading-tight shadow-sm">
                    {user.total_due_words}
                  </span>
                ) : null}
              </Link>

              {/* AI Smart Import */}
              <button
                onClick={handleOpenAiImport}
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#ef233c]" />
                <span>AI Import</span>
              </button>

              {/* Telegram Bot */}
              <a
                href="https://t.me/vydex_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>Bot</span>
              </a>
            </>
          ) : (
            /* ============================================================ */
            /* 2. GUEST LANDING PAGE NAVIGATION                             */
            /* ============================================================ */
            <>
              <Link
                href="/"
                className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname === "/"
                    ? "text-[#ef233c]"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Bosh Sahifa</span>
              </Link>

              <Link
                href="/#about"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Loyiha haqida</span>
              </Link>

              <Link
                href="/#features"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Imkoniyatlar</span>
              </Link>

              <a
                href="https://t.me/vydex_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>Telegram Bot</span>
              </a>
            </>
          )}
        </div>

        {/* Right Action CTA & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick "+ Yangi To'plam" action in User Panel */}
          {isUserPanel && (
            <button
              onClick={handleOpenCreateDeck}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-xs shadow-[0_0_12px_rgba(239,35,60,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi to&apos;plam</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Profile or Guest Auth Buttons */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#ef233c] text-white flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(239,35,60,0.6)]">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <span className="text-xs font-semibold truncate max-w-[80px] sm:max-w-[100px]">
                  {user.username}
                </span>

                <span className="text-[11px] text-[#ef233c] font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-[#ef233c]" />
                  {user.streak_count}d
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 text-zinc-900 dark:text-white">
                  <div className="px-3 py-2.5 border-b border-zinc-200 dark:border-white/10 mb-1">
                    <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.username}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email || (user.telegram_id ? `Telegram: @${user.username}` : "Faol o'quvchi")}
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-[#ef233c] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#ef233c]" />
                    <span>Mening Dashboardim</span>
                  </Link>

                  <Link
                    href="/dashboard?filter=my"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleFilterMyDecks();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-[#ef233c] transition-all"
                  >
                    <BookMarked className="w-4 h-4 text-[#ef233c]" />
                    <span>Mening lug&apos;atlarim</span>
                  </Link>

                  <Link
                    href="/review"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#ef233c] hover:bg-red-50 dark:hover:bg-[#ef233c]/10 transition-all"
                  >
                    <Flame className="w-4 h-4 fill-[#ef233c] text-[#ef233c]" />
                    <span>Bugungi takrorlash ({user.total_due_words || 0})</span>
                  </Link>

                  {!user.telegram_id && (
                    <button
                      onClick={handleLinkTelegram}
                      disabled={isLinkingTelegram}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#229ED9] hover:bg-sky-50 dark:hover:bg-[#229ED9]/10 transition-all text-left disabled:opacity-50 cursor-pointer"
                    >
                      <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                      <span>{isLinkingTelegram ? "Telegram kutilmoqda..." : "Telegramni ulash"}</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-zinc-200 dark:border-white/10" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="hidden sm:block text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Kirish
              </button>

              <button
                onClick={() => openAuthModal("register")}
                className="px-4 py-2 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,35,60,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <span>Boshlash</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* =================================================================== */}
      {/* MOBILE DRAWER (Tailored specifically for User Panel vs Guest Landing)*/}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto px-2 mt-2 animate-in fade-in-50 slide-in-from-top-2 duration-200">
          <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            
            {user ? (
              /* ========================================================= */
              /* A. LOGGED-IN USER PROFILE HEADER & CABINET DRAWER         */
              /* ========================================================= */
              <>
                {/* User Card */}
                <div className="p-3.5 rounded-2xl bg-zinc-100/90 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ef233c] text-white flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(239,35,60,0.6)]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.username}</span>
                        {user.telegram_id && <UserCheck className="w-3.5 h-3.5 text-[#229ED9]" />}
                      </div>
                      <div className="text-xs text-[#ef233c] font-semibold flex items-center gap-1 mt-0.5">
                        <Flame className="w-3.5 h-3.5 fill-[#ef233c]" />
                        <span>{user.streak_count || 0} kunlik faol seriya</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                    title="Chiqish"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Due alert banner if any */}
                {user.total_due_words && user.total_due_words > 0 ? (
                  <Link
                    href="/review"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 flex items-center justify-between text-xs font-semibold text-[#ef233c] hover:bg-red-100 transition shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 fill-[#ef233c]" />
                      <span>Bugun takrorlash navbatida: {user.total_due_words} ta so&apos;z</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}

                {/* User Panel Navigations */}
                <div className="space-y-1 pt-1">
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Shaxsiy Kabinet
                  </div>

                  {/* 1. Dashboard */}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                      pathname === "/dashboard"
                        ? "bg-red-50 dark:bg-red-950/40 text-[#ef233c] border border-red-200 dark:border-red-500/30 font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-[#ef233c]" />
                      <span>Dashboard (Boshqaruv paneli)</span>
                    </div>
                  </Link>

                  {/* 2. Mening Lug'atlarim */}
                  <Link
                    href="/dashboard?filter=my"
                    onClick={() => handleFilterMyDecks()}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <BookMarked className="w-4 h-4 text-[#ef233c]" />
                      <span>Mening lug&apos;atlarim</span>
                    </div>
                  </Link>

                  {/* 3. SRS Takrorlash Arenasi */}
                  <Link
                    href="/review"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                      pathname === "/review"
                        ? "bg-red-50 dark:bg-red-950/40 text-[#ef233c] border border-red-200 dark:border-red-500/30 font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-4 h-4 fill-[#ef233c] text-[#ef233c]" />
                      <span>SRS Takrorlash Arenasi</span>
                    </div>
                    {user.total_due_words ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#ef233c] text-white text-[10px] font-bold">
                        {user.total_due_words}
                      </span>
                    ) : null}
                  </Link>

                  {/* 4. AI Smart Import */}
                  <button
                    onClick={() => handleOpenAiImport()}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#ef233c]" />
                      <span>AI Smart Import (Matndan lug&apos;at)</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-[#ef233c] font-bold">
                      AI
                    </span>
                  </button>

                  {/* 5. Yangi To'plam Yaratish */}
                  <button
                    onClick={handleOpenCreateDeck}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#ef233c]" />
                    <span>Yangi to&apos;plam yaratish</span>
                  </button>

                  {/* 6. Telegram Bot */}
                  <a
                    href="https://t.me/vydex_uzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                      <span>Telegram Bot (@vydex_uzbot)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">↗</span>
                  </a>
                </div>

                {/* Account Utilities & Links */}
                <div className="pt-2 border-t border-zinc-200 dark:border-white/10 space-y-2">
                  {!user.telegram_id && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLinkTelegram();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-50 dark:bg-[#229ED9]/10 text-[#229ED9] text-xs font-semibold hover:bg-sky-100 transition"
                    >
                      <TelegramIcon className="w-3.5 h-3.5" />
                      <span>Telegram hisobini ulash</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* ========================================================= */
              /* B. GUEST LANDING PAGE DRAWER                              */
              /* ========================================================= */
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("register");
                  }}
                  className="w-full rounded-2xl bg-[#ef233c] hover:bg-red-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2"
                >
                  <span>Google yoki Telegram bilan Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Navigatsiya
                  </div>

                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl transition ${
                      pathname === "/"
                        ? "bg-red-50 dark:bg-red-950/30 text-[#ef233c] font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <Home className="w-4 h-4 text-[#ef233c]" />
                    <span>Bosh Sahifa</span>
                  </Link>

                  <Link
                    href="/#about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    <HelpCircle className="w-4 h-4 text-[#ef233c]" />
                    <span>Loyiha haqida</span>
                  </Link>

                  <Link
                    href="/#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    <Zap className="w-4 h-4 text-[#ef233c]" />
                    <span>Imkoniyatlar</span>
                  </Link>

                  <a
                    href="https://t.me/vydex_uzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                      <span>Telegram Bot (@vydex_uzbot)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">↗</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between px-2">
                  <span className="text-xs text-zinc-500">Akkauntingiz bormi?</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="text-xs font-bold text-[#ef233c] hover:underline"
                  >
                    Kirish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
