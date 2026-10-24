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
          "Kamida bitta to'g'ri formatdagi so'z kiriting (Masalan: scrutinize - sinchiklab o'rganmoq)."
        );
        return;
      }
    } else {
      cardsToSubmit = manualCards.filter(
        (c) => c.term_en.trim() && c.meaning_uz.trim()
      );
      if (cardsToSubmit.length === 0) {
        setErrorMessage(
          "Kamida bitta so'z va uning tarjimasini to'liq kiriting."
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const newDeck = await api.createDeck({
        title: title.trim(),
        description: description.trim() || undefined,
        level: level.trim() || "C1",
        is_public: false,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] border-[3px] border-[#121212] shadow-[8px_8px_0px_#121212] p-6 sm:p-8 text-[#121212]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center shadow-[2px_2px_0px_#121212]">
              <Sparkles className="w-5 h-5 text-[#121212]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#121212]">Yangi To&apos;plam Yaratish</h3>
              <p className="text-xs text-zinc-600 font-medium">
                IELTS & CEFR so&apos;zlari to&apos;plamini qo&apos;shing va SRS bilan o&apos;rganing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border-2 border-[#121212] bg-white text-[#121212] hover:bg-zinc-100 shadow-[2px_2px_0px_#121212] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-500 flex items-center gap-2.5 text-xs font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Deck Title & Level Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-[#121212] uppercase tracking-wider">
                To&apos;plam Nomi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: IELTS Writing Task 2 Collocations"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#121212] focus:shadow-[3px_3px_0px_#121212] outline-none text-sm font-bold text-[#121212] placeholder-zinc-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#121212] uppercase tracking-wider">
                Daraja (Level)
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#121212] font-bold text-sm text-[#121212] shadow-[2px_2px_0px_#121212] outline-none"
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
            <label className="text-xs font-black text-[#121212] uppercase tracking-wider">
              Tavsif (Ixtiyoriy)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="To'plam haqida qisqacha ma'lumot..."
              className="w-full px-4 py-2 rounded-xl bg-white border-2 border-[#121212] text-sm text-[#121212] placeholder-zinc-400 outline-none"
            />
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b-2 border-[#121212]/15 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
                activeTab === "bulk"
                  ? "border-[#FA5A2A] text-[#FA5A2A]"
                  : "border-transparent text-zinc-500 hover:text-[#121212]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Ommaviy Matndan Kiritish (Tezkor)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-black border-b-2 transition-all cursor-pointer ${
                activeTab === "manual"
                  ? "border-[#FA5A2A] text-[#FA5A2A]"
                  : "border-transparent text-zinc-500 hover:text-[#121212]"
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>Bittalab Qo&apos;shish</span>
            </button>
          </div>

          {/* Bulk Input Tab */}
          {activeTab === "bulk" ? (
            <div className="space-y-2">
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Har bir qatorga so&apos;z va uning tarjimasini tire (<code>-</code>) yoki ikki nuqta (<code>:</code>) bilan kiriting:
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={`ubiquitous - hamma joyda uchraydigan\nscrutinize - sinchiklab o'rganmoq\nmitigate - yumshatmoq, kamaytirmoq`}
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#121212] font-mono text-xs sm:text-sm text-[#121212] placeholder-zinc-400 focus:shadow-[3px_3px_0px_#121212] outline-none transition-all leading-relaxed"
              />
            </div>
          ) : (
            /* Manual Card Rows Tab */
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {manualCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-600">
                      #{idx + 1} Karta
                    </span>
                    {manualCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveManualRow(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
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
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#121212] text-xs font-black text-[#121212] outline-none"
                    />
                    <input
                      type="text"
                      value={card.meaning_uz}
                      onChange={(e) =>
                        handleManualChange(idx, "meaning_uz", e.target.value)
                      }
                      placeholder="O'zbekcha tarjima *"
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#121212] text-xs font-bold text-[#121212] outline-none"
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
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#121212]/30 text-xs text-zinc-600 outline-none"
                    />
                    <input
                      type="text"
                      value={card.example_en || ""}
                      onChange={(e) =>
                        handleManualChange(idx, "example_en", e.target.value)
                      }
                      placeholder="IELTS namunaviy gap (ixtiyoriy)"
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#121212]/30 text-xs text-zinc-600 outline-none italic"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddManualRow}
                className="w-full py-2 rounded-xl border-2 border-dashed border-[#121212] bg-white font-bold text-xs text-[#121212] hover:bg-[#F4EFEA] flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Yana so&apos;z qo&apos;shish</span>
              </button>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t-2 border-[#121212]/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border-2 border-[#121212] bg-white text-[#121212] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#121212] hover:bg-zinc-100 transition cursor-pointer"
            >
              Bekor Qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FFCC00] hover:bg-[#F0C000] text-[#121212] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#121212] flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? "Saqlanmoqda..." : "To'plamni Saqlash"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
