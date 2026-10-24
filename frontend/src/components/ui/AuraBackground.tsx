"use client";

import React from "react";

interface AuraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Aura Gradient: "Champagne Glass"
 * 
 * A warm atmospheric gradient background using layered CSS blend modes (multiply)
 * over a light backdrop (#faf8f2).
 * 
 * Critical Architecture:
 * - The container must NOT have a background color (it is transparent).
 * - The layers composite against the page/body background (#faf8f2).
 * - Real content lives inside the relative wrapper with z-index: 1.
 */
export function AuraBackground({
  children,
  className = "",
  style,
  ...props
}: AuraBackgroundProps) {
  return (
    <div
      className={`aura-bg ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        /* NO backgroundColor - blend modes composite against body/page bg */
        ...style,
      }}
      {...props}
    >
      {/* Layer 1: Linear gradient (normal blend mode) */}
      <div
        className="aura-layer-1"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,251,235,0.95) 0%, rgba(254,243,199,0.62) 50%, rgba(253,230,138,0.34) 100%)",
          mixBlendMode: "normal",
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Radial gradient (multiply, 125px blur mobile / 180px desktop) */}
      <div
        className="aura-layer-2"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 50% 45% at 32% 42%, rgba(251,191,36,0.26) 0%, transparent 68%)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Radial gradient (multiply, 138px blur mobile / 198px desktop) */}
      <div
        className="aura-layer-3"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 42% 50% at 72% 60%, rgba(245,158,11,0.20) 0%, transparent 70%)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Linear highlight gradient (multiply, 45px blur mobile / 65px desktop) */}
      <div
        className="aura-layer-4"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.65), transparent 42%, rgba(255,255,255,0.30) 72%)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* Content wrapper: sits ABOVE the absolute layers */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Convenience page wrapper providing the required #faf8f2 base color
 * behind the transparent AuraBackground container.
 */
export function AuraPageWrapper({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`aura-wrapper ${className}`}
      style={{
        backgroundColor: "#faf8f2",
        minHeight: "100vh",
        ...style,
      }}
      {...props}
    >
      <AuraBackground>{children}</AuraBackground>
    </div>
  );
}
