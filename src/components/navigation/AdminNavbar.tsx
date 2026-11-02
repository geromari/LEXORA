"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, ArrowLeft, Database, UserCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlassButton } from "@/components/ui/GlassButton";

export function AdminNavbar() {
  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
      <nav className="rounded-full bg-white/90 dark:bg-[#1A1D24]/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 px-5 sm:px-7 py-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_35px_-10px_rgba(0,0,0,0.6)] flex items-center justify-between transition-colors">
        {/* Brand with Admin label */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="Lexora Logo"
              width={34}
              height={34}
              className="w-8 h-8 rounded-xl object-contain shadow-[0_0_20px_rgba(182,255,46,0.35)] group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-black font-manrope tracking-tight text-zinc-950 dark:text-white">
              vydex<span className="text-emerald-600 dark:text-[#B6FF2E]">.ai</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B6FF2E]/15 border border-emerald-500/20 dark:border-[#B6FF2E]/30 text-xs font-mono font-bold text-emerald-800 dark:text-[#B6FF2E]">
            <Shield className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR PANELI</span>
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link href="/dashboard">
            <GlassButton
              variant="graphite"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Foydalanuvchi Kabinetiga Qaytish
            </GlassButton>
          </Link>
        </div>
      </nav>
    </header>
  );
}
