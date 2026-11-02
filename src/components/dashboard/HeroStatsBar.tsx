"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Flame, Clock, Target, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

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
      label: "O'zlashtirilgan so'zlar",
      value: safeTotalLearned,
      subValue: `${safeTotalCards.toLocaleString()} ta jami so'zdan`,
      icon: BookOpen,
      iconColor: "text-emerald-700 dark:text-[#B6FF2E]",
      href: "/dashboard",
    },
    {
      id: "streak",
      label: "Kunlik seriya (Streak)",
      value: `${safeStreakDays} kun`,
      subValue: "uzluksiz faollik",
      icon: Flame,
      iconColor: "text-amber-500 dark:text-[#B6FF2E]",
      href: "/review",
      highlight: safeStreakDays > 0,
    },
    {
      id: "due",
      label: "Bugungi SRS takrorlash",
      value: safeTotalDue,
      subValue: safeTotalDue > 0 ? "so'z navbatda kutmoqda" : "Barcha kartalar o'zlashtirilgan",
      icon: Clock,
      iconColor: "text-emerald-700 dark:text-[#B6FF2E]",
      href: "/review",
      highlight: safeTotalDue > 0,
    },
    {
      id: "accuracy",
      label: "O'rtacha aniqlik",
      value: `${safeAccuracy}%`,
      subValue: "Leitner SRS testi",
      icon: Target,
      iconColor: "text-emerald-700 dark:text-[#B6FF2E]",
      href: "/review",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-[24px] bg-zinc-100 dark:bg-[#23262F]/50 animate-pulse border border-zinc-200 dark:border-white/5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.id} href={stat.href} className="group">
            <GlassCard
              interactive
              className={`p-5 sm:p-6 rounded-[26px] bg-white/95 dark:bg-[#23262F]/80 border-zinc-200 dark:border-white/10 flex flex-col justify-between h-full transition-all shadow-sm dark:shadow-md ${
                stat.highlight
                  ? "border-emerald-500/40 dark:border-[#B6FF2E]/40 hover:border-emerald-500 dark:hover:border-[#B6FF2E] shadow-[0_0_20px_rgba(182,255,46,0.15)]"
                  : "hover:border-zinc-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 font-manrope">
                  {stat.label}
                </span>
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/5 group-hover:border-emerald-500/40 dark:group-hover:border-[#B6FF2E]/40 transition-colors">
                  <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate font-inter">
                  {stat.subValue}
                </p>
              </div>
            </GlassCard>
          </Link>
        );
      })}
    </div>
  );
}
