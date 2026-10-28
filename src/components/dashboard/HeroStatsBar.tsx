"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Flame, Clock, Target, ArrowRight } from "lucide-react";

interface HeroStatsBarProps {
  totalLearned: number;
  totalDue: number;
  totalCards: number;
  streakDays?: number;
  accuracyPercentage?: number;
  isLoading?: boolean;
}

export function HeroStatsBar({
  totalLearned = 0,
  totalDue = 0,
  totalCards = 0,
  streakDays = 3,
  accuracyPercentage = 88,
  isLoading = false,
}: HeroStatsBarProps) {
  const safeTotalLearned = Number.isFinite(totalLearned) ? Math.max(0, totalLearned) : 0;
  const safeTotalDue = Number.isFinite(totalDue) ? Math.max(0, totalDue) : 0;
  const safeTotalCards = Number.isFinite(totalCards) ? Math.max(0, totalCards) : 0;
  const safeStreakDays = Number.isFinite(streakDays) ? Math.max(0, streakDays) : 3;
  const safeAccuracy = Number.isFinite(accuracyPercentage) ? Math.max(0, Math.min(100, accuracyPercentage)) : 88;

  const stats = [
    {
      id: "learned",
      label: "O'rganilgan so'zlar",
      value: safeTotalLearned,
      subValue: `${safeTotalCards} ta jami so'zdan`,
      icon: BookOpen,
      iconColor: "text-zinc-300",
      href: "/#decks",
    },
    {
      id: "streak",
      label: "Kunlik faol seriya",
      value: `${safeStreakDays} kun`,
      subValue: "uzluksiz mashg'ulot",
      icon: Flame,
      iconColor: "text-[#ef233c]",
      href: "/review",
    },
    {
      id: "due",
      label: "Bugungi takrorlash",
      value: safeTotalDue,
      subValue: safeTotalDue > 0 ? "so'z navbatda kutmoqda" : "Hammasi takrorlangan",
      icon: Clock,
      iconColor: "text-[#ef233c]",
      href: "/review",
      highlight: safeTotalDue > 0,
    },
    {
      id: "accuracy",
      label: "SRS Aniqlik darajasi",
      value: `${safeAccuracy}%`,
      subValue: "xotira ko'rsatkichi",
      icon: Target,
      iconColor: "text-emerald-400",
      href: "/review",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.id}
            href={stat.href}
            className={`group rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-zinc-900/60 to-black ${
              stat.highlight
                ? "border-[#ef233c]/60 shadow-[0_0_30px_rgba(239,35,60,0.18)]"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                {stat.label}
              </span>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>

            {/* Value display */}
            <div className="space-y-1 relative z-10">
              <div className="text-3xl sm:text-4xl font-bold font-manrope text-white tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-20 h-9 bg-zinc-800 animate-pulse rounded-lg" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-zinc-400 font-inter">
                {stat.subValue}
              </p>
            </div>

            {/* Subtle red hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
              style={{ background: "radial-gradient(circle at top right, #ef233c, transparent 70%)" }}
            />
          </Link>
        );
      })}
    </div>
  );
}
