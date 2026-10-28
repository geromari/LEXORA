"use client";

import React, { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: "none" | "red" | "indigo" | "violet" | "emerald" | "rose";
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
          "rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/70 backdrop-blur-xl text-zinc-900 dark:text-white shadow-sm dark:shadow-xl transition-all duration-200 relative overflow-hidden",
          interactive &&
            "cursor-pointer hover:border-[#ef233c]/60 dark:hover:border-[#ef233c]/50 hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(239,35,60,0.15)] hover:-translate-y-0.5",
          glow === "red" && "border-[#ef233c] shadow-md dark:shadow-[0_0_30px_rgba(239,35,60,0.2)]",
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
