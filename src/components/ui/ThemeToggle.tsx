"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
      title={theme === "dark" ? "Yorug' rejim (Light mode)" : "Qorong'i rejim (Dark mode)"}
      className={`p-2 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center ${
        theme === "dark"
          ? "border-white/10 bg-white/5 text-amber-400 hover:bg-white/10 hover:text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
          : "border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 shadow-sm"
      } ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
