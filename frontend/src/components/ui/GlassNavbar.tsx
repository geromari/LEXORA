"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Menu, 
  X,
  Flame, 
  LogIn, 
  LogOut, 
  ChevronDown,
  BookMarked
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
    { href: "#how-it-works", label: "How it works" },
    { href: "/#decks", label: "To'plamlar" },
    { href: "/review", label: "SRS Tizimi" },
    { href: "https://t.me/lexora_uzbot", label: "Telegram Bot", isExternal: true },
  ];

  return (
    <header className="w-full bg-[#F4EFEA] pt-5 pb-2 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
        
        {/* ====================================================================
            LOGO (matching 'doesitfit.lol' typography from image)
            ==================================================================== */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl sm:text-[28px] font-black text-[#121212] tracking-tighter">
            lexora<span className="text-[#FA5A2A]">.uz</span>
          </span>
          <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#FFCC00] border border-[#121212] ml-1 shadow-[1px_1px_0px_#121212]" />
        </Link>

        {/* ====================================================================
            CENTER NAVIGATION LINKS (matching image header)
            ==================================================================== */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-[#121212]">
          {navLinks.map((link) => {
            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#FA5A2A] transition-colors"
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
                className="hover:text-[#FA5A2A] transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ====================================================================
            RIGHT ACTION CTA (matching 'Open app' pill button from image)
            ==================================================================== */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick Create Deck button */}
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
            className="flex items-center gap-1.5 text-xs font-bold text-[#121212] hover:text-[#FA5A2A] px-3 py-2 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi to&apos;plam</span>
          </button>

          {/* User Profile or Open app Button */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#121212] bg-white text-[#121212] font-bold text-sm shadow-[2px_2px_0px_#121212] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
              >
                {/* Avatar dot */}
                <div className="w-6 h-6 rounded-full bg-[#FFCC00] border border-[#121212] flex items-center justify-center text-[11px] font-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <span className="text-xs font-black truncate max-w-[100px]">
                  {user.username}
                </span>

                <span className="text-[11px] text-[#FA5A2A] font-black flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-[#FA5A2A]" />
                  {user.streak_count}d
                </span>

                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border-[2.5px] border-[#121212] bg-white p-2 shadow-[4px_4px_0px_#121212] z-50">
                  <div className="px-3 py-2 border-b-2 border-[#121212]/10 mb-1">
                    <div className="text-xs font-black text-[#121212] truncate">{user.username}</div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {user.email || (user.telegram_id ? `Telegram ID: ${user.telegram_id}` : "Faol o'quvchi")}
                    </div>
                  </div>

                  <Link
                    href="/?filter=my"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      window.dispatchEvent(new CustomEvent("filter-my-decks"));
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#121212] hover:bg-[#F4EFEA] transition-all"
                  >
                    <BookMarked className="w-4 h-4 text-[#2563EB]" />
                    <span>Mening lug&apos;atlarim</span>
                  </Link>

                  <Link
                    href="/review"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#FA5A2A] hover:bg-[#FA5A2A]/10 transition-all"
                  >
                    <Flame className="w-4 h-4 fill-[#FA5A2A]" />
                    <span>Bugungi takrorlash ({user.total_due_words || 0})</span>
                  </Link>

                  {!user.telegram_id && (
                    <button
                      onClick={handleLinkTelegram}
                      disabled={isLinkingTelegram}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#229ED9] hover:bg-[#229ED9]/10 transition-all text-left disabled:opacity-50"
                    >
                      <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                      <span>{isLinkingTelegram ? "Telegram kutilmoqda..." : "Telegramni ulash"}</span>
                    </button>
                  )}

                  <div className="my-1 border-t-2 border-[#121212]/10" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Chiqish (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="rounded-full border-2 border-[#121212] bg-white text-[#121212] px-6 py-2 font-bold text-sm shadow-[2px_2px_0px_#121212] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
            >
              Open app
            </button>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border-2 border-[#121212] bg-white text-[#121212] shadow-[2px_2px_0px_#121212]"
          aria-label="Menyu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto px-4 mt-3">
          <div className="rounded-2xl border-2 border-[#121212] bg-white p-4 shadow-[4px_4px_0px_#121212] space-y-3">
            {user ? (
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center font-black text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#121212]">{user.username}</div>
                    <div className="text-[10px] text-[#FA5A2A] font-bold">🔥 {user.streak_count} kunlik seriya</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-1.5 rounded-lg border border-rose-300 text-rose-600 text-xs font-bold"
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
                className="w-full rounded-xl border-2 border-[#121212] bg-[#FFCC00] text-[#121212] font-black py-2.5 shadow-[2px_2px_0px_#121212]"
              >
                Open app (Kirish)
              </button>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-bold text-[#121212] hover:bg-[#F4EFEA] rounded-lg transition"
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
