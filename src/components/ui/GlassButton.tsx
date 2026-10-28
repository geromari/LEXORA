"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ai" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-[#ef233c] hover:bg-red-700 text-white font-bold shadow-[0_0_20px_rgba(239,35,60,0.35)] active:scale-95 border border-transparent",
  ai:
    "bg-zinc-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 text-white border border-zinc-800 dark:border-white/20 font-bold active:scale-95 shadow-sm",
  secondary:
    "bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-white/10 font-medium active:scale-95",
  success:
    "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95 border border-transparent",
  danger:
    "bg-rose-600 hover:bg-rose-500 text-white font-bold active:scale-95 border border-transparent",
  ghost:
    "bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium border border-transparent",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm font-semibold rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base font-bold rounded-xl gap-2.5",
  icon: "h-10 w-10 p-2 rounded-xl flex items-center justify-center",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none outline-none disabled:opacity-50 disabled:pointer-events-none font-manrope",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
