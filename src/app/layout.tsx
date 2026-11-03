import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { GlassNavbar } from "@/components/ui/GlassNavbar";
import { LandingFooter } from "@/components/navigation/LandingFooter";
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
  title: "Vydex AI — Aqlli Lug'at Takrorlash va Xotira Trenajyori",
  description:
    "Sun'iy intellekt va Spaced Repetition (SRS) xotira algoritmi asosida inglizcha so'zlarni muntazam takrorlash, xotirada mustahkamlash va so'z boyligini oshirish platformasi.",
  keywords: [
    "Lug'at",
    "Lug'at takrorlash",
    "Vocabulary",
    "So'z boyligi",
    "Flashcards",
    "Ingliz tili",
    "Vydex",
    "AI ta'lim",
    "Spaced Repetition",
    "SRS trenajyor",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-icon.png",
  },
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
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#15171C] text-white font-inter selection:bg-[#B6FF2E] selection:text-[#15171C] relative overflow-x-hidden transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {/* Ambient Graphite Depth & Lime Spark Glow */}
            <AmbientBackground />

            {/* Smart Navigation (Switches between LandingNavbar, DashboardNavbar, and AdminNavbar) */}
            <GlassNavbar />

            {/* Main Content Area */}
            <main className="flex-1 w-full mx-auto relative z-10 pt-20 sm:pt-24 pb-24 md:pb-12">
              {children}
            </main>

            {/* Global Auth Modal */}
            <AuthModal />

            {/* Mobile Bottom Navigation Dock (Visible inside app routes) */}
            <Suspense fallback={null}>
              <MobileBottomDock />
            </Suspense>

            {/* Landing Footer (ONLY displayed on landing page "/") */}
            <LandingFooter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
