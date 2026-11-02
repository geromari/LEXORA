"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { GlassButton } from "@/components/ui/GlassButton";
import { animeAnimations } from "@/lib/animeAnimations";

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    login, 
    register,
    loginWithGoogle 
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(authModalMode);
    setErrorMessage(null);
  }, [authModalMode, isAuthModalOpen]);

  useEffect(() => {
    if (isAuthModalOpen && modalRef.current) {
      animeAnimations.modalIn(modalRef.current);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    try {
      setIsLoading(true);
      if (mode === "register") {
        if (password.length < 6) {
          setErrorMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
          setIsLoading(false);
          return;
        }
        await register({
          username: username.trim(),
          email: email.trim() || undefined,
          password,
        });
      } else {
        await login({
          email_or_username: username.trim(),
          password,
        });
      }
      closeAuthModal();
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      {/* Backdrop click */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={closeAuthModal} 
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md rounded-[32px] bg-[#23262F]/95 backdrop-blur-2xl border border-white/10 p-7 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(182,255,46,0.15)] overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-5 top-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#B6FF2E] flex items-center justify-center text-[#15171C] font-black text-lg shadow-[0_0_20px_rgba(182,255,46,0.4)]">
              V
            </div>
            <span className="text-2xl font-black font-manrope text-white tracking-tight">
              vydex<span className="text-[#B6FF2E]">.ai</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {mode === "login"
              ? "Lug'atlaringizga kirish va takrorlashni davom ettiring"
              : "Yangi akkaunt yarating va SRS Leitner tizimini boshlang"}
          </p>
        </div>

        {/* Tab switcher: Kirish / Ro'yxatdan o'tish */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#15171C] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_15px_rgba(182,255,46,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Kirish
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#B6FF2E] text-[#15171C] shadow-[0_0_15px_rgba(182,255,46,0.3)]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Ro&apos;yxatdan O&apos;tish
          </button>
        </div>

        {/* Quick OAuth (Telegram & Google) */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <a
            href="https://t.me/vydex_uzbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#15171C] hover:bg-[#1E2128] border border-white/10 text-white text-xs font-bold transition-all"
          >
            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
            <span>Telegram Bot</span>
          </a>

          <button
            type="button"
            onClick={() => {
              const email = prompt("Google email manzilingizni kiriting:");
              if (email && email.includes("@")) {
                loginWithGoogle({ email, name: email.split("@")[0] });
              }
            }}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#15171C] hover:bg-[#1E2128] border border-white/10 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1 font-manrope">
              Foydalanuvchi Nomi (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: student_uz"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-1 focus:ring-[#B6FF2E]/30 text-white placeholder-zinc-500 text-xs outline-none transition-all font-inter"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1 font-manrope">
                Email Manzil <span className="text-zinc-500 font-normal">(Ixtiyoriy)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="masalan: student@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-1 focus:ring-[#B6FF2E]/30 text-white placeholder-zinc-500 text-xs outline-none transition-all font-inter"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1 font-manrope">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-1 focus:ring-[#B6FF2E]/30 text-white placeholder-zinc-500 text-xs outline-none transition-all font-inter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full py-3 text-sm shadow-[0_0_20px_rgba(182,255,46,0.3)]"
            >
              {mode === "login" ? "Tizimga Kirish" : "Ro'yxatdan O'tish"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
}
