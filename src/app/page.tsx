"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Bot, 
  BrainCircuit, 
  Zap, 
  Layers, 
  Star, 
  Flame, 
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  LayoutDashboard,
  Check,
  Award,
  Users,
  Compass
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { TelegramIcon, GoogleIcon } from "@/components/icons/BrandIcons";
import { RetroHeroSection } from "@/components/dashboard/RetroHeroSection";
import { AISmartImportModal } from "@/components/dashboard/AISmartImportModal";

export default function LandingPage() {
  const { user, openAuthModal } = useAuth();
  const [isAIImportModalOpen, setIsAIImportModalOpen] = useState(false);
  const [importInitialText, setImportInitialText] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleHeroAnalyze = (text: string) => {
    setImportInitialText(text);
    setIsAIImportModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <RetroHeroSection onAnalyzeText={handleHeroAnalyze} />

      {/* Main Landing Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-28">

        {/* 2. ABOUT THE PROJECT SECTION */}
        <section id="about" className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#ef233c] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Compass className="w-3.5 h-3.5" />
              <span>Loyiha Haqida</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight leading-tight">
              Nega an&apos;anaviy yodlash usullari <br />
              <span className="text-[#ef233c]">ish bermaydi?</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter mt-4 leading-relaxed">
              Nemis psixologi German Ebbinghaus aniqlaganidek, inson yangi o&apos;rgangan so&apos;zlarining <strong>80% qismini 48 soat ichida unutib yuboradi</strong>. Daftar tutish yoki quruq ro&apos;yxat yodlash — bu vaqtni behuda sarflashdir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(239,35,60,0.12)] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center text-[#ef233c] mb-6 shadow-sm">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-3">
                  Spaced Repetition (SRS)
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  5 bosqichli Leitner xotira qutisi yordamida so&apos;zlar aniq esingizdan chiqayotgan paytda takrorlanadi. Natijada so&apos;zlar qisqa muddatli xotiradan uzoq muddatli xotiraga 100% o&apos;tadi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-[#ef233c] font-semibold">
                <span>Leitner Algorithm</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(239,35,60,0.12)] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center text-[#ef233c] mb-6 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-3">
                  Google Gemini 2.5 AI
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  Istalgan inglizcha maqola, IELTS Reading matni yoki yangilikni tashlang. AI undagi eng muhim akademik so&apos;zlarni ajratib, o&apos;zbekcha aniq kontekstual tarjimasi va darajasi (B2, C1, C2) bilan to&apos;plam qiladi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-[#ef233c] font-semibold">
                <span>Text-to-Deck Generator</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(239,35,60,0.12)] transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-white/5 border border-sky-200 dark:border-white/10 flex items-center justify-center text-[#229ED9] mb-6 shadow-sm">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-3">
                  Telegram Bot Ekosistemasi
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                  Ilovaga kirmasdan ham har kuni Telegram orqali 5 ta yangi so&apos;z o&apos;rganing, viktorinalar yeching va xotirangizni faol saqlang. Web platforma va Telegram bot real-vaqtda sinxronlashadi.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center gap-2 text-xs font-mono text-[#229ED9] font-semibold">
                <span>24/7 Mobile Sync</span>
                <TelegramIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS (3 Simple Steps) */}
        <section id="how-it-works" className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight mb-4">
              Vydex qanday ishlaydi?
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Kuniga atigi 10 daqiqa sarflab, 3 oyda 1500+ C1 so&apos;zni mustahkam o&apos;zlashtiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 relative shadow-sm">
              <span className="text-5xl font-black font-manrope text-[#ef233c]/20 mb-4 block">01</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-2">
                Lug&apos;at to&apos;plamini tanlang
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Tayyor IELTS Academic 7.5+, C1 Collocations to&apos;plamlaridan foydalaning yoki o&apos;zingiz qiziqqan matnni AI orqali to&apos;plamga aylantiring.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 relative shadow-sm">
              <span className="text-5xl font-black font-manrope text-[#ef233c]/20 mb-4 block">02</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-2">
                4 xil rejimda mashq qiling
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Interaktiv Fleshkardlar, 4 variantli Viktorina (Quiz), Yozma Diktant (Typing) va AI yordamida jumla tuzib kontekstni mustahkamlang.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 relative shadow-sm">
              <span className="text-5xl font-black font-manrope text-[#ef233c]/20 mb-4 block">03</span>
              <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white mb-2">
                SRS takrorlash bilan muhrlang
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed">
                Tizim unutish xavfi tug&apos;ilgan so&apos;zlarni o&apos;zi oldingizga olib chiqadi. Siz faqat eslaysiz va baholaysiz.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FEATURES BENTO GRID */}
        <section id="features" className="scroll-mt-32">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight font-manrope mb-4">
              IELTS va CEFR uchun <br />
              <span className="text-[#ef233c]">To&apos;liq Imkoniyatlar Tizimi</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Har bir xususiyat til o&apos;rganuvchilarning amaliy ehtiyojlaridan kelib chiqib loyihalangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1: AI Text-to-Deck */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex p-3 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#ef233c]">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-manrope mb-3 tracking-tight">
                  Generative AI Text-to-Deck
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Istalgan inglizcha maqola yoki IELTS reading qismini yuklang. Google Gemini AI undagi eng muhim akademik so&apos;zlarni, o&apos;zbekcha aniq tarjimasi, CEFR darajasi va misol jumlalari bilan ajratib beradi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#ef233c]">GEMINI 2.5 FLASH</span>
                <Sparkles className="w-4 h-4 text-[#ef233c]" />
              </div>
            </div>

            {/* Feature 2: Leitner SRS */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex p-3 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#ef233c]">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-manrope mb-3 tracking-tight">
                  Spaced Repetition (SRS Engine)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed font-inter">
                  Ebbinghaus unutish egri chizig&apos;i asosidagi 5 bosqichli Leitner tizimi. Oson so&apos;zlar kamroq, qiyin so&apos;zlar tez-tez takrorlanib, 100% uzoq muddatli xotiraga aylanadi.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#ef233c]">LEITNER 5-BOX ENGINE</span>
                <Clock className="w-4 h-4 text-[#ef233c]" />
              </div>
            </div>

            {/* Feature 3: Telegram Bot */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-sky-50 dark:bg-white/5 border border-sky-200 dark:border-white/10 text-[#229ED9]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-manrope mb-2">Telegram Bot</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter">
                Platformaga kirmasdan ham har kuni Telegram orqali 5 ta yangi so&apos;z va testlar yeching.
              </p>
            </div>

            {/* Feature 4: Context Checker */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-white/5 border border-emerald-200 dark:border-white/10 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-manrope mb-2">Kontekst Tekshiruvi</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter">
                Yodlagan so&apos;zingiz bilan jumla tuzing — AI grammatika va kollokatsiyani darhol baholaydi.
              </p>
            </div>

            {/* Feature 5: Native Audio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-amber-50 dark:bg-white/5 border border-amber-200 dark:border-white/10 text-amber-500">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-manrope mb-2">US / UK Talaffuz</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter">
                Har bir so&apos;z uchun britaniya va amerika talaffuzi bilan to&apos;g&apos;ri nutq ko&apos;nikmasi.
              </p>
            </div>

            {/* Feature 6: Daily Streak */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="mb-4 inline-flex p-3 rounded-2xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#ef233c]">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-manrope mb-2">Streak &amp; Reyting</h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter">
                Kunlik uzluksiz o&apos;qish seriyasini saqlang va doimiy o&apos;sish ritmiga kiring.
              </p>
            </div>
          </div>
        </section>

        {/* 5. COMPARISON TABLE: Traditional vs Vydex */}
        <section className="scroll-mt-32">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight font-manrope mb-4">
              An&apos;anaviy Usul <span className="text-zinc-400">vs</span>{" "}
              <span className="text-[#ef233c]">Vydex AI</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-inter">
              Farqni o&apos;zingiz taqqoslab ko&apos;ring
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                  <th className="p-4 sm:p-6 font-manrope font-bold text-zinc-900 dark:text-white">Mezon</th>
                  <th className="p-4 sm:p-6 font-manrope font-bold text-zinc-500">Oddiy lug&apos;at daftari</th>
                  <th className="p-4 sm:p-6 font-manrope font-bold text-[#ef233c] bg-red-500/5">Vydex AI Platformasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                {[
                  {
                    metric: "Xotirada saqlanib qolish",
                    old: "2 haftadan so'ng 80% unutiladi",
                    vydex: "Leitner SRS bilan 95%+ mustahkam xotira",
                  },
                  {
                    metric: "Matndan so'z ajratish",
                    old: "Lug'atdan qo'lda qidirish (1 soat)",
                    vydex: "Gemini 2.5 Flash bilan 1 soniyada avtomatik",
                  },
                  {
                    metric: "Jumla tuzish & Tekshirish",
                    old: "O'qituvchi tekshiruvini kutish kerak",
                    vydex: "AI darhol grammatika va kontekstni baholaydi",
                  },
                  {
                    metric: "Takrorlash intizomi",
                    old: "Tartibsiz, unutilib qoladi",
                    vydex: "Telegram bot va bildirishnomalar orqali doimiy",
                  },
                  {
                    metric: "Talaffuz va Audio",
                    old: "Faqat transkripsiyaga qarab taxmin qilish",
                    vydex: "Tabiiy US / UK audio talaffuzi bilan",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 sm:p-6 font-semibold text-zinc-900 dark:text-white">{row.metric}</td>
                    <td className="p-4 sm:p-6 text-zinc-500 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{row.old}</span>
                    </td>
                    <td className="p-4 sm:p-6 text-zinc-900 dark:text-white font-medium bg-red-500/5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{row.vydex}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. TESTIMONIAL BANNER */}
        <section className="w-full bg-[#ef233c] py-14 sm:py-20 px-6 rounded-3xl shadow-[0_0_50px_rgba(239,35,60,0.3)] text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center gap-1 mb-6 text-black">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-black text-black" />
              ))}
            </div>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold font-manrope leading-tight mb-8 text-black">
              &ldquo;Vydex orqali 3 oy ichida 1500 dan ortiq C1 akademik so&apos;zlarni o&apos;zlashtirdim va IELTS Readingdan 8.5 oldim.&rdquo;
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full overflow-hidden flex items-center justify-center text-white font-bold font-manrope">
                SZ
              </div>
              <div className="text-left">
                <div className="text-black font-bold text-lg font-manrope">Shahzod Zokirov</div>
                <div className="text-black/80 font-medium text-xs font-inter">IELTS Overall 8.5 • Toshkent</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section id="faq" className="scroll-mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 text-[#ef233c] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Savol-Javoblar</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold font-manrope text-zinc-900 dark:text-white tracking-tight">
              Ko&apos;p Beriladigan Savollar
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Vydex platformasidan foydalanish bepulmi?",
                a: "Ha! Platformaning asosiy imkoniyatlari — lug'at to'plamlarini o'rganish, Spaced Repetition (SRS) trenajyori, Telegram bot bilan ishlash mutlaqo bepul.",
              },
              {
                q: "Qanday ro'yxatdan o'tishim mumkin?",
                a: "Siz 2 xil eng qulay usulda ro'yxatdan o'tishingiz mumkin: Google akkauntingiz orqali yoki Telegram bot orqali 1 ta bosish bilan. Hech qanday murakkab formalar talab qilinmaydi.",
              },
              {
                q: "Telegram bot bilan qanday bog'lanadi?",
                a: "Saytda 'Telegram bot orqali kirish' tugmasini bosing yoki Telegramda @vydex_uzbot botiga kiring. Barcha natijalaringiz va xotira seriyangiz (streak) avtomatik sinxronlanadi.",
              },
              {
                q: "AI qanday qilib matndan lug'at to'plami yaratadi?",
                a: "Siz istalgan inglizcha matnni joylaysiz. Bizning integratsiyalangan Google Gemini 2.5 Flash modelimiz matnni tahlil qilib, IELTS va CEFR B2/C1/C2 darajasidagi eng foydali so'zlarni, o'zbekcha tarjimasi va misol jumlalari bilan ajratib beradi.",
              },
              {
                q: "Qorong'i (Dark) va Yorug' (Light) rejimlarni qanday almashtiraman?",
                a: "Saytning tepa qismidagi (navbarda) quyosh/oy tugmasini bosish orqali xohlagan paytingizda Light yoki Dark rejimga o'tishingiz mumkin.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-manrope font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-[#ef233c] dark:hover:text-[#ef233c] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl font-mono text-[#ef233c] transition-transform ${activeFaq === idx ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-inter leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 8. FINAL CALL TO ACTION (CTA) */}
        <section className="py-16 sm:py-20 text-center relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/70 p-8 sm:p-14 shadow-xl">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-manrope mb-6 tracking-tight text-zinc-900 dark:text-white">
              Lug&apos;at boyligingizni <br />
              <span className="text-[#ef233c]">bugunoq kuchaytiring</span>
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl mx-auto font-inter">
              Hech qanday to&apos;lov talab qilinmaydi. Google yoki Telegram orqali 1-soniyada ro&apos;yxatdan o&apos;ting.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm shadow-[0_0_25px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboardga O&apos;tish</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal("register")}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#ef233c] hover:bg-red-700 text-white font-bold text-sm shadow-[0_0_25px_rgba(239,35,60,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Google yoki Telegram bilan Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <a
                href="https://t.me/vydex_uzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-300 dark:border-white/10 text-zinc-800 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                <span>Telegram Botda Boshlash</span>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* AI Smart Import Modal for Hero trigger */}
      <AISmartImportModal
        isOpen={isAIImportModalOpen}
        initialText={importInitialText}
        onClose={() => setIsAIImportModalOpen(false)}
        onDeckCreated={(newDeck) => {
          if (typeof window !== "undefined") {
            window.location.href = `/decks/${newDeck.id}`;
          }
        }}
      />
    </div>
  );
}
