"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Menu, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/ui/GlassButton";

export function LandingNavbar() {
  const { user, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 max-w-7xl mx-auto">
      <nav className="rounded-full bg-white/90 dark:bg-[#23262F]/85 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 px-4 sm:px-7 py-2.5 sm:py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 transition-all duration-300">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <Image
            src="/logo.png"
            alt="Vydex AI Logo"
            width={34}
            height={34}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-[0_0_20px_rgba(182,255,46,0.35)] group-hover:scale-105 transition-transform shrink-0"
          />
          <span className="text-xl sm:text-2xl font-black font-manrope tracking-tight text-zinc-950 dark:text-white whitespace-nowrap flex items-center shrink-0">
            vydex<span className="text-emerald-600 dark:text-[#B6FF2E]">.ai</span>
          </span>
        </Link>

        {/* Center Nav Links - Desktop */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-zinc-700 dark:text-zinc-300 shrink-0">
          <a href="/#about" className="hover:text-emerald-600 dark:hover:text-[#B6FF2E] transition-colors whitespace-nowrap">
            Loyiha Haqida
          </a>
          <a href="/#features" className="hover:text-emerald-600 dark:hover:text-[#B6FF2E] transition-colors whitespace-nowrap">
            Imkoniyatlar
          </a>
          <a href="/#methodology" className="hover:text-emerald-600 dark:hover:text-[#B6FF2E] transition-colors whitespace-nowrap">
            Metodika (SRS)
          </a>
          <a href="/#decks" className="hover:text-emerald-600 dark:hover:text-[#B6FF2E] transition-colors whitespace-nowrap">
            To&apos;plamlar
          </a>
          <a href="/#faq" className="hover:text-emerald-600 dark:hover:text-[#B6FF2E] transition-colors whitespace-nowrap">
            FAQ
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          {user ? (
            <Link href="/dashboard" className="shrink-0">
              <GlassButton
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="whitespace-nowrap"
              >
                Kabinetga O&apos;tish
              </GlassButton>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link href="/login" className="shrink-0">
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Kirish
                </button>
              </Link>
              <Link href="/register" className="shrink-0">
                <GlassButton
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="whitespace-nowrap"
                >
                  Boshlash
                </GlassButton>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-5 rounded-3xl bg-white/95 dark:bg-[#23262F]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              Loyiha Haqida
            </a>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              Imkoniyatlar
            </a>
            <a
              href="/#methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              Metodika (SRS)
            </a>
            <a
              href="/#decks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              To&apos;plamlar
            </a>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex flex-col gap-2">
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <GlassButton variant="primary" size="md" className="w-full">
                  Foydalanuvchi Kabineti
                </GlassButton>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="graphite" size="md" className="w-full">
                    Kirish
                  </GlassButton>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="primary" size="md" className="w-full">
                    Ro&apos;yxatdan O&apos;tish
                  </GlassButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
