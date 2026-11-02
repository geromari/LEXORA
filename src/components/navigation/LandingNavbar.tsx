"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Menu, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/ui/GlassButton";

export function LandingNavbar() {
  const { user, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
      <nav className="rounded-full bg-[#23262F]/80 backdrop-blur-2xl border border-white/10 px-5 sm:px-7 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-300">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-[#B6FF2E] flex items-center justify-center text-[#15171C] font-black text-lg shadow-[0_0_20px_rgba(182,255,46,0.4)] group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-black font-manrope tracking-tight text-white">
              vydex
            </span>
            <span className="text-[#B6FF2E] font-black text-xl sm:text-2xl">.ai</span>
          </div>
        </Link>

        {/* Center Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
          <a href="/#about" className="hover:text-[#B6FF2E] transition-colors">
            Loyiha Haqida
          </a>
          <a href="/#features" className="hover:text-[#B6FF2E] transition-colors">
            Imkoniyatlar
          </a>
          <a href="/#methodology" className="hover:text-[#B6FF2E] transition-colors">
            Metodika (SRS)
          </a>
          <a href="/#decks" className="hover:text-[#B6FF2E] transition-colors">
            To&apos;plamlar
          </a>
          <a href="/#faq" className="hover:text-[#B6FF2E] transition-colors">
            FAQ
          </a>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <Link href="/dashboard">
              <GlassButton
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Kabinetga O&apos;tish
              </GlassButton>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Kirish
                </button>
              </Link>
              <Link href="/register">
                <GlassButton
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
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
            className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-5 rounded-3xl bg-[#23262F]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col space-y-3 text-sm font-medium text-zinc-200">
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/5"
            >
              Loyiha Haqida
            </a>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/5"
            >
              Imkoniyatlar
            </a>
            <a
              href="/#methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/5"
            >
              Metodika (SRS)
            </a>
            <a
              href="/#decks"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/5"
            >
              To&apos;plamlar
            </a>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-white/5"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
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
