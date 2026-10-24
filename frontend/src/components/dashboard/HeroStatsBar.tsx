"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Flame, Clock, Target } from "lucide-react";

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
      badgeColor: "bg-[#2563EB] text-white",
      href: "/#decks",
    },
    {
      id: "streak",
      label: "Kunlik seriya",
      value: `${safeStreakDays} kun`,
      subValue: "uzluksiz faollik",
      icon: Flame,
      badgeColor: "bg-[#FA5A2A] text-white",
      href: "/review",
    },
    {
      id: "due",
      label: "Bugungi takrorlash",
      value: safeTotalDue,
      subValue: safeTotalDue > 0 ? "so'z navbatda kutmoqda" : "Barchasi takrorlangan",
      icon: Clock,
      badgeColor: "bg-[#FFCC00] text-[#121212]",
      href: "/review",
      highlight: safeTotalDue > 0,
    },
    {
      id: "accuracy",
      label: "SRS Aniqlik darajasi",
      value: `${safeAccuracy}%`,
      subValue: "xotira ko'rsatkichi",
      icon: Target,
      badgeColor: "bg-[#10B981] text-white",
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
            className={`group rounded-2xl border-[2.5px] border-[#121212] bg-white p-5 shadow-[4px_4px_0px_#121212] hover:shadow-[6px_6px_0px_#121212] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between ${
              stat.highlight ? "ring-2 ring-[#FA5A2A]" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-lg border-2 border-[#121212] flex items-center justify-center shadow-[1px_1px_0px_#121212] ${stat.badgeColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-16 h-8 bg-zinc-200 animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs font-medium text-zinc-600">
                {stat.subValue}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
