"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
  animate?: boolean;
}

export function GlassSkeleton({
  className,
  variant = "rectangular",
  animate = true,
  ...props
}: GlassSkeletonProps) {
  const baseClasses = "bg-zinc-200 border-2 border-black";

  const variantClasses = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded-lg h-4 w-full",
    card: "rounded-2xl p-6 bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000]",
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function DeckCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] flex flex-col justify-between h-[280px] animate-pulse">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-zinc-200 rounded-md border border-black/20" />
          <div className="h-5 w-16 bg-zinc-200 rounded-md border border-black/20" />
        </div>
        {/* Title */}
        <div className="h-7 w-3/4 bg-zinc-200 rounded-lg" />
        {/* Description lines */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-full bg-zinc-100 rounded" />
          <div className="h-3.5 w-2/3 bg-zinc-100 rounded" />
        </div>
        {/* Progress Bar */}
        <div className="space-y-1.5 pt-3">
          <div className="flex justify-between">
            <div className="h-3 w-28 bg-zinc-200 rounded" />
            <div className="h-3 w-8 bg-zinc-200 rounded" />
          </div>
          <div className="h-2 w-full bg-zinc-200 rounded-full border border-black/20" />
        </div>
      </div>
      {/* Bottom Action Buttons */}
      <div className="pt-4 border-t-2 border-black/10 grid grid-cols-2 gap-2.5">
        <div className="h-9 bg-zinc-200 rounded-xl border border-black/20" />
        <div className="h-9 bg-zinc-200 rounded-xl border border-black/20" />
      </div>
    </div>
  );
}

