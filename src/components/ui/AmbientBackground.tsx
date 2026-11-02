"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export function AmbientBackground() {
  const { theme } = useTheme();

  return (
    <>
      {/* Global Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-colors duration-500">
        {theme === "dark" ? (
          <>
            {/* Deep Graphite Dark Gradient: #15171C -> #1B1E24 -> #23262F */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#15171C] via-[#1B1E25] to-[#15171C]" />

            {/* Ambient Lime Spark Glow in top-right */}
            <div className="absolute top-10 right-1/4 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] bg-[#B6FF2E]/6 rounded-full blur-[160px] pointer-events-none" />

            {/* Ambient Graphite Depth Glow in bottom-left */}
            <div className="absolute bottom-20 left-10 w-[600px] h-[600px] bg-[#23262F]/80 rounded-full blur-[140px] pointer-events-none" />

            {/* Subtle Neon Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_90%)]" />
          </>
        ) : (
          <>
            {/* Clean Light Background with Subtle Lime & Graphite Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-zinc-50 to-white" />

            {/* Ambient Lime Spark Glow */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] bg-[#B6FF2E]/15 rounded-full blur-[130px] pointer-events-none" />

            {/* Subtle Light Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(35,38,47,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(35,38,47,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_90%)]" />
          </>
        )}
      </div>

      {/* Top Gradient Blur Header */}
      <div className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-30 bg-gradient-to-b from-white/90 dark:from-[#15171C]/90 via-white/40 dark:via-[#15171C]/40 to-transparent backdrop-blur-[2px] transition-colors" />
    </>
  );
}
