"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Trash2,
  BookOpen,
  Wand2,
  Check,
  AlertCircle,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  FileUp,
  ListPlus,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";
import { api, ExtractedCardItem, DeckDetail } from "@/lib/api";
import { GlassButton } from "@/components/ui/GlassButton";

interface AISmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (newDeck: DeckDetail) => void;
  initialText?: string;
}

const SAMPLE_ACADEMIC_PASSAGE = `The emergence of modern mega-corporations has sparked widespread debates regarding whether aggressive profit maximization overlooks the symbiotic relationship between corporate prosperity and communal cohesion. While technology behemoths often establish sprawling campuses equipped with lavish amenities to foster recruitment, critics argue that such gestures are mere window dressing designed to obscure exploitative labor practices. When corporate philanthropy blurs with strategic public relations, regulators must rigorously scrutinize corporate overreach to mitigate societal polarization. Without active civic pushback, institutions risk exacerbating social fragmentation rather than nurturing inclusive prosperity.`;

const SAMPLE_READY_VOCAB = `Interconnected - o'zaro bog'langan
Stumbling block - to'siq, halaqit beruvchi narsa
Dominance - hukmronlik
Invention - ixtiro
Universal - umumiy, butun dunyoga oid
Neutral - betaraf
Favoritism - tarafkashlik
Lingua franca - xalqaro aloqa tili
Globalization - globallashuv
Barrier - to'siq
Miscommunication - noto'g'ri aloqa, tushunmovchilik
Standardized - standartlashtirilgan
Accessible - qulay, hammaga tushunarli
Consequence - oqibat
Resilient - bardoshli, tez o'zini tiklaydigan
Colossal - ulkan, behad katta
Democratize - tenglashtirmoq, ochiq qilmoq
Cacophony - g'ala-g'ovur, shovqin`;

