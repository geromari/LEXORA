"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Trash2, 
  BookOpen, 
  Wand2, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { api, ExtractedCardItem, DeckDetail } from "@/lib/api";

interface AISmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (newDeck: DeckDetail) => void;
  initialText?: string;
}

const SAMPLE_IELTS_PASSAGE = `The emergence of modern mega-corporations has sparked widespread debates regarding whether aggressive profit maximization overlooks the symbiotic relationship between corporate prosperity and communal cohesion. While technology behemoths often establish sprawling campuses equipped with lavish amenities to foster recruitment, critics argue that such gestures are mere window dressing designed to obscure exploitative labor practices. When corporate philanthropy blurs with strategic public relations, regulators must rigorously scrutinize corporate overreach to mitigate societal polarization. Without active civic pushback, institutions risk exacerbating social fragmentation rather than nurturing inclusive prosperity.`;

export function AISmartImportModal({
  isOpen,
  onClose,
  onDeckCreated,
  initialText = "",
}: AISmartImportModalProps) {
  const [passageText, setPassageText] = useState(initialText);
  const [level, setLevel] = useState("C1");
  const [extractedCards, setExtractedCards] = useState<ExtractedCardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialText) {
      setPassageText(initialText);
    }
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  // Handle AI Extraction
  const handleExtract = async () => {
    if (!passageText.trim() || passageText.trim().length < 10) {
      setErrorMessage("Iltimos, kamida 10 ta belgidan iborat inglizcha matn yoki so'z kiriting.");
      return;
    }

    try {
      setIsExtracting(true);
      setErrorMessage(null);
      const res = await api.extractVocab({
        text: passageText.trim(),
        level: level,
        count: 15,
      });

      if (!res.cards || res.cards.length === 0) {
        throw new Error("Kiritilgan matndan yangi akademik so'zlar aniqlanmadi.");
      }

      setExtractedCards(res.cards);
      setSelectedIndices(res.cards.map((_, idx) => idx));
      setDeckTitle(res.source_info ? `AI: ${res.source_info.slice(0, 30)}` : `AI Reading: ${passageText.slice(0, 24)}...`);
      setDeckDescription(`AI tahlili: ${res.cards.length} ta ${level} akademik so'z`);
    } catch (err: any) {
      console.error("AI extraction error:", err);
      setErrorMessage(err.message || "AI tahlilida xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleSelect = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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
      setErrorMessage("To'plam yaratish uchun kamida bitta so'z tanlang.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const newDeck = await api.createDeck({
        title: deckTitle.trim() || "Yangi AI To'plami",
        description: deckDescription.trim(),
        level: level,
        is_public: false,
        cards: cardsToSave.map((c) => ({
          term_en: c.term_en.trim(),
          meaning_uz: c.meaning_uz.trim(),
          synonyms: c.synonyms || undefined,
          example_en: c.example_en || undefined,
        })),
      });

      onDeckCreated(newDeck);
      onClose();
    } catch (err: any) {
      console.error("Save deck error:", err);
      setErrorMessage(err.message || "To'plamni saqlashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-white/10 shadow-[0_0_60px_rgba(239,35,60,0.18)] p-6 sm:p-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ef233c] shadow-[0_0_12px_rgba(239,35,60,0.4)]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-manrope text-white">Smart Text-to-Deck</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ef233c]/20 text-[#ef233c] border border-[#ef233c]/30 uppercase font-mono">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-inter">
                Istalgan inglizcha maqola yoki mavzudan C1/IELTS so&apos;zlarni o&apos;zbekcha tarjimasi bilan ajratib oling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 flex items-center gap-2.5 text-xs font-medium text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Phase: Paste Passage */}
        {extractedCards.length === 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                IELTS Reading yoki mavzu matnini kiriting:
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassageText(SAMPLE_IELTS_PASSAGE)}
                  className="text-xs text-[#ef233c] hover:underline font-semibold"
                >
                  Namunaviy IELTS Matni
                </button>
                <span className="text-zinc-600">•</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs font-medium text-white outline-none focus:border-[#ef233c]"
                >
                  <option value="C1">C1 (Advanced)</option>
                  <option value="C2">C2 (Proficiency)</option>
                  <option value="B2">B2 (Vantage)</option>
                  <option value="IELTS">IELTS Academic</option>
                </select>
              </div>
            </div>

            <textarea
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              rows={8}
              placeholder="Inglizcha matn yoki so'zlarni shu yerga yozing..."
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-[#ef233c] outline-none text-xs sm:text-sm font-inter text-white placeholder:text-zinc-500 transition-all leading-relaxed resize-y"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Bekor Qilish
              </button>

              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || passageText.trim().length < 10}
                className="px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm shadow-[0_0_20px_rgba(239,35,60,0.4)] flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isExtracting ? "Tahlil qilinmoqda..." : "AI Bilan Tahlil Qilish"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Preview Phase: Editable Extracted Cards & Deck Creation */
          <div className="mt-6 space-y-5">
            {/* Deck Metadata Config */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Yangi To&apos;plam Nomi
                  </label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-semibold text-white outline-none focus:border-[#ef233c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    Daraja
                  </label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm font-semibold text-white outline-none focus:border-[#ef233c]"
                  />
                </div>
              </div>
            </div>

            {/* Extracted Words Toolbar */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-medium">
              <span>
                Tanlangan:{" "}
                <strong className="text-white font-bold">
                  {selectedIndices.length} / {extractedCards.length}
                </strong>{" "}
                ta so&apos;z
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIndices(extractedCards.map((_, i) => i))}
                  className="text-[#ef233c] hover:underline font-semibold"
                >
                  Barchasini tanlash
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setExtractedCards([])}
                  className="text-zinc-400 hover:text-white"
                >
                  Matnni qayta kiritish
                </button>
              </div>
            </div>

            {/* Editable Words List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {extractedCards.map((card, idx) => {
                const isSelected = selectedIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-zinc-900/60 border-white/20 shadow-md"
                        : "bg-black/40 border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(idx)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#ef233c] border-[#ef233c] text-white"
                              : "bg-white/5 border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className="text-xs font-mono text-zinc-400">
                          #{idx + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCard(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={card.term_en}
                        onChange={(e) => handleUpdateCard(idx, "term_en", e.target.value)}
                        placeholder="Inglizcha so'z"
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-white outline-none focus:border-[#ef233c]"
                      />
                      <input
                        type="text"
                        value={card.meaning_uz}
                        onChange={(e) => handleUpdateCard(idx, "meaning_uz", e.target.value)}
                        placeholder="O'zbekcha tarjima"
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-medium text-white outline-none focus:border-[#ef233c]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={card.synonyms || ""}
                        onChange={(e) => handleUpdateCard(idx, "synonyms", e.target.value)}
                        placeholder="Sinonimlar"
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] text-zinc-400 outline-none focus:border-[#ef233c]"
                      />
                      <input
                        type="text"
                        value={card.example_en || ""}
                        onChange={(e) => handleUpdateCard(idx, "example_en", e.target.value)}
                        placeholder="Namunaviy gap"
                        className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-[11px] text-zinc-400 outline-none focus:border-[#ef233c] italic"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExtractedCards([])}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Orqaga
              </button>

              <button
                type="button"
                onClick={handleSaveDeck}
                disabled={selectedIndices.length === 0 || isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#ef233c] hover:bg-red-700 text-white font-bold font-manrope text-xs sm:text-sm shadow-[0_0_20px_rgba(239,35,60,0.4)] flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>To&apos;plam Sifatida Saqlash ({selectedIndices.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
