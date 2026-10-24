import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Lexora — O'zbek o'quvchilari uchun AI IELTS & CEFR Lug'at Platformasi",
  description:
    "Sun'iy intellekt (Gemini AI) yordamida IELTS va CEFR so'z boyligini samarali oshirish, matnlardan lug'at ajratish va kontekstual tekshiruv platformasi.",
  keywords: [
    "IELTS",
    "CEFR",
    "Lug'at",
    "Vocabulary",
    "Ingliz tili",
    "Uzbek",
    "Lexora",
    "AI ta'lim",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#F4EFEA] text-[#121212] font-sans relative selection:bg-[#FFCC00] selection:text-[#121212]">
        <AuthProvider>
          {/* Subtle Retro Dot Matrix Background */}
          <AmbientBackground />

          {/* Neobrutalist Header */}
          <GlassNavbar />

          {/* Main Content Area */}
          <main className="flex-1 w-full mx-auto relative z-10">
            {children}
          </main>

          {/* Global Auth Modal */}
          <AuthModal />

          {/* Mobile Glass Bottom Dock */}
          <Suspense fallback={null}>
            <MobileBottomDock />
          </Suspense>
        </AuthProvider>

        {/* Retro Neobrutalist Footer */}
        <footer className="w-full bg-[#F4EFEA] border-t-2 border-[#121212] py-8 px-4 sm:px-8 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-700">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#121212] tracking-tight">lexora.uz</span>
              <span>— O&apos;zbekiston yoshlari uchun AI & SRS akademik ta&apos;lim platformasi</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-600 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#121212]">
                <span className="w-2 h-2 rounded-full bg-[#10b981] border border-[#121212]"></span>
                Next.js 16 + FastAPI
              </span>
              <span>© 2026 Lexora. Barcha huquqlar himoyalangan.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

