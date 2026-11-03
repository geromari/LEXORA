"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, Database, UserCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/ui/GlassButton";

export function AdminNavbar() {
  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 max-w-7xl mx-auto">
      <nav className="w-full rounded-full bg-white/90 dark:bg-[#1A1D24]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 px-3.5 sm:px-7 py-2.5 sm:py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between gap-2 sm:gap-3 transition-colors">
        {/* Brand with Admin label */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/logo.png"
              alt="Vydex AI Logo"
              width={34}
              height={34}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-contain shadow-[0_0_20px_rgba(182,255,46,0.35)] group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="text-lg sm:text-xl font-black font-manrope tracking-tight text-zinc-950 dark:text-white whitespace-nowrap flex items-center shrink-0">
              vydex<span className="text-emerald-600 dark:text-[#B6FF2E]">.ai</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B6FF2E]/15 border border-emerald-500/20 dark:border-[#B6FF2E]/30 text-xs font-mono font-bold text-emerald-800 dark:text-[#B6FF2E] shrink-0 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>ADMINISTRATOR PANELI</span>
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link href="/dashboard" className="shrink-0">
            <GlassButton
              variant="graphite"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5 shrink-0" />}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Foydalanuvchi </span>Kabinetiga Qaytish
            </GlassButton>
          </Link>
        </div>
      </nav>
    </header>
  );
}
