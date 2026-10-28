"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { TelegramIcon } from "@/components/icons/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    login, 
    register,
    setAuthSession 
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Telegram deep-link auth state
  const [isWaitingTelegram, setIsWaitingTelegram] = useState(false);
  const [telegramBotUrl, setTelegramBotUrl] = useState("");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsWaitingTelegram(false);
  }, []);

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Sync mode with prop
  useEffect(() => {
    setMode(authModalMode);
    setErrorMessage(null);
    stopPolling();
  }, [authModalMode, isAuthModalOpen, stopPolling]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    stopPolling();
    closeAuthModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!emailOrUsername || !password) {
          throw new Error("Iltimos, login va parolingizni kiriting.");
        }
        await login({ email_or_username: emailOrUsername, password });
      } else {
        if (!username || !password) {
          throw new Error("Iltimos, foydalanuvchi nomi va parolni kiriting.");
        }
        if (password.length < 6) {
          throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
        }
        await register({ username, email: email || undefined, password });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTelegramAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const initData = await api.initTelegramAuth();
      setTelegramBotUrl(initData.bot_url);
      setIsWaitingTelegram(true);

      if (typeof window !== "undefined") {
        window.open(initData.bot_url, "_blank");
      }

      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await api.checkTelegramAuthStatus(initData.session_token);
          if (statusRes.status === "completed" && statusRes.access_token && statusRes.user) {
            stopPolling();
            setAuthSession(statusRes.access_token, statusRes.user);
          }
        } catch (pollErr) {
          console.error("Telegram status polling error:", pollErr);
        }
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Telegram sessiyasini yaratishda xatolik yuz berdi.");
      setIsWaitingTelegram(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-3xl bg-zinc-950 border border-white/10 p-6 sm:p-8 shadow-[0_0_60px_rgba(239,35,60,0.2)] relative overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#ef233c] shadow-[0_0_15px_rgba(239,35,60,0.4)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-manrope text-white tracking-tight">
            Lexora Profilingiz
          </h3>
          <p className="text-xs text-zinc-400 font-inter">
            Shaxsiy lug&apos;atlar, SRS xotira rivoji va kunlik seriyangizni saqlang
          </p>
        </div>

        {/* Mode Tabs (Kirish vs Ro'yxatdan o'tish) */}
        {!isWaitingTelegram && (
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold font-manrope rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Kirish (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold font-manrope rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#ef233c] text-white shadow-[0_0_12px_rgba(239,35,60,0.5)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Ro&apos;yxatdan o&apos;tish
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-time Deep-Link Waiting View or Standard Form */}
        {isWaitingTelegram ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#229ED9]/20 border border-[#229ED9]/40 flex items-center justify-center text-[#229ED9] shadow-[0_0_20px_rgba(34,158,217,0.3)]">
              <TelegramIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="text-base font-bold font-manrope text-white">
                Telegram orqali ulanish
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-inter">
                Telegram bot ochildi. Iltimos, Telegram ilovasida <span className="font-bold text-white">Start</span> tugmasini bosing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2.5 text-xs text-white font-semibold">
              <RefreshCw className="w-4 h-4 text-[#229ED9] animate-spin" />
              <span>Telegram tasdig&apos;i kutilmoqda...</span>
            </div>

            <div className="space-y-2 pt-1">
              {telegramBotUrl && (
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white text-xs font-bold font-manrope transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,158,217,0.3)]"
                >
                  <TelegramIcon className="w-4 h-4 text-white" />
                  <span>Telegram Botni Qayta Ochish</span>
                </a>
              )}

              <button
                type="button"
                onClick={stopPolling}
                className="w-full py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Bekor qilish va qaytish
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "login" ? (
              // Login Form
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                    Email yoki Foydalanuvchi nomi:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="Username yoki pochta..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 transition-all font-inter"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                    Parol:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 transition-all font-inter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-sm shadow-[0_0_20px_rgba(239,35,60,0.4)] transition-all cursor-pointer"
                >
                  {isLoading ? "Kirilmoqda..." : "Tizimga Kirish"}
                </button>
              </>
            ) : (
              // Register Form
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                    Foydalanuvchi nomi (Username):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="masalan: alisher_ielts"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 transition-all font-inter"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                    Email manzili (ixtiyoriy):
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nomingiz@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 transition-all font-inter"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                    Parol (kamida 6 ta belgi):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-medium text-white placeholder:text-zinc-500 transition-all font-inter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-sm shadow-[0_0_20px_rgba(239,35,60,0.4)] transition-all cursor-pointer"
                >
                  {isLoading ? "Yaratilmoqda..." : "Ro'yxatdan O'tish"}
                </button>
              </>
            )}

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="bg-zinc-950 px-3 font-mono text-[11px] text-zinc-500 uppercase tracking-wider relative z-10">
                yoki
              </span>
            </div>

            {/* Prominent Telegram 1-Click Button */}
            <button
              type="button"
              onClick={handleStartTelegramAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#229ED9] border border-[#229ED9]/30 text-xs font-bold font-manrope transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
              <span>Telegram orqali kirish (1-bosishda)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
