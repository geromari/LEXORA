"use client";

import React, { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: "none" | "lime" | "graphite" | "emerald";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      interactive = false,
      glow = "none",
      padding = "md",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[26px] border border-white/10 dark:border-white/10 bg-white/90 dark:bg-[#23262F]/70 backdrop-blur-2xl text-zinc-900 dark:text-white shadow-xl transition-all duration-300 relative overflow-hidden",
          interactive &&
            "cursor-pointer hover:border-[#B6FF2E]/50 hover:bg-white dark:hover:bg-[#23262F]/90 hover:shadow-[0_10px_35px_-10px_rgba(0,0,0,0.5),0_0_30px_rgba(182,255,46,0.15)] hover:-translate-y-1",
          glow === "lime" && "border-[#B6FF2E]/60 shadow-[0_0_35px_rgba(182,255,46,0.25)]",
          glow === "graphite" && "border-white/15 shadow-2xl",
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
