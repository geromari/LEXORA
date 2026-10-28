"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Menu, 
  X,
  Flame, 
  LogOut, 
  ChevronDown,
  BookMarked,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { TelegramIcon } from "@/components/icons/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function GlassNavbar() {
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
    { href: "/#decks", label: "To'plamlar" },
    { href: "/review", label: "SRS Arena" },
    { href: "/#features", label: "Imkoniyatlar" },
    { href: "https://t.me/lexora_uzbot", label: "Telegram Bot", isExternal: true },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-5 px-4">
      <nav className="max-w-5xl mx-auto flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 shadow-2xl">
        
        {/* Brand Logo with Red Diamond */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.7)] group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold font-manrope tracking-tight text-white">
            Lexora<span className="text-[#ef233c]">.ai</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                  <span>{link.label}</span>
                </a>
              );
            }
            return (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action CTA */}
        <div className="flex items-center gap-3">
          {/* Quick Create Button */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                if (window.location.pathname === "/") {
                  window.dispatchEvent(new CustomEvent("open-create-deck-modal"));
                } else {
                  window.location.href = "/?create=true";
                }
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition"
            title="Yangi to'plam"
          >
            <Plus className="w-3.5 h-3.5 text-[#ef233c]" />
            <span>Yangi to&apos;plam</span>
          </button>

          {/* User Profile or Shiny CTA */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all cursor-pointer"
              >
                {/* Avatar dot with red glow */}
                <div className="w-6 h-6 rounded-full bg-[#ef233c] text-white flex items-center justify-center text-[11px] font-black shadow-[0_0_8px_rgba(239,35,60,0.6)]">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <span className="text-xs font-semibold truncate max-w-[90px]">
                  {user.username}
                </span>

                <span className="text-[11px] text-[#ef233c] font-bold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-[#ef233c]" />
                  {user.streak_count}d
                </span>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <div className="text-xs font-bold text-white truncate">{user.username}</div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {user.email || (user.telegram_id ? `Telegram ID: ${user.telegram_id}` : "Faol o'quvchi")}
                    </div>
                  </div>

                  <Link
                    href="/?filter=my"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      window.dispatchEvent(new CustomEvent("filter-my-decks"));
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <BookMarked className="w-4 h-4 text-[#ef233c]" />
                    <span>Mening lug&apos;atlarim</span>
                  </Link>

                  <Link
                    href="/review"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-[#ef233c] hover:bg-[#ef233c]/10 transition-all"
                  >
                    <Flame className="w-4 h-4 fill-[#ef233c] text-[#ef233c]" />
                    <span>Bugungi takrorlash ({user.total_due_words || 0})</span>
                  </Link>

                  {!user.telegram_id && (
                    <button
                      onClick={handleLinkTelegram}
                      disabled={isLinkingTelegram}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#229ED9] hover:bg-[#229ED9]/10 transition-all text-left disabled:opacity-50"
                    >
                      <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                      <span>{isLinkingTelegram ? "Telegram kutilmoqda..." : "Telegramni ulash"}</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-white/10" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => openAuthModal("login")}
                className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Kirish
              </button>

              {/* Shiny Red Noir Action CTA */}
              <button
                onClick={() => openAuthModal("register")}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white/5 px-5 py-2 transition-transform active:scale-95"
              >
                <span className="absolute inset-0 border border-white/10 rounded-full" />
                <span className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#ef233c_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute inset-[1px] rounded-full bg-black" />
                <span className="relative z-10 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
                  Boshlash{" "}
                  <ArrowRight className="w-3.5 h-3.5 text-[#ef233c] group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:text-white"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-5xl mx-auto px-2 mt-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            {user ? (
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ef233c] text-white flex items-center justify-center font-bold text-xs shadow-[0_0_8px_rgba(239,35,60,0.6)]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user.username}</div>
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
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="w-full rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold py-2.5 text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(239,35,60,0.4)]"
              >
                Kirish / Ro&apos;yxatdan o&apos;tish
              </button>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
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
