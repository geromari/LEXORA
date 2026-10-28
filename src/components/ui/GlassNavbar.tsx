"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Sparkles
} from "lucide-react";
import { TelegramIcon } from "@/components/icons/BrandIcons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function GlassNavbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkPollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleLinkTelegram = async () => {
    try {
      setIsLinkingTelegram(true);
      const res = await api.initTelegramAuth();
      if (typeof window !== "undefined") {
        window.open(res.bot_url, "_blank");
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

  const navLinks = [
    { href: "/", label: "Bosh Sahifa" },
    { href: "/#about", label: "Loyiha haqida" },
    { href: "/#features", label: "Imkoniyatlar" },
    { href: "/dashboard", label: "Dashboard", highlight: true },
    { href: "/review", label: "SRS Arena" },
    { href: "https://t.me/vydex_uzbot", label: "Telegram Bot", isExternal: true },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-4 sm:pt-5 px-3 sm:px-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-full px-4 sm:px-6 py-2.5 shadow-lg dark:shadow-2xl transition-colors duration-300">
        
        {/* Brand Logo with Red Diamond */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.7)] group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold font-manrope tracking-tight text-zinc-900 dark:text-white">
            Vydex<span className="text-[#ef233c]">.ai</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>{link.label}</span>
                </a>
              );
            }

            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#ef233c] font-semibold"
                    : link.highlight
                    ? "text-zinc-900 dark:text-zinc-200 font-semibold hover:text-[#ef233c]"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {link.highlight && <LayoutDashboard className="w-3.5 h-3.5 text-[#ef233c]" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Action CTA & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Profile or Shiny CTA */}
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
                      window.dispatchEvent(new CustomEvent("filter-my-decks"));
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto px-2 mt-2">
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            {user ? (
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ef233c] text-white flex items-center justify-center font-bold text-xs shadow-[0_0_8px_rgba(239,35,60,0.6)]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">{user.username}</div>
                    <div className="text-[10px] text-[#ef233c] font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-[#ef233c]" />
                      {user.streak_count} kunlik faol seriya
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-500 text-xs hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("register");
                }}
                className="w-full rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold py-2.5 text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(239,35,60,0.4)]"
              >
                Google yoki Telegram bilan Boshlash
              </button>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition ${
                    pathname === link.href
                      ? "bg-red-50 dark:bg-red-950/30 text-[#ef233c] font-semibold"
                      : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
