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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FAF8F5] border-[3px] border-[#121212] shadow-[8px_8px_0px_#121212] p-6 sm:p-8 text-[#121212]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCC00] border-2 border-[#121212] flex items-center justify-center shadow-[2px_2px_0px_#121212]">
              <Wand2 className="w-5 h-5 text-[#121212]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-[#121212]">Smart Text-to-Deck</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#FA5A2A] text-white border border-[#121212] uppercase shadow-[1px_1px_0px_#121212]">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-zinc-600 font-medium">
                Istalgan inglizcha maqola yoki mavzudan C1/IELTS so&apos;zlarni o&apos;zbekcha tarjimasi bilan ajratib oling
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

        {/* Input Phase: Paste Passage */}
        {extractedCards.length === 0 ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black text-[#121212] uppercase tracking-wider">
                IELTS Reading yoki mavzu matnini kiriting:
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassageText(SAMPLE_IELTS_PASSAGE)}
                  className="text-xs text-[#2563EB] hover:underline font-bold"
                >
                  Namunaviy IELTS Matni
                </button>
                <span className="text-zinc-400">•</span>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white border-2 border-[#121212] text-xs font-bold text-[#121212] shadow-[2px_2px_0px_#121212] outline-none"
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
              className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#121212] focus:shadow-[4px_4px_0px_#121212] outline-none text-xs sm:text-sm font-medium text-[#121212] placeholder-zinc-400 transition-all leading-relaxed resize-y"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border-2 border-[#121212] bg-white text-[#121212] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#121212] hover:bg-zinc-100 transition cursor-pointer"
              >
                Bekor Qilish
              </button>

              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting || passageText.trim().length < 10}
                className="px-6 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FA5A2A] hover:bg-[#E04719] text-white font-black text-xs sm:text-sm shadow-[2px_2px_0px_#121212] flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
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
            <div className="p-4 rounded-2xl bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-black text-zinc-600 uppercase tracking-wider">
                    Yangi To&apos;plam Nomi
                  </label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border-2 border-[#121212] text-xs sm:text-sm font-bold text-[#121212] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-zinc-600 uppercase tracking-wider">
                    Daraja
                  </label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border-2 border-[#121212] text-xs sm:text-sm font-bold text-[#121212] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Extracted Words Toolbar */}
            <div className="flex items-center justify-between text-xs text-zinc-600 px-1 font-bold">
              <span>
                Tanlangan:{" "}
                <strong className="text-[#121212]">
                  {selectedIndices.length} / {extractedCards.length}
                </strong>{" "}
                ta so&apos;z
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIndices(extractedCards.map((_, i) => i))}
                  className="text-[#2563EB] hover:underline"
                >
                  Barchasini tanlash
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setExtractedCards([])}
                  className="text-zinc-600 hover:text-[#121212]"
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
                    className={`p-3.5 rounded-2xl border-2 border-[#121212] transition-all ${
                      isSelected
                        ? "bg-white shadow-[2px_2px_0px_#121212]"
                        : "bg-[#F4EFEA] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(idx)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border-2 border-[#121212] transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#10B981] text-white"
                              : "bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className="text-xs font-black text-zinc-700">
                          #{idx + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCard(idx)}
                        className="text-zinc-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
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
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#121212] text-xs font-black text-[#121212] outline-none"
                      />
                      <input
                        type="text"
                        value={card.meaning_uz}
                        onChange={(e) => handleUpdateCard(idx, "meaning_uz", e.target.value)}
                        placeholder="O'zbekcha tarjima"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#121212] text-xs font-bold text-[#121212] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={card.synonyms || ""}
                        onChange={(e) => handleUpdateCard(idx, "synonyms", e.target.value)}
                        placeholder="Sinonimlar"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#121212]/30 text-[11px] text-zinc-600 outline-none"
                      />
                      <input
                        type="text"
                        value={card.example_en || ""}
                        onChange={(e) => handleUpdateCard(idx, "example_en", e.target.value)}
                        placeholder="Namunaviy gap"
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#121212]/30 text-[11px] text-zinc-600 outline-none italic"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t-2 border-[#121212]/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExtractedCards([])}
                className="px-5 py-2.5 rounded-xl border-2 border-[#121212] bg-white text-[#121212] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#121212] hover:bg-zinc-100 transition cursor-pointer"
              >
                Orqaga
              </button>

              <button
                type="button"
                onClick={handleSaveDeck}
                disabled={selectedIndices.length === 0 || isSaving}
                className="px-6 py-2.5 rounded-xl border-2 border-[#121212] bg-[#FFCC00] hover:bg-[#F0C000] text-[#121212] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#121212] flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>To&apos;plam Sifatida Saqlash ({selectedIndices.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
