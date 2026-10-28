import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { MobileBottomDock } from "@/components/ui/MobileBottomDock";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexora AI — Design & Vocabulary Intelligence for IELTS & CEFR",
  description:
    "Sun'iy intellekt (Gemini AI) va Spaced Repetition xotira algoritmi asosida IELTS va CEFR akademik lug'at boyligini 10x tezroq rivojlantirish platformasi.",
  keywords: [
    "IELTS",
    "CEFR",
    "Lug'at",
    "Vocabulary",
    "Ingliz tili",
    "Lexora",
    "AI ta'lim",
    "Spaced Repetition",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} ${manrope.variable} antialiased dark`}>
      <body className="min-h-screen flex flex-col bg-black text-white font-inter selection-red relative overflow-x-hidden">
        <AuthProvider>
          {/* Parallax Stars, Deep Noir Crimson Ambient & Blur Header */}
          <AmbientBackground />

          {/* Floating Pill Glass Navbar */}
          <GlassNavbar />

          {/* Main Content Area */}
          <main className="flex-1 w-full mx-auto relative z-10 pt-24 sm:pt-28">
            {children}
          </main>

          {/* Global Auth Modal */}
          <AuthModal />

          {/* Mobile Bottom Navigation Dock */}
          <Suspense fallback={null}>
            <MobileBottomDock />
          </Suspense>
        </AuthProvider>

        {/* Red Noir Signature Footer */}
        <footer className="bg-black border-t border-white/10 pt-20 pb-12 relative overflow-hidden z-10 mt-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.6)]" />
                <span className="text-2xl font-bold font-manrope tracking-tight text-white">
                  lexora<span className="text-[#ef233c]">.uz</span>
                </span>
              </div>
              <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                O&apos;zbekiston yoshlari uchun sun&apos;iy intellekt va Spaced Repetition (SRS)
                algoritmlari asosida yaratilgan eng zamonaviy akademik ingliz tili platformasi.
              </p>
              <div className="mt-6 flex items-center gap-3 text-xs font-mono text-zinc-500">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-[#ef233c] animate-pulse" />
                  Gemini 2.5 Flash + SRS v2
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
                Platforma
              </h4>
              <ul className="space-y-3.5 text-zinc-400 text-sm">
                <li>
                  <a href="/#decks" className="hover:text-white transition-colors">
                    Lug&apos;at To&apos;plamlari
                  </a>
                </li>
                <li>
                  <a href="/review" className="hover:text-white transition-colors">
                    SRS Takrorlash Arenasi
                  </a>
                </li>
                <li>
                  <a href="/?ai=true" className="hover:text-white transition-colors">
                    AI Matndan Import
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/lexora_uzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Telegram Bot</span>
                    <span className="text-[10px] text-[#ef233c] font-mono">@lexora_uzbot</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
                Darajalar & Tizim
              </h4>
              <ul className="space-y-3.5 text-zinc-400 text-sm">
                <li>
                  <a href="/#decks" className="hover:text-white transition-colors">
                    IELTS Academic 7.5+
                  </a>
                </li>
                <li>
                  <a href="/#decks" className="hover:text-white transition-colors">
                    CEFR C1 / C2 Vocab
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className="hover:text-white transition-colors">
                    Leitner Xotira Qoidasi
                  </a>
                </li>
                <li>
                  <a href="/#stats" className="hover:text-white transition-colors">
                    O&apos;quv Statistikasi
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Huge Noir Outline Watermark Text matching reference */}
          <div className="flex justify-center items-center py-6 opacity-15 pointer-events-none select-none overflow-hidden">
            <h1 className="text-[15vw] leading-none font-bold font-manrope tracking-tighter text-stroke select-none">
              LEXORA
            </h1>
          </div>

          <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs tracking-wider gap-4">
            <p>© 2026 Lexora AI Inc. Barcha huquqlar himoyalangan.</p>
            <div className="flex gap-6">
              <a
                href="https://t.me/lexora_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-300 transition-colors"
              >
                Telegram Bot
              </a>
              <a href="/#decks" className="hover:text-zinc-300 transition-colors">
                Katalog
              </a>
              <a href="/review" className="hover:text-zinc-300 transition-colors">
                Arena
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
