"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TelegramIcon } from "@/components/icons/BrandIcons";

export function LandingFooter() {
  const pathname = usePathname();

  // ONLY show footer on the landing page ("/")
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="bg-zinc-100 dark:bg-[#15171C] border-t border-zinc-200 dark:border-white/10 pt-16 sm:pt-20 pb-12 relative overflow-hidden z-10 mt-24 text-zinc-900 dark:text-white transition-colors">
      {/* Subtle top lime glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#B6FF2E]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <Image
              src="/logo.png"
              alt="Lexora Logo"
              width={34}
              height={34}
              className="w-8 h-8 rounded-xl object-contain shadow-[0_0_20px_rgba(182,255,46,0.35)]"
            />
            <span className="text-2xl font-black font-manrope tracking-tight text-zinc-950 dark:text-white">
              vydex<span className="text-emerald-600 dark:text-[#B6FF2E]">.ai</span>
            </span>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm leading-relaxed font-inter">
            O&apos;zbekiston yoshlari uchun sun&apos;iy intellekt va Spaced Repetition (SRS)
            Leitner algoritmlari asosida yaratilgan zamonaviy akademik ingliz tili lug&apos;at platformasi.
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#23262F] border border-zinc-300 dark:border-white/10 text-emerald-800 dark:text-[#B6FF2E] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#B6FF2E] animate-pulse" />
              Gemini 3.5 AI + Leitner SRS Engine
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-700 dark:text-[#B6FF2E] uppercase tracking-widest mb-6 font-manrope">
            Bo&apos;limlar
          </h4>
          <ul className="space-y-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
            <li>
              <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">
                Foydalanuvchi Kabineti (Dashboard)
              </Link>
            </li>
            <li>
              <a href="/#about" className="hover:text-black dark:hover:text-white transition-colors">
                Loyiha Haqida
              </a>
            </li>
            <li>
              <a href="/#features" className="hover:text-black dark:hover:text-white transition-colors">
                Imkoniyatlar
              </a>
            </li>
            <li>
              <a href="/#methodology" className="hover:text-black dark:hover:text-white transition-colors">
                SRS Metodikasi
              </a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-black dark:hover:text-white transition-colors">
                Ko&apos;p Beriladigan Savollar
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-emerald-700 dark:text-[#B6FF2E] uppercase tracking-widest mb-6 font-manrope">
            Ekosistema
          </h4>
          <ul className="space-y-3.5 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
            <li>
              <a
                href="https://t.me/vydex_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>Telegram Bot (@vydex_uzbot)</span>
              </a>
            </li>
            <li>
              <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">
                Tizimga Kirish
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-black dark:hover:text-white transition-colors">
                Ro&apos;yxatdan O&apos;tish
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-black dark:hover:text-white transition-colors">
                Admin Paneli
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 dark:border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© {new Date().getFullYear()} Vydex AI • Lexora Edition. Barcha huquqlar himoyalangan.</p>
        <p className="font-mono">Toshkent, O&apos;zbekiston</p>
      </div>
    </footer>
  );
}
