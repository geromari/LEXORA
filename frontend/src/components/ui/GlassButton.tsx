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
    "bg-[#FA5A2A] hover:bg-[#E04719] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] font-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  ai:
    "bg-[#FFCC00] hover:bg-[#F0C000] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] font-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  secondary:
    "bg-white hover:bg-zinc-100 text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] font-bold active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  success:
    "bg-[#10B981] hover:bg-[#059669] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] font-bold active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  danger:
    "bg-rose-500 hover:bg-rose-600 text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] font-bold active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
  ghost:
    "bg-transparent hover:bg-[#121212]/5 text-[#121212] font-bold border border-transparent",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-bold rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm font-bold rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base font-black rounded-xl gap-2.5",
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
          "inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none outline-none disabled:opacity-50 disabled:pointer-events-none",
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