export function AISmartImportModal({
  isOpen,
  onClose,
  onDeckCreated,
  initialText = "",
}: AISmartImportModalProps) {
  // Mode: "extract" (Matn/Fayldan ajratish) or "ready_import" (Tayyor lug'atni yuklash)
  const [activeTab, setActiveTab] = useState<"extract" | "ready_import">("extract");

  // Tab 1 States (Extract from text or file)
  const [passageText, setPassageText] = useState(initialText);
  const [level, setLevel] = useState("C1");
  const [maxWords, setMaxWords] = useState(50);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    base64?: string;
    textPreview?: string;
  } | null>(null);

  // Tab 2 States (Ready-made vocab import)
  const [readyVocabText, setReadyVocabText] = useState("");
  const [enrichWithAI, setEnrichWithAI] = useState(true);

  // Common Review & Save States
  const [extractedCards, setExtractedCards] = useState<ExtractedCardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialText) {
      setPassageText(initialText);
      setActiveTab("extract");
    }
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  // Handle File Upload (Images, PDFs, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Fayl hajmi 10MB dan oshmasligi kerak.");
      return;
    }

    const reader = new FileReader();

    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedFile({
          name: file.name,
          type: file.type,
          base64,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Text or markdown file
      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || "";
        setUploadedFile({
          name: file.name,
          type: file.type || "text/plain",
          textPreview: textContent.slice(0, 500),
        });
        setPassageText(textContent);
      };
      reader.readAsText(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Parser for ready-made vocabulary text (Tab 2)
  const parseReadyVocabText = (rawText: string): ExtractedCardItem[] => {
    const lines = rawText.split("\n");
    const parsed: ExtractedCardItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Clean leading numbering: "1.", "1)", "1 -", "#1", "[1]"
      const cleaned = trimmed.replace(/^(\[\d+\]|#?\d+[\.\)\-\:\s]+)/, "").trim();
      if (!cleaned) continue;

      // Match common separators: " - ", " – ", " — ", " : ", " = ", "\t", " -> ", " / "
      const parts = cleaned.split(/\s*(?:[-–—:=]|\t|->|\/)\s*/);

      if (parts.length >= 2) {
        const term = parts[0].trim().toLowerCase();
        const meaning = parts.slice(1).join(" - ").trim();
        if (term && meaning) {
          parsed.push({
            term_en: term,
            meaning_uz: meaning,
            synonyms: "",
            example_en: "",
            level: level || "C1",
          });
          continue;
        }
      } else if (cleaned.includes(",")) {
        const commaIdx = cleaned.indexOf(",");
        const term = cleaned.slice(0, commaIdx).trim().toLowerCase();
        const meaning = cleaned.slice(commaIdx + 1).trim();
        if (term && meaning) {
          parsed.push({
            term_en: term,
            meaning_uz: meaning,
            synonyms: "",
            example_en: "",
            level: level || "C1",
          });
          continue;
        }
      }
    }

    return parsed;
  };

  // Handle Tab 1: AI Extraction from Text / File
  const handleExtractFromTextOrFile = async () => {
    if (!passageText.trim() && !uploadedFile?.base64) {
      setErrorMessage("Iltimos, inglizcha matn kiriting yoki rasm/hujjat yuklang.");
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await api.extractVocab({
        text: passageText.trim(),
        file_base64: uploadedFile?.base64,
        file_type: uploadedFile?.type,
        file_name: uploadedFile?.name,
        level: level,
        count: maxWords,
        max_words: maxWords,
        mode: "extract",
      });

      const cards = res.cards || (res as any).words || [];
      if (!cards || cards.length === 0) {
        throw new Error("Kiritilgan matndan yangi akademik so'zlar aniqlanmadi.");
      }

      setExtractedCards(cards);
      setSelectedIndices(cards.map((_, idx) => idx));
      setDeckTitle(
        uploadedFile?.name
          ? `AI: ${uploadedFile.name.replace(/\.[^/.]+$/, "")}`
          : `AI Reading: ${passageText.slice(0, 24)}...`
      );
      setDeckDescription(`AI tahlili: ${cards.length} ta ${level} akademik so'z`);
    } catch (err: any) {
      console.error("AI extraction error:", err);
      setErrorMessage(
        err.message ||
          "Kechirasiz, Lexora AI faqat ingliz tili lug'atlarini ajratish, tarjima qilish va so'zlarni o'rganish uchun mo'ljallangan. Boshqa mavzulardagi so'rovlar qabul qilinmaydi."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Tab 2: Ready Vocab Import
  const handleImportReadyVocab = async () => {
    if (!readyVocabText.trim()) {
      setErrorMessage("Iltimos, tayyor lug'at matnini kiriting.");
      return;
    }

    const directParsed = parseReadyVocabText(readyVocabText);

    if (directParsed.length === 0) {
      setErrorMessage(
        "Kiritilgan formatdan so'zlar aniqlanmadi. Format: 'Word - Ma'nosi' yoki '1. Word - Ma'nosi' ko'rinishida yozing."
      );
      return;
    }

    setDeckTitle(`Maxsus Lug'at (${directParsed.length} ta so'z)`);
    setDeckDescription(`Foydalanuvchi yuklagan barcha ${directParsed.length} ta so'z`);

    // If user wants AI enrichment (synonyms + authentic contextual sentences)
    if (enrichWithAI) {
      try {
        setIsProcessing(true);
        setErrorMessage(null);

        const promptText = `Enrich the following prepared vocabulary list with high-level synonyms and authentic contextual example sentences:\n${readyVocabText.slice(
          0,
          50000
        )}`;

        const res = await api.extractVocab({
          text: promptText,
          level: level,
          count: directParsed.length,
          max_words: directParsed.length,
          mode: "enrich",
        });

        const aiCards = res.cards || (res as any).words || [];
        if (aiCards && aiCards.length > 0) {
          // Map AI results by lowercase English term
          const aiMap = new Map<string, ExtractedCardItem>();
          for (const card of aiCards) {
            if (card.term_en) {
              aiMap.set(card.term_en.toLowerCase().trim(), card);
            }
          }

          // Merge: Guarantee 100% of user's uploaded words are kept without omission!
          const finalCards: ExtractedCardItem[] = directParsed.map((orig) => {
            const enriched = aiMap.get(orig.term_en.toLowerCase().trim());
            if (enriched) {
              return {
                term_en: orig.term_en,
                meaning_uz: enriched.meaning_uz || orig.meaning_uz,
                synonyms: enriched.synonyms || "",
                example_en: enriched.example_en || "",
                level: enriched.level || level || "C1",
              };
            }
            return orig;
          });

          setExtractedCards(finalCards);
          setSelectedIndices(finalCards.map((_, idx) => idx));
        } else {
          setExtractedCards(directParsed);
          setSelectedIndices(directParsed.map((_, idx) => idx));
        }
      } catch (err) {
        console.warn("AI enrichment failed, preserving all uploaded words:", err);
        // Fallback: 100% of user words are preserved
        setExtractedCards(directParsed);
        setSelectedIndices(directParsed.map((_, idx) => idx));
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Direct fast import without AI call
      setExtractedCards(directParsed);
      setSelectedIndices(directParsed.map((_, idx) => idx));
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === extractedCards.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(extractedCards.map((_, idx) => idx));
    }
  };

  const handleDeleteCard = (index: number) => {
    setExtractedCards((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndices((prev) =>
      prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i))
    );
  };

  const handleUpdateCard = (index: number, field: keyof ExtractedCardItem, value: string) => {
    setExtractedCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveDeck = async () => {
    const cardsToSave = extractedCards.filter((_, idx) => selectedIndices.includes(idx));
    if (cardsToSave.length === 0) {
      setErrorMessage("Kamida bitta so'z tanlanishi kerak.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const newDeck = await api.createDeck({
        title: deckTitle.trim() || "Lexora AI So'zlar To'plami",
        description:
          deckDescription.trim() || `AI yordamida yaratilgan ${cardsToSave.length} ta so'z`,
        level: level,
        cards: cardsToSave.map((c) => ({
          term_en: c.term_en,
          meaning_uz: c.meaning_uz,
          synonyms: c.synonyms,
          example_en: c.example_en,
        })),
      });

      onDeckCreated(newDeck);
      onClose();
    } catch (err: any) {
      console.error("Save AI deck error:", err);
      setErrorMessage(err.message || "To'plamni saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time counter for parsed words in Tab 2
  const parsedReadyCount = readyVocabText.trim()
    ? parseReadyVocabText(readyVocabText).length
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[32px] bg-white dark:bg-[#1E2128] border border-zinc-200 dark:border-white/10 shadow-2xl p-5 sm:p-8 text-zinc-900 dark:text-white transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#B6FF2E]/15 border border-[#B6FF2E]/30 flex items-center justify-center text-[#B6FF2E] shadow-[0_0_20px_rgba(182,255,46,0.2)]">
              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-[#B6FF2E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black font-manrope text-zinc-950 dark:text-white tracking-tight">
                  Lexora AI Workspace
                </h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#B6FF2E]/15 text-emerald-700 dark:text-[#B6FF2E] border border-emerald-500/30 dark:border-[#B6FF2E]/40 uppercase font-mono">
                  Gemini 3.5 Multimodal
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-inter mt-0.5">
                Ingliz tili akademik lug&apos;atlarini tahlil qilish, ajratish va to&apos;plamga kiritish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Refusal Banner */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex items-start gap-3 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Eslatma: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* If Cards are NOT yet extracted, show Tab Navigation */}
        {extractedCards.length === 0 ? (
          <div className="mt-6 space-y-6">
            {/* SUB-SECTION TABS */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-sm font-bold font-manrope">
              <button
                type="button"
                onClick={() => setActiveTab("extract")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                  activeTab === "extract"
                    ? "bg-white dark:bg-[#23262F] text-zinc-950 dark:text-[#B6FF2E] shadow-md border border-zinc-200 dark:border-[#B6FF2E]/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Matn &amp; Fayldan Ajratish</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ready_import")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                  activeTab === "ready_import"
                    ? "bg-white dark:bg-[#23262F] text-zinc-950 dark:text-[#B6FF2E] shadow-md border border-zinc-200 dark:border-[#B6FF2E]/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                <ListPlus className="w-4 h-4" />
                <span>2. Tayyor Lug&apos;atni Yuklash</span>
                {parsedReadyCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#B6FF2E] text-[#15171C] text-[10px] font-extrabold">
                    {parsedReadyCount}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1 CONTENT: Extract from Text or File */}
            {activeTab === "extract" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* File Upload Zone */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                    Fayl yuklash (Rasm, PDF yoki Matn):
                  </label>

                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.txt,.md,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="ai-file-upload-input"
                    />

                    {uploadedFile ? (
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-[#B6FF2E]/40 flex items-center justify-between">
                        <div className="flex items-center gap-3 truncate">
                          {uploadedFile.type.startsWith("image/") ? (
                            <ImageIcon className="w-6 h-6 text-[#B6FF2E] shrink-0" />
                          ) : (
                            <FileUp className="w-6 h-6 text-[#B6FF2E] shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-zinc-500 font-mono">
                              {uploadedFile.type || "Fayl"} • AI tahliliga tayyor
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeUploadedFile}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50"
                        >
                          O&apos;chirish
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="ai-file-upload-input"
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-white/15 hover:border-emerald-500 dark:hover:border-[#B6FF2E]/60 rounded-2xl bg-zinc-50/50 dark:bg-[#15171C]/50 hover:bg-zinc-100 dark:hover:bg-[#15171C] cursor-pointer transition group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#23262F] border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-[#B6FF2E] group-hover:scale-105 transition mb-3">
                          <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          Rasm (skrinshot, kitob varag&apos;i), PDF yoki matnli fayl yuklang
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          PNG, JPG, WEBP, PDF, TXT (maksimal 10MB) • Gemini OCR va leksik tahlil
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Textarea for Raw Text Input */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Yoki inglizcha matn / maqolani kiriting:
                    </label>

                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setPassageText(SAMPLE_ACADEMIC_PASSAGE);
                          removeUploadedFile();
                        }}
                        className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold cursor-pointer"
                      >
                        Namunaviy Matn (Sample)
                      </button>
                      {passageText && (
                        <button
                          type="button"
                          onClick={() => setPassageText("")}
                          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={5}
                    value={passageText}
                    onChange={(e) => setPassageText(e.target.value)}
                    placeholder="Inglizcha maqola, kitob parchasi, insho yoki matnni bu yerga joylashtiring..."
                    className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E] transition leading-relaxed resize-none font-inter"
                  />
                </div>

                {/* Level and Word Count Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Lug&apos;at Qiyinlik Darajasi:
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#23262F] border border-zinc-300 dark:border-white/15 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E]"
                    >
                      <option value="Advanced">Yuqori Bosqich (Advanced Mastery)</option>
                      <option value="Proficient">Eng Murakkab (Proficient & Native)</option>
                      <option value="Upper-Intermediate">O&apos;rta-Yuqori (Upper-Intermediate)</option>
                      <option value="All">Barchasi (Eng muhim so&apos;zlar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Ajratiladigan so&apos;zlar soni:
                    </label>
                    <select
                      value={maxWords}
                      onChange={(e) => setMaxWords(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#23262F] border border-zinc-300 dark:border-white/15 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E]"
                    >
                      <option value={15}>15 ta qisqa to&apos;plam</option>
                      <option value={30}>30 ta akademik so&apos;z</option>
                      <option value={50}>50 ta to&apos;liq to&apos;plam (Tavsiya)</option>
                      <option value={100}>100 ta katta to&apos;plam</option>
                      <option value={200}>Barcha topilgan so&apos;zlar (200 tagacha)</option>
                    </select>
                  </div>
                </div>

                {/* Extract Action Button */}
                <GlassButton
                  onClick={handleExtractFromTextOrFile}
                  isLoading={isProcessing}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {isProcessing
                    ? "Gemini AI Matnni Tahlil Qilmoqda..."
                    : "AI Bilan So'zlarni Ajratish & Lug'at Yaratish"}
                </GlassButton>
              </div>
            )}

            {/* TAB 2 CONTENT: Direct Ready Vocabulary Import */}
            {activeTab === "ready_import" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Tayyor so&apos;zlar ro&apos;yxati:
                    </label>

                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setReadyVocabText(SAMPLE_READY_VOCAB)}
                        className="text-emerald-700 dark:text-[#B6FF2E] hover:underline font-bold cursor-pointer"
                      >
                        72 ta So&apos;z Namunasi
                      </button>
                      {readyVocabText && (
                        <button
                          type="button"
                          onClick={() => setReadyVocabText("")}
                          className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    value={readyVocabText}
                    onChange={(e) => setReadyVocabText(e.target.value)}
                    placeholder={`Format:\nInterconnected - o'zaro bog'langan\n1. Stumbling block - to'siq\nDominance - hukmronlik`}
                    className="w-full p-4 rounded-2xl bg-white dark:bg-[#23262F] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E] transition font-mono leading-relaxed resize-none"
                  />

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>
                      Qo&apos;llab-quvvatlanadi: <code>Word - Tarjima</code>, <code>1. Word - Tarjima</code>, <code>Word : Tarjima</code>
                    </span>
                    <span className="font-bold font-mono text-emerald-700 dark:text-[#B6FF2E]">
                      {parsedReadyCount} ta so&apos;z aniqlandi
                    </span>
                  </div>
                </div>

                {/* AI Enrichment Option Toggle */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#B6FF2E]" />
                      AI Orqali Boyitish (Sinonim va Namunaviy Gaplar)
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Yoqilsa, Gemini AI har bir so&apos;z uchun yuqori balli akademik sinonimlar va kontekstual gaplar generatsiya qiladi.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enrichWithAI}
                    onChange={(e) => setEnrichWithAI(e.target.checked)}
                    className="w-5 h-5 accent-[#B6FF2E] rounded cursor-pointer shrink-0"
                  />
                </div>

                {/* Import Action Button */}
                <GlassButton
                  onClick={handleImportReadyVocab}
                  isLoading={isProcessing}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<ListPlus className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {isProcessing
                    ? "Lug'atlar Tahlil Qilinmoqda..."
                    : `Lug'atni Ko'rib Chiqish & Import Qilish (${parsedReadyCount} ta)`}
                </GlassButton>
              </div>
            )}
          </div>
        ) : (
          /* REVIEW & EDIT STAGE (Both modes land here) */
          <div className="mt-6 space-y-6 animate-in fade-in duration-300">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400">
                  Aniqlangan So&apos;zlar:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#B6FF2E] text-[#15171C] text-xs font-black font-mono">
                  {selectedIndices.length} / {extractedCards.length} ta tanlandi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#23262F] border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  {selectedIndices.length === extractedCards.length
                    ? "Barchasini bekor qilish"
                    : "Barchasini tanlash"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExtractedCards([]);
                    setSelectedIndices([]);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
                >
                  Qaytadan boshlash
                </button>
              </div>
            </div>

            {/* Deck Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  To&apos;plam Nomi:
                </label>
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="Masalan: Daily Reading 72 Words"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-300 dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400 mb-1">
                  Tavsif (Ixtiyoriy):
                </label>
                <input
                  type="text"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  placeholder="Masalan: Kundalik takrorlash uchun saralangan so'zlar"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#15171C] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-[#B6FF2E]"
                />
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
              {extractedCards.map((card, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-white dark:bg-[#23262F]/90 border-emerald-500/50 dark:border-[#B6FF2E]/50 shadow-sm"
                        : "bg-zinc-50/70 dark:bg-[#15171C]/60 border-zinc-200 dark:border-white/5 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(idx)}
                        className="w-5 h-5 accent-[#B6FF2E] rounded cursor-pointer mt-1"
                      />

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Term & Translation */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-zinc-400">
                              #{idx + 1}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B6FF2E]/15 text-emerald-800 dark:text-[#B6FF2E]">
                              {card.level || level}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={card.term_en}
                            onChange={(e) => handleUpdateCard(idx, "term_en", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-[#B6FF2E] mb-2"
                            placeholder="English term"
                          />
                          <input
                            type="text"
                            value={card.meaning_uz}
                            onChange={(e) => handleUpdateCard(idx, "meaning_uz", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white outline-none focus:border-[#B6FF2E]"
                            placeholder="O'zbekcha tarjimasi"
                          />
                        </div>

                        {/* Synonyms & Example */}
                        <div>
                          <input
                            type="text"
                            value={card.synonyms || ""}
                            onChange={(e) => handleUpdateCard(idx, "synonyms", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#B6FF2E] mb-2"
                            placeholder="Sinonimlar (vergul bilan)"
                          />
                          <textarea
                            rows={2}
                            value={card.example_en || ""}
                            onChange={(e) => handleUpdateCard(idx, "example_en", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#15171C] border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#B6FF2E] resize-none"
                            placeholder="Namunaviy gap..."
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCard(idx)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Deck CTA */}
            <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
              <GlassButton
                onClick={handleSaveDeck}
                isLoading={isSaving}
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                {isSaving
                  ? "To'plam Saqlanmoqda..."
                  : `${selectedIndices.length} ta So'zni To'plamga Saqlash & O'rganishni Boshlash`}
              </GlassButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
