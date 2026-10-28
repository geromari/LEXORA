"use client";

import React, { useState } from "react";
import { 
  X, 
  FileText, 
  ListPlus, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertCircle
} from "lucide-react";
import { api, DeckDetail } from "@/lib/api";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (newDeck: DeckDetail) => void;
}

interface ParsedCard {
  term_en: string;
  meaning_uz: string;
  synonyms?: string;
  example_en?: string;
}

export function CreateDeckModal({
  isOpen,
  onClose,
  onDeckCreated,
}: CreateDeckModalProps) {
  const [activeTab, setActiveTab] = useState<"bulk" | "manual">("bulk");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("C1");
  const [bulkText, setBulkText] = useState("");
  const [manualCards, setManualCards] = useState<ParsedCard[]>([
    { term_en: "", meaning_uz: "", synonyms: "", example_en: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Parser for bulk text handling hyphens (-), en-dashes (–), em-dashes (—), colons (:), tabs
  const parseBulkText = (rawText: string): ParsedCard[] => {
    const lines = rawText.split("\n");
    const parsed: ParsedCard[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const match = line.split(/[\s]*[-–—:\t][\s]*/);
      if (match && match.length >= 2) {
        const term = match[0].trim();
        const meaning = match.slice(1).join(" - ").trim();
        if (term && meaning) {
          parsed.push({
            term_en: term,
            meaning_uz: meaning,
          });
        }
      }
    }
    return parsed;
  };

  const handleManualChange = (
    index: number,
    field: keyof ParsedCard,
    value: string
  ) => {
    setManualCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  };

  const handleAddManualRow = () => {
    setManualCards((prev) => [
      ...prev,
      { term_en: "", meaning_uz: "", synonyms: "", example_en: "" },
    ]);
  };

  const handleRemoveManualRow = (index: number) => {
    if (manualCards.length <= 1) return;
    setManualCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("To'plam nomini kiritish majburiy.");
      return;
    }

    let cardsToSubmit: ParsedCard[] = [];
    if (activeTab === "bulk") {
      cardsToSubmit = parseBulkText(bulkText);
      if (cardsToSubmit.length === 0) {
        setErrorMessage(
          "Iltimos, kamida 1 ta so'z va uning tarjimasini kiriting (masalan: apple - olma)."
        );
        return;
      }
    } else {
      cardsToSubmit = manualCards.filter(
        (c) => c.term_en.trim() && c.meaning_uz.trim()
      );
      if (cardsToSubmit.length === 0) {
        setErrorMessage("Kamida bitta so'z va uning tarjimasini to'ldiring.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const newDeck = await api.createDeck({
        title: title.trim(),
        description: description.trim() || undefined,
        level: level || "C1",
        cards: cardsToSubmit,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setBulkText("");
      setManualCards([
        { term_en: "", meaning_uz: "", synonyms: "", example_en: "" },
      ]);
      onDeckCreated(newDeck);
      onClose();
    } catch (err: any) {
      console.error("Deck creation error:", err);
      setErrorMessage(
        err.message || "To'plamni yaratishda xatolik yuz berdi. Qaytadan urinib ko'ring."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_60px_rgba(239,35,60,0.18)] p-6 sm:p-8 text-zinc-900 dark:text-white transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-white/5 border border-red-200 dark:border-white/10 flex items-center justify-center text-[#ef233c] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-manrope text-zinc-900 dark:text-white">Yangi To&apos;plam Yaratish</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-inter">
                IELTS &amp; CEFR so&apos;zlari to&apos;plamini qo&apos;shing va SRS bilan o&apos;rganing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/40 flex items-center gap-2.5 text-xs font-medium text-red-600 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Deck Title & Level Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                To&apos;plam Nomi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: IELTS Writing Task 2 Collocations"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:border-[#ef233c] outline-none text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 transition-all font-inter"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Daraja (Level)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 font-medium text-sm text-zinc-900 dark:text-white outline-none focus:border-[#ef233c]"
              >
                <option value="IELTS">IELTS Academic</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="C2">C2 (Proficiency)</option>
                <option value="B2">B2 (Upper-Intermediate)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Tavsif (Ixtiyoriy)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="To'plam haqida qisqacha ma'lumot..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-[#ef233c]"
            />
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-white/10 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold font-manrope border-b-2 transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "border-[#ef233c] text-[#ef233c]"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Ommaviy Matndan Kiritish (Tezkor)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold font-manrope border-b-2 transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "border-[#ef233c] text-[#ef233c]"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>Bittalab Qo&apos;shish</span>
            </button>
          </div>

          {/* Bulk Input Tab */}
          {activeTab === "bulk" ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-inter leading-relaxed">
                Har bir qatorga so&apos;z va uning tarjimasini tire (<code>-</code>) yoki ikki nuqta (<code>:</code>) bilan kiriting:
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={`ubiquitous - hamma joyda uchraydigan\nscrutinize - sinchiklab o'rganmoq\nmitigate - yumshatmoq, kamaytirmoq`}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 font-mono text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-[#ef233c] outline-none transition-all leading-relaxed"
              />
            </div>
          ) : (
            /* Manual Card Rows Tab */
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {manualCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      #{idx + 1} Karta
                    </span>
                    {manualCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveManualRow(idx)}
                        className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={card.term_en}
                      onChange={(e) =>
                        handleManualChange(idx, "term_en", e.target.value)
                      }
                      placeholder="Inglizcha so'z *"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-[#ef233c]"
                    />
                    <input
                      type="text"
                      value={card.meaning_uz}
                      onChange={(e) =>
                        handleManualChange(idx, "meaning_uz", e.target.value)
                      }
                      placeholder="O'zbekcha tarjima *"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white outline-none focus:border-[#ef233c]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={card.synonyms || ""}
                      onChange={(e) =>
                        handleManualChange(idx, "synonyms", e.target.value)
                      }
                      placeholder="Sinonimlar (ixtiyoriy)"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#ef233c]"
                    />
                    <input
                      type="text"
                      value={card.example_en || ""}
                      onChange={(e) =>
                        handleManualChange(idx, "example_en", e.target.value)
                      }
                      placeholder="IELTS namunaviy gap (ixtiyoriy)"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 outline-none focus:border-[#ef233c] italic"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddManualRow}
                className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-white/5 font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#ef233c]" />
                <span>Yana so&apos;z qo&apos;shish</span>
              </button>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm shadow-md flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Saqlanmoqda..." : "To'plamni Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
