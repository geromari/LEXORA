"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  Volume2, 
  Layers,
  Send,
  Zap
} from "lucide-react";
import { TelegramIcon } from "@/components/icons/BrandIcons";

interface RetroHeroSectionProps {
  onAnalyzeText: (text: string) => void;
}

export function RetroHeroSection({ onAnalyzeText }: RetroHeroSectionProps) {
  const [inputText, setInputText] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyzeText(inputText.trim());
    } else {
      // Default sample passage if empty
      onAnalyzeText("scrutinize ubiquitous unprecedented");
    }
  };

  return (
    <div className="w-full relative overflow-hidden pt-4 sm:pt-8 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ====================================================================
              LEFT COLUMN: Editorial Copy & Interactive Input
              ==================================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small uppercase category bullet */}
            <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold tracking-widest text-[#121212] uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] border border-[#121212] inline-block shadow-[1px_1px_0px_#121212]" />
              <span>A FITTING ROOM FOR YOUR VOCABULARY</span>
            </div>

            {/* Giant Title matching image typography */}
            <h1 className="text-4xl sm:text-6xl lg:text-[66px] font-black text-[#121212] tracking-tight leading-[1.05]">
              Does your vocab <br className="hidden sm:inline" />
              actually{" "}
              <span className="inline-block bg-[#FFCC00] text-[#121212] px-3.5 sm:px-5 py-0.5 sm:py-1 rounded-2xl border-[2.5px] border-[#121212] shadow-[4px_4px_0px_#121212] sm:shadow-[5px_5px_0px_#121212] -rotate-2 transform hover:rotate-0 transition-transform">
                fit?
              </span>
            </h1>

            {/* Subtitle in Uzbek & English context */}
            <p className="text-base sm:text-lg text-zinc-700 font-medium max-w-xl leading-relaxed">
              Istalgan inglizcha matn, IELTS reading yoki mavzu kiriting. Lexora AI 
              uni tahlil qilib, Spaced Repetition (SRS) kartalariga aylantiradi va 
              Telegram botingiz bilan sinxronlaydi.
            </p>

            {/* Input Action Card matching image's "YOUR SITE" box */}
            <div className="pt-2">
              <span className="block font-mono text-xs font-black tracking-widest text-[#121212] uppercase mb-2">
                YOUR TEXT / TOPIC
              </span>

              <form 
                onSubmit={handleSubmit}
                className="w-full max-w-xl rounded-2xl border-[2.5px] border-[#121212] bg-white shadow-[4px_4px_0px_#121212] sm:shadow-[5px_5px_0px_#121212] p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all focus-within:shadow-[6px_6px_0px_#121212]"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="reading matni yoki so'z kiriting..."
                  className="w-full bg-transparent px-3.5 py-2.5 font-mono text-sm sm:text-base text-[#121212] placeholder:text-zinc-400 outline-none"
                />

                <button
                  type="submit"
                  className="bg-[#FA5A2A] hover:bg-[#E04719] text-white font-bold text-sm sm:text-base px-5 py-3 rounded-xl border-2 border-[#121212] flex items-center justify-center gap-2 shadow-[2px_2px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer shrink-0"
                >
                  <span>Try it on</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>

              {/* Helper text underneath input box */}
              <p className="text-xs text-zinc-500 font-medium mt-2.5">
                Works with IELTS Reading, CEFR C1/B2, academic essays, and @lexora_uzbot.
              </p>
            </div>

          </div>


          {/* ====================================================================
              RIGHT COLUMN: Overlapping Neobrutalist Mockup Devices
              ==================================================================== */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative w-full max-w-[480px] sm:max-w-[520px] mx-auto h-[380px] sm:h-[430px]">

              {/* --------------------------------------------------------------
                  1. BACK DEVICE: Desktop Window (Mockup with 3 columns)
                  -------------------------------------------------------------- */}
              <div className="absolute top-2 right-0 w-[84%] sm:w-[86%] h-[290px] sm:h-[310px] rounded-2xl border-[2.5px] border-[#121212] bg-[#FAF8F5] shadow-[6px_6px_0px_#121212] overflow-hidden z-0">
                {/* Desktop Window Titlebar */}
                <div className="px-3 py-2 border-b-2 border-[#121212] bg-[#F4EFEA] flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FA5A2A] border border-[#121212]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00] border border-[#121212]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-[#121212]" />
                  </div>
                  <div className="flex-1 text-center font-mono text-[10px] text-zinc-500 truncate">
                    lexora.uz/study
                  </div>
                </div>

                {/* Desktop 3 Columns (matching screenshot layout) */}
                <div className="p-3 grid grid-cols-3 gap-2.5 h-[calc(100%-36px)] bg-[#FAF8F5]">
                  {/* Column 1 */}
                  <div className="bg-white rounded-xl border-2 border-[#121212] p-2 flex flex-col justify-between shadow-[2px_2px_0px_#121212]">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-zinc-400">Leitner</div>
                      <div className="text-xs font-black text-[#121212]">Box 5</div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-[#121212]">
                        <div className="w-[85%] h-full bg-[#10B981]" />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500">142 so&apos;z</div>
                  </div>

                  {/* Column 2 */}
                  <div className="bg-white rounded-xl border-2 border-[#121212] p-2 flex flex-col justify-between shadow-[2px_2px_0px_#121212]">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-zinc-400">Streak</div>
                      <div className="text-xs font-black text-[#FA5A2A] flex items-center gap-0.5">
                        <Flame className="w-3 h-3 fill-[#FA5A2A]" />
                        7 kun
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-[#121212]">
                        <div className="w-[100%] h-full bg-[#FA5A2A]" />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500">Faol seriya</div>
                  </div>

                  {/* Column 3 */}
                  <div className="bg-white rounded-xl border-2 border-[#121212] p-2 flex flex-col justify-between shadow-[2px_2px_0px_#121212]">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-zinc-400">Mastery</div>
                      <div className="text-xs font-black text-[#2563EB]">94%</div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-[#121212]">
                        <div className="w-[94%] h-full bg-[#2563EB]" />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500">C1 Academic</div>
                  </div>
                </div>
              </div>

              {/* Tilted Hatched Orange Badge sticking on Top Right (like "SPILLING +32PX") */}
              <div className="absolute -top-3.5 right-2 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-[#FA5A2A] text-white font-mono text-[11px] font-black border-2 border-[#121212] rounded-md shadow-[3px_3px_0px_#121212] rotate-3 badge-hatched">
                <span className="tracking-wide">UNUTISH: 0%</span>
              </div>


              {/* --------------------------------------------------------------
                  2. MIDDLE DEVICE: Tablet Window (Flashcard with Pronunciation)
                  -------------------------------------------------------------- */}
              <div className="absolute top-16 left-0 sm:left-2 w-[62%] sm:w-[60%] rounded-2xl border-[2.5px] border-[#121212] bg-white shadow-[6px_6px_0px_#121212] p-4 z-10">
                {/* Yellow Tilted Badge on Top Left (like "TIGHT") */}
                <div className="absolute -top-3 -left-3 z-30 px-2.5 py-0.5 bg-[#FFCC00] text-[#121212] font-mono text-[10px] font-black border-2 border-[#121212] rounded-md shadow-[2px_2px_0px_#121212] -rotate-3">
                  SRS LEVEL 4
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30">
                      C1 Academic
                    </span>
                    <button 
                      onClick={() => setIsFlipped(!isFlipped)} 
                      className="text-zinc-400 hover:text-[#121212]"
                      title="Tinglash"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-[#121212] tracking-tight">
                      scrutinize
                    </h4>
                    <p className="font-mono text-[11px] text-zinc-500">
                      /ˈskruː.tɪ.naɪz/ · fe&apos;l
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-[#F4EFEA] border border-[#121212]/20 text-xs font-semibold text-[#121212]">
                    🇺🇿 Sinchkovlik bilan tekshirmoq, sinchiklab o&apos;rganmoq
                  </div>

                  <p className="text-[10px] text-zinc-600 italic line-clamp-2 leading-relaxed">
                    &ldquo;Regulators rigorously scrutinize corporate financial records.&rdquo;
                  </p>
                </div>
              </div>


              {/* --------------------------------------------------------------
                  3. FRONT DEVICE: Smartphone Window (Telegram Bot review)
                  -------------------------------------------------------------- */}
              <div className="absolute bottom-2 right-1 sm:right-4 w-[46%] sm:w-[44%] rounded-2xl border-[2.5px] border-[#121212] bg-white shadow-[6px_6px_0px_#121212] p-3 z-20">
                {/* Blue Tilted Badge on Bottom Right (like "FITS") */}
                <div className="absolute -bottom-3 -right-2 z-30 px-2.5 py-0.5 bg-[#2563EB] text-white font-mono text-[10px] font-black border-2 border-[#121212] rounded-md shadow-[2px_2px_0px_#121212] rotate-2">
                  FITS ✓
                </div>

                <div className="space-y-2">
                  {/* Telegram Bot Header */}
                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-[#121212]/10">
                    <TelegramIcon className="w-3.5 h-3.5 text-[#229ED9]" />
                    <span className="font-mono text-[10px] font-black text-[#121212] truncate">
                      @lexora_uzbot
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#121212]/15 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-zinc-500">SRS Quiz #4</span>
                      <span className="text-[#FA5A2A] font-bold">🔥 3 kun</span>
                    </div>
                    <div className="text-xs font-bold text-[#121212]">
                      ubiquitous
                    </div>
                    <div className="text-[9px] text-zinc-600 line-clamp-1">
                      = hamma joyda uchraydigan
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    <span className="text-center py-1 rounded-lg bg-[#FFCC00] text-[#121212] font-black text-[9px] border border-[#121212] shadow-[1px_1px_0px_#121212]">
                      Qiyin (Hard)
                    </span>
                    <span className="text-center py-1 rounded-lg bg-[#10B981] text-white font-black text-[9px] border border-[#121212] shadow-[1px_1px_0px_#121212]">
                      Oson (Easy)
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ====================================================================
          BOTTOM MEASURING RULER (Exact aesthetic from image)
          ==================================================================== */}
      <div className="w-full mt-10 sm:mt-14 bg-[#FFCC00] border-y-[2.5px] border-[#121212] select-none">
        {/* Ticks and measurements bar */}
        <div className="w-full overflow-x-auto py-2 px-4 sm:px-8 flex items-center justify-between text-[11px] font-mono font-bold text-[#121212] min-w-[760px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#121212] rounded-full" />
            <span>0 words</span>
          </span>
          <span className="text-zinc-700">360 (A2)</span>
          <span className="text-zinc-800">768 (B1 Threshold)</span>
          <span className="text-zinc-900 font-black">1024 (B2 Vantage)</span>
          <span className="text-zinc-900 font-black">1288 (C1 Effective)</span>
          <span className="text-zinc-900 font-black">1440 (C2 Mastery)</span>
          <span className="flex items-center gap-2 font-black text-[#121212]">
            <span>1920+ (IELTS 8.5) — still measuring</span>
            <span className="w-2 h-2 rounded-full bg-[#FA5A2A] animate-pulse" />
          </span>
        </div>

        {/* Vintage Ruler Tick Marks Pattern */}
        <div className="w-full h-3 border-t border-[#121212]/30 flex items-end px-2 overflow-hidden">
          <div 
            className="w-full h-2.5 opacity-70"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, #121212, #121212 1.5px, transparent 1.5px, transparent 10px)`,
            }}
          />
        </div>
      </div>

    </div>
  );
}
