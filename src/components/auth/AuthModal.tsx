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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-3xl bg-[#FAF8F5] border-[3px] border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_#121212] relative overflow-hidden text-[#121212]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl border-2 border-[#121212] bg-white text-[#121212] hover:bg-zinc-100 shadow-[2px_2px_0px_#121212] transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#121212]">
            <Sparkles className="w-6 h-6 text-[#121212]" />
          </div>
          <h3 className="text-2xl font-black text-[#121212] tracking-tight">
            Lexora Profilingiz
          </h3>
          <p className="text-xs text-zinc-600 font-medium">
            Shaxsiy lug&apos;atlar, SRS xotira rivoji va kunlik seriyangizni saqlang
          </p>
        </div>

        {/* Mode Tabs (Kirish vs Ro'yxatdan o'tish) */}
        {!isWaitingTelegram && (
          <div className="flex p-1 rounded-2xl border-2 border-[#121212] bg-white shadow-[2px_2px_0px_#121212] mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#FFCC00] text-[#121212] border-2 border-[#121212] shadow-[1px_1px_0px_#121212]"
                  : "text-zinc-600 hover:text-[#121212]"
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
              className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#FFCC00] text-[#121212] border-2 border-[#121212] shadow-[1px_1px_0px_#121212]"
                  : "text-zinc-600 hover:text-[#121212]"
              }`}
            >
              Ro&apos;yxatdan o&apos;tish
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real-time Deep-Link Waiting View or Standard Form */}
        {isWaitingTelegram ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#229ED9] border-2 border-[#121212] flex items-center justify-center shadow-[4px_4px_0px_#121212]">
              <TelegramIcon className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="text-base font-black text-[#121212]">
                Telegram orqali ulanish
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Telegram bot ochildi. Iltimos, Telegram ilovasida <span className="font-black text-[#121212]">Start</span> tugmasini bosing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] flex items-center justify-center gap-2.5 text-xs text-[#121212] font-black">
              <RefreshCw className="w-4 h-4 text-[#229ED9] animate-spin" />
              <span>Telegram tasdig&apos;i kutilmoqda...</span>
            </div>

            <div className="space-y-2 pt-1">
              {telegramBotUrl && (
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white text-xs font-black transition-all flex items-center justify-center gap-2 border-2 border-[#121212] shadow-[2px_2px_0px_#121212]"
                >
                  <TelegramIcon className="w-4 h-4 text-white" />
                  <span>Telegram Botni Qayta Ochish</span>
                </a>
              )}

              <button
                type="button"
                onClick={stopPolling}
                className="w-full py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-[#121212] transition-colors cursor-pointer"
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
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#121212] block uppercase tracking-wider">
                    Email yoki Foydalanuvchi nomi:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="Username yoki pochta..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-xs sm:text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#121212] block uppercase tracking-wider">
                    Parol:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-xs sm:text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#121212]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl border-2 border-[#121212] bg-[#FA5A2A] hover:bg-[#E04719] text-white font-black text-sm shadow-[3px_3px_0px_#121212] transition-all cursor-pointer"
                >
                  {isLoading ? "Kirilmoqda..." : "Tizimga Kirish"}
                </button>
              </>
            ) : (
              // Register Form
              <>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#121212] block uppercase tracking-wider">
                    Foydalanuvchi nomi (Username):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="masalan: alisher_ielts"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-xs sm:text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#121212] block uppercase tracking-wider">
                    Email manzili (ixtiyoriy):
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nomingiz@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-xs sm:text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#121212] block uppercase tracking-wider">
                    Parol (kamida 6 ta belgi):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-xs sm:text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#121212]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl border-2 border-[#121212] bg-[#FA5A2A] hover:bg-[#E04719] text-white font-black text-sm shadow-[3px_3px_0px_#121212] transition-all cursor-pointer"
                >
                  {isLoading ? "Yaratilmoqda..." : "Ro'yxatdan O'tish"}
                </button>
              </>
            )}

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t-2 border-[#121212]/15" />
              <span className="bg-[#FAF8F5] px-3 font-mono text-[11px] text-zinc-500 font-black uppercase tracking-wider relative z-10">
                yoki
              </span>
            </div>

            {/* Prominent Telegram 1-Click Button */}
            <button
              type="button"
              onClick={handleStartTelegramAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white border-2 border-[#121212] text-xs font-black transition-all flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_#121212] disabled:opacity-50 cursor-pointer"
            >
              <TelegramIcon className="w-4 h-4 text-white" />
              <span>Telegram orqali kirish (1-bosishda)</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
