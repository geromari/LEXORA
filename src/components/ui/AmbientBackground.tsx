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
            {/* Deep noir gradient from top dark crimson #1a0505 to pure black */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#090101] to-black" />

            {/* Animated Parallax Starfield */}
            <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]" />
            <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]" />

            {/* Ambient Red Central Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Subtle Dark Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_85%)]" />
          </>
        ) : (
          <>
            {/* Clean Light Gradient with Subtle Soft Rose Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-50/60 via-slate-50 to-white" />

            {/* Ambient Light Rose Glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] bg-red-400/8 rounded-full blur-[120px] pointer-events-none" />

            {/* Subtle Light Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_90%)]" />
          </>
        )}
      </div>

      {/* Top Gradient Blur Header */}
      <div className={`gradient-blur ${theme === "light" ? "!bg-gradient-to-b !from-white/90 !to-transparent" : ""}`} />
    </>
  );
}
