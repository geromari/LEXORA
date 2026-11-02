"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ai" | "secondary" | "graphite" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-[#B6FF2E] hover:bg-[#a5ee24] text-[#15171C] font-extrabold shadow-[0_0_25px_rgba(182,255,46,0.35)] hover:shadow-[0_0_35px_rgba(182,255,46,0.55)] active:scale-95 border border-transparent tracking-tight",
  graphite:
    "bg-[#23262F] hover:bg-[#2c303b] text-white font-bold border border-white/10 hover:border-[#B6FF2E]/40 active:scale-95 shadow-lg",
  ai:
    "bg-[#15171C] hover:bg-[#23262F] text-[#B6FF2E] border border-[#B6FF2E]/30 font-bold active:scale-95 shadow-[0_0_20px_rgba(182,255,46,0.15)]",
  secondary:
    "bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 active:scale-95",
  success:
    "bg-emerald-500 hover:bg-emerald-400 text-black font-bold active:scale-95 shadow-md",
  danger:
    "bg-rose-600 hover:bg-rose-500 text-white font-bold active:scale-95 border border-transparent",
  ghost:
    "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-medium border border-transparent",
};

const sizeStyles = {
  sm: "px-3.5 py-1.5 text-xs font-semibold rounded-full gap-1.5",
  md: "px-5 py-2.5 text-sm font-bold rounded-full gap-2",
  lg: "px-7 py-3.5 text-base font-extrabold rounded-full gap-2.5",
  icon: "h-10 w-10 p-2 rounded-full flex items-center justify-center",
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
          "inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
