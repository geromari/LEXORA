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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
            <main className="flex-1 w-full mx-auto relative z-10 pt-20 sm:pt-24">
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
