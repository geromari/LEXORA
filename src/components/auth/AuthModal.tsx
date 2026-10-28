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
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    login, 
    register,
    loginWithGoogle,
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

  // Google interactive prompt state
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");

  // Custom password form toggle
  const [showCustomEmailForm, setShowCustomEmailForm] = useState(false);

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
    setIsGooglePromptOpen(false);
    setShowCustomEmailForm(false);
    stopPolling();
  }, [authModalMode, isAuthModalOpen, stopPolling]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    stopPolling();
    setIsGooglePromptOpen(false);
    closeAuthModal();
  };

  const handleStartGoogleAuth = async () => {
    setErrorMessage(null);
    setIsGooglePromptOpen(true);
  };

  const handleConfirmGoogleAuth = async (
    e?: React.FormEvent,
    quickEmail?: string
  ) => {
    if (e) e.preventDefault();

    let targetEmail = (quickEmail || googleEmail).trim();
    if (!targetEmail) {
      targetEmail = "google.student@gmail.com";
    }
    if (!targetEmail.includes("@")) {
      targetEmail = `${targetEmail}@gmail.com`;
    }

    const targetName =
      googleName.trim() ||
      targetEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");

    try {
      setIsLoading(true);
      setErrorMessage(null);
      await loginWithGoogle({
        email: targetEmail,
        name: targetName,
      });
      setIsGooglePromptOpen(false);
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || "Google orqali ulanishda xatolik yuz berdi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTelegramAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    // Pre-open window on desktop to prevent popup blockers
    const isMobile =
      typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let authTab: Window | null = null;
    if (!isMobile && typeof window !== "undefined") {
      authTab = window.open("about:blank", "_blank");
    }

    try {
      const initData = await api.initTelegramAuth();
      setTelegramBotUrl(initData.bot_url);
      setIsWaitingTelegram(true);

      if (authTab) {
        authTab.location.href = initData.bot_url;
      } else if (typeof window !== "undefined") {
        window.location.href = initData.bot_url;
      }

      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await api.checkTelegramAuthStatus(
            initData.session_token
          );
          if (
            statusRes.status === "completed" &&
            statusRes.access_token &&
            statusRes.user
          ) {
            stopPolling();
            setAuthSession(statusRes.access_token, statusRes.user);
            handleClose();
          }
        } catch (pollErr) {
          console.error("Telegram status polling error:", pollErr);
        }
      }, 2000);
    } catch (err: any) {
      if (authTab) authTab.close();
      setErrorMessage(
        err.message || "Telegram sessiyasini yaratishda xatolik yuz berdi."
      );
      setIsWaitingTelegram(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
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
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl dark:shadow-[0_0_60px_rgba(239,35,60,0.2)] relative overflow-hidden text-zinc-900 dark:text-white transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center mx-auto text-[#ef233c] shadow-sm dark:shadow-[0_0_15px_rgba(239,35,60,0.4)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-manrope tracking-tight text-zinc-900 dark:text-white">
            {mode === "register" ? "Ro'yxatdan O'tish" : "Vydex-ga Kirish"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-inter max-w-xs mx-auto">
            {mode === "register" 
              ? "Google yoki Telegram orqali 1-soniyada hisob yarating va lug'atlarni saqlang"
              : "Shaxsiy lug'atlar, SRS xotira va kunlik seriyangizni davom ettiring"}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        {!isWaitingTelegram && !isGooglePromptOpen && (
          <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold font-manrope rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#ef233c] text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Ro&apos;yxatdan o&apos;tish
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold font-manrope rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#ef233c] text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Kirish (Login)
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. TELEGRAM WAITING STATE */}
        {isWaitingTelegram ? (
          <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shadow-[0_0_20px_rgba(34,158,217,0.25)]">
              <TelegramIcon className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 max-w-xs mx-auto">
              <h4 className="text-base font-bold font-manrope text-zinc-900 dark:text-white">
                Telegram bot orqali tasdiqlash
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-inter">
                Telegram ilovasida ochilgan botda <span className="font-bold text-zinc-900 dark:text-white">Start</span> tugmasini bosing. Siz avtomatik tizimga ulanasiz.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2.5 text-xs text-zinc-800 dark:text-white font-semibold">
              <RefreshCw className="w-4 h-4 text-[#229ED9] animate-spin" />
              <span>Telegram tasdig&apos;i kutilmoqda...</span>
            </div>

            <div className="space-y-3 pt-2">
              {telegramBotUrl && (
                <a
                  href={telegramBotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-5 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white text-sm font-bold font-manrope transition-all flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(34,158,217,0.4)]"
                >
                  <TelegramIcon className="w-5 h-5 text-white shrink-0" />
                  <span>Telegram Botni Ochish (@lexora_uzbot) ↗️</span>
                </a>
              )}

              <button
                type="button"
                onClick={stopPolling}
                className="w-full py-2.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Orqaga qaytish
              </button>
            </div>
          </div>
        ) : isGooglePromptOpen ? (
          /* 2. GOOGLE ACCOUNT QUICK CONNECT FORM */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Quick 1-tap Google connect button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleConfirmGoogleAuth(undefined, "Google Foydalanuvchisi")}
              className="w-full py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 border border-zinc-700 dark:border-white text-xs sm:text-sm font-bold font-manrope transition-all duration-200 flex items-center justify-center gap-3 shadow-lg group cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Google bilan 1-bosishda davom etish</span>
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-zinc-200 dark:border-white/10" />
              <span className="bg-white dark:bg-zinc-950 px-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider relative z-10">
                yoki Google emailingizni kiriting
              </span>
            </div>

            <form onSubmit={(e) => handleConfirmGoogleAuth(e)} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                  Google Email manzilingiz:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="masalan: alisher@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs sm:text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                  Ismingiz (ixtiyoriy):
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Alisher"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs sm:text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Ulanmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Google orqali Kirish</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsGooglePromptOpen(false)}
                className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Boshqa usulni tanlash
              </button>
            </form>
          </div>
        ) : (
          /* 3. PRIMARY AUTH OPTIONS: GOOGLE & TELEGRAM */
          <div className="space-y-4">
            {/* 1-PRIMARY: Google Account Sign-In / Sign-Up */}
            <button
              type="button"
              onClick={handleStartGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-white/10 hover:bg-zinc-50 dark:hover:bg-white/15 text-zinc-800 dark:text-white border border-zinc-300 dark:border-white/20 text-xs sm:text-sm font-bold font-manrope transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow group cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Google akkaunt orqali {mode === "register" ? "ro'yxatdan o'tish" : "kirish"}</span>
            </button>

            {/* 2-PRIMARY: Telegram Bot 1-Click Sign-In / Sign-Up */}
            <button
              type="button"
              onClick={handleStartTelegramAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1E8BC0] text-white border border-[#229ED9] text-xs sm:text-sm font-bold font-manrope transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,158,217,0.3)] hover:shadow-[0_0_25px_rgba(34,158,217,0.45)] group cursor-pointer"
            >
              <TelegramIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform text-white" />
              <span>Telegram bot orqali {mode === "register" ? "ro'yxatdan o'tish" : "kirish"}</span>
            </button>

            {/* Micro Explainer Note */}
            <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-inter">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Parolsiz, 1-bosishda xavfsiz avtorizatsiya</span>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-zinc-200 dark:border-white/10" />
              <button
                type="button"
                onClick={() => setShowCustomEmailForm(!showCustomEmailForm)}
                className="bg-white dark:bg-zinc-950 px-3 font-mono text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 uppercase tracking-wider relative z-10 transition-colors cursor-pointer"
              >
                {showCustomEmailForm ? "Email formani yashirish" : "Yoki login & parol orqali"}
              </button>
            </div>

            {/* Optional Manual Login/Register Form */}
            {showCustomEmailForm && (
              <form onSubmit={handleStandardSubmit} className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                {mode === "login" ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Login yoki Email:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={emailOrUsername}
                          onChange={(e) => setEmailOrUsername(e.target.value)}
                          placeholder="Foydalanuvchi nomi yoki email..."
                          className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Parol:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold font-manrope text-xs transition cursor-pointer"
                    >
                      {isLoading ? "Kirilmoqda..." : "Kirish"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Foydalanuvchi nomi:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="masalan: dilnoza_c1"
                          className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Email manzili (ixtiyoriy):
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dilnoza@example.com"
                          className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                        Parol:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition font-inter"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold font-manrope text-xs transition cursor-pointer"
                    >
                      {isLoading ? "Yaratilmoqda..." : "Yaratish"}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
