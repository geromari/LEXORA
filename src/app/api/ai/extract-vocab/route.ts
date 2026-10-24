import { NextRequest, NextResponse } from "next/server";

const FALLBACK_WORDS = [
  {
    term_en: "scrutinize",
    meaning_uz: "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
    synonyms: "examine closely, audit, inspect",
    example_en: "Regulatory authorities must scrutinize all financial disclosures.",
  },
  {
    term_en: "thrive",
    meaning_uz: "gullab-yashnamoq, ravnaq topmoq",
    synonyms: "flourish, prosper, burgeon",
    example_en: "Innovative startups thrive in supportive economic environments.",
  },
  {
    term_en: "foster",
    meaning_uz: "rivojlantirmoq, rag'batlantirmoq, parvarishlamoq",
    synonyms: "cultivate, encourage, nurture",
    example_en: "Collaborative seminars foster intellectual maturity among peers.",
  },
  {
    term_en: "exacerbate",
    meaning_uz: "kuchaytirib yubormoq, yomonlashtirmoq",
    synonyms: "aggravate, worsen, intensify",
    example_en: "Unchecked price inflation continues to exacerbate financial anxiety.",
  },
  {
    term_en: "resilient",
    meaning_uz: "bardoshli, chidamli, tez o'zini tiklaydigan",
    synonyms: "hardy, robust, adaptable",
    example_en: "Coastal agriculture requires resilient crop varieties.",
  },
  {
    term_en: "indispensable",
    meaning_uz: "ajralmas, juda zarur",
    synonyms: "vital, crucial, essential",
    example_en: "Critical thinking is indispensable in the modern digital age.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, target_level = "C1", max_words = 15 } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { detail: "Matn kiritilishi shart." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-")) {
      try {
        const prompt = `You are an elite IELTS Academic examiner and lexicographer.
Extract up to ${max_words} most valuable ${target_level} level academic vocabulary items or contextual phrases from the provided English text.
For each term, provide:
1. "term_en": strictly lowercase word or phrase as used academically.
2. "meaning_uz": precise, natural Uzbek academic translation.
3. "synonyms": 2-4 high-level synonyms separated by commas.
4. "example_en": an authentic, high-scoring IELTS style example sentence utilizing this term.

Input Text:
"""
${text.slice(0, 4000)}
"""

Return ONLY a valid JSON array of objects with keys: "term_en", "meaning_uz", "synonyms", "example_en". No markdown codeblocks, no extra explanation.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return NextResponse.json({
                success: true,
                count: parsed.length,
                words: parsed,
                source: "gemini_ai",
              });
            }
          }
        }
      } catch (aiErr) {
        console.warn("Gemini API call failed, falling back to heuristic:", aiErr);
      }
    }

    // Heuristic Fallback
    const lowerText = text.toLowerCase();
    const matched = FALLBACK_WORDS.filter((item) =>
      lowerText.includes(item.term_en)
    );

    const resultWords = matched.length > 0 ? matched : FALLBACK_WORDS.slice(0, 4);

    return NextResponse.json({
      success: true,
      count: resultWords.length,
      words: resultWords,
      source: "offline_heuristic",
    });
  } catch (error: any) {
    console.error("Extract vocab error:", error);
    return NextResponse.json(
      { detail: error.message || "So'zlarni ajratishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
