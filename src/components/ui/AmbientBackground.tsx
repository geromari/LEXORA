"use client";

import React from "react";

export function AmbientBackground() {
  return (
    <>
      {/* Global Red Noir Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep noir gradient from top dark crimson #1a0505 to pure black */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0505] via-[#090101] to-black" />

        {/* Animated Parallax Starfield */}
        <div className="absolute top-0 left-0 w-[1px] h-[1px] bg-transparent stars-1 animate-[animStar_50s_linear_infinite]" />
        <div className="absolute top-0 left-0 w-[2px] h-[2px] bg-transparent stars-2 animate-[animStar_80s_linear_infinite]" />

        {/* Ambient Red Central Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[700px] sm:h-[900px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle Noir Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_85%)]" />
      </div>

      {/* Top Gradient Blur Header */}
      <div className="gradient-blur" />
    </>
  );
}
