import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { MobileBottomDock } from "@/components/ui/MobileBottomDock";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
  title: "Vydex AI — O'zbekiston yoshlari uchun AI IELTS/CEFR Lug'at Platformasi",
  description:
    "Sun'iy intellekt (Gemini AI) va Spaced Repetition xotira algoritmi asosida IELTS va CEFR akademik lug'at boyligini 10x tezroq rivojlantirish platformasi.",
  keywords: [
    "IELTS",
    "CEFR",
    "Lug'at",
    "Vocabulary",
    "Ingliz tili",
    "Vydex",
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
    <html lang="uz" className={`${inter.variable} ${manrope.variable} antialiased dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('vydex_theme');
                if (saved === 'light' || saved === 'dark') {
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add(saved);
                } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark', 'light');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white font-inter selection-red relative overflow-x-hidden transition-colors duration-300">
        <ThemeProvider>
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
        </ThemeProvider>

        {/* Responsive Footer (Light & Dark Mode) */}
        <footer className="bg-white/80 dark:bg-black border-t border-zinc-200 dark:border-white/10 pt-16 sm:pt-20 pb-12 relative overflow-hidden z-10 mt-20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-5 h-5 bg-[#ef233c] rounded-sm rotate-45 shadow-[0_0_12px_rgba(239,35,60,0.6)]" />
                <span className="text-2xl font-bold font-manrope tracking-tight text-zinc-900 dark:text-white">
                  vydex<span className="text-[#ef233c]">.ai</span>
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-sm leading-relaxed">
                O&apos;zbekiston yoshlari uchun sun&apos;iy intellekt va Spaced Repetition (SRS)
                algoritmlari asosida yaratilgan eng zamonaviy akademik ingliz tili platformasi.
              </p>
              <div className="mt-6 flex items-center gap-3 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#ef233c] animate-pulse" />
                  Gemini 2.5 Flash + Leitner SRS
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
                Bo&apos;limlar
              </h4>
              <ul className="space-y-3.5 text-zinc-600 dark:text-zinc-400 text-sm">
                <li>
                  <a href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Foydalanuvchi Kabineti (Dashboard)
                  </a>
                </li>
                <li>
                  <a href="/#about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Loyiha Haqida
                  </a>
                </li>
                <li>
                  <a href="/#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Imkoniyatlar
                  </a>
                </li>
                <li>
                  <a href="/review" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    SRS Takrorlash Arenasi
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#ef233c] uppercase tracking-widest mb-6 font-manrope">
                Aloqa &amp; Telegram
              </h4>
              <ul className="space-y-3.5 text-zinc-600 dark:text-zinc-400 text-sm">
                <li>
                  <a
                    href="https://t.me/vydex_uzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#229ED9] transition-colors flex items-center gap-1.5"
                  >
                    <span>Telegram Bot</span>
                    <span className="text-[10px] text-[#ef233c] font-mono">@vydex_uzbot</span>
                  </a>
                </li>
                <li>
                  <a href="/#faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Ko&apos;p Beriladigan Savollar (FAQ)
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Mening Lug&apos;atlarim
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Huge Outline Watermark Text */}
          <div className="flex justify-center items-center py-6 opacity-10 dark:opacity-15 pointer-events-none select-none overflow-hidden">
            <h1 className="text-[15vw] leading-none font-bold font-manrope tracking-tighter text-zinc-300 dark:text-stroke select-none">
              VYDEX
            </h1>
          </div>

          <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs tracking-wider gap-4">
            <p>© 2026 Vydex AI. O&apos;zbekiston. Barcha huquqlar himoyalangan.</p>
            <div className="flex gap-6">
              <a
                href="https://t.me/vydex_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
              >
                Telegram Bot
              </a>
              <a href="/dashboard" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
                Dashboard
              </a>
              <a href="/review" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">
                SRS Arena
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
