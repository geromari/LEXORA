"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { GlassButton } from "@/components/ui/GlassButton";
import { animeAnimations, animate } from "@/lib/animeAnimations";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle, setAuthSession } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Anime.js entrance animation
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        duration: 700,
        ease: "outQuad",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Iltimos, foydalanuvchi nomini kiriting.");
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage("Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    try {
      setIsLoading(true);
      await register({
        username: username.trim(),
        email: email.trim() || undefined,
        password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative z-10">
      <div
        ref={cardRef}
        className="w-full max-w-md rounded-[32px] bg-[#23262F]/85 backdrop-blur-2xl border border-white/10 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(182,255,46,0.12)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-9 h-9 rounded-xl bg-[#B6FF2E] flex items-center justify-center text-[#15171C] font-black text-xl shadow-[0_0_20px_rgba(182,255,46,0.4)] group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="text-2xl font-black font-manrope text-white tracking-tight">
              vydex<span className="text-[#B6FF2E]">.ai</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-manrope text-white">
            Yangi Hisob Ochish
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            IELTS &amp; CEFR so&apos;zlarini AI va Leitner SRS orqali o&apos;rganing
          </p>
        </div>

        {/* Quick OAuth (Telegram & Google) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href="https://t.me/vydex_uzbot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#15171C] hover:bg-[#1E2128] border border-white/10 hover:border-[#229ED9]/50 text-white text-xs font-bold transition-all shadow-sm"
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
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#15171C] hover:bg-[#1E2128] border border-white/10 hover:border-white/30 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Yoki Ma&apos;lumotlar bilan
          </span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
              Foydalanuvchi Nomi (Username) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: alisher_ielts"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-2 focus:ring-[#B6FF2E]/20 text-white placeholder-zinc-500 text-sm outline-none transition-all font-inter"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
              Email Manzil <span className="text-zinc-500 font-normal">(Ixtiyoriy)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masalan: student@gmail.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-2 focus:ring-[#B6FF2E]/20 text-white placeholder-zinc-500 text-sm outline-none transition-all font-inter"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-manrope">
              Parol (kamida 6 ta belgi) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#15171C] border border-white/10 focus:border-[#B6FF2E] focus:ring-2 focus:ring-[#B6FF2E]/20 text-white placeholder-zinc-500 text-sm outline-none transition-all font-inter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full py-4 text-base shadow-[0_0_30px_rgba(182,255,46,0.35)]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ro&apos;yxatdan O&apos;tish
            </GlassButton>
          </div>
        </form>

        {/* Footer switch to login */}
        <div className="mt-7 text-center pt-5 border-t border-white/10 text-xs text-zinc-400">
          Hisobingiz bormi?{" "}
          <Link
            href="/login"
            className="text-[#B6FF2E] font-bold hover:underline ml-1"
          >
            Tizimga Kirish
          </Link>
        </div>
      </div>
    </div>
  );
}
