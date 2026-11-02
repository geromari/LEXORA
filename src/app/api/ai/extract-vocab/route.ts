import { NextRequest, NextResponse } from "next/server";

// Fallback academic vocabulary dataset for resilient offline operation
const FALLBACK_WORDS = [
  {
    term_en: "scrutinize",
    meaning_uz: "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
    synonyms: "examine closely, audit, inspect",
    example_en: "Regulatory authorities must scrutinize all financial disclosures.",
    level: "C1",
  },
  {
    term_en: "thrive",
    meaning_uz: "gullab-yashnamoq, ravnaq topmoq",
    synonyms: "flourish, prosper, burgeon",
    example_en: "Innovative startups thrive in supportive economic environments.",
    level: "B2",
  },
  {
    term_en: "foster",
    meaning_uz: "rivojlantirmoq, rag'batlantirmoq, parvarishlamoq",
    synonyms: "cultivate, encourage, nurture",
    example_en: "Collaborative seminars foster intellectual maturity among peers.",
    level: "B2",
  },
  {
    term_en: "exacerbate",
    meaning_uz: "kuchaytirib yubormoq, yomonlashtirmoq",
    synonyms: "aggravate, worsen, intensify",
    example_en: "Unchecked price inflation continues to exacerbate financial anxiety.",
    level: "C1",
  },
  {
    term_en: "resilient",
    meaning_uz: "bardoshli, chidamli, tez o'zini tiklaydigan",
    synonyms: "hardy, robust, adaptable",
    example_en: "Coastal agriculture requires resilient crop varieties.",
    level: "B2",
  },
  {
    term_en: "indispensable",
    meaning_uz: "ajralmas, juda zarur",
    synonyms: "vital, crucial, essential",
    example_en: "Critical thinking is indispensable in the modern digital age.",
    level: "C1",
  },
  {
    term_en: "colossal",
    meaning_uz: "ulkan, behad katta",
    synonyms: "immense, gargantuan, massive",
    example_en: "The project faced colossal logistical challenges from the outset.",
    level: "C1",
  },
  {
    term_en: "democratize",
    meaning_uz: "hamma uchun ochiq va teng qilmoq",
    synonyms: "equalize, popularize, make accessible",
    example_en: "Digital technology has helped democratize access to education.",
    level: "C1",
  },
  {
    term_en: "cacophony",
    meaning_uz: "quloqni teshuvchi g'ala-g'ovur, shovqin-suron",
    synonyms: "din, dissonance, clamor",
    example_en: "A cacophony of car horns broke the morning silence.",
    level: "C2",
  },
];

const REFUSAL_MESSAGE =
  "Kechirasiz, Lexora AI faqat ingliz tili lug'atlarini ajratish, tarjima qilish va so'zlarni o'rganish uchun mo'ljallangan. Boshqa mavzulardagi so'rovlar qabul qilinmaydi.";

// Pre-validation to reject blatantly off-topic prompts before calling external AI
function isOffTopicRequest(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase().trim();

  // If text is very long (passage or essay), let AI analyze it
  if (lower.length > 300) return false;

  // Obvious non-vocabulary questions and commands
  const offTopicPatterns = [
    /\b(kod|code|script|python|javascript|html|css|sql|function|def\s|class\s|import\s)\b/i,
    /\b(ob[- ]havo|weather|forecast)\b/i,
    /\b(retsept|recipe|ovqat|cooking|cake|pizza)\b/i,
    /\b(kim\s+(yutdi|prezident|bosh\s+vazir)|who\s+won|president)\b/i,
    /\b(tarix(i|da)?\s+haqida|tell\s+me\s+about\s+history)\b/i,
    /\b(matematika|tenglama|hisobla|calculate|\d+\s*[\+\-\*\/]\s*\d+)/i,
    /\b(sen\s+kimsan|who\s+are\s+you|what\s+is\s+your\s+name)\b/i,
    /\b(latifa|anekdot|joke|hazil)\b/i,
    /\b(she'r|poem|story\s+about)\b/i,
    /\b(ignore\s+(all\s+)?previous\s+instructions)\b/i,
  ];

  for (const pat of offTopicPatterns) {
    if (pat.test(lower)) {
      // Check if it's NOT just an English sentence using the word
      // e.g. "The weather was mild" is an example, but "ob-havo qanday" is off-topic
      if (
        lower.includes("yoz") ||
        lower.includes("qil") ||
        lower.includes("ber") ||
        lower.includes("how") ||
        lower.includes("what is") ||
        lower.includes("tell me") ||
        lower.includes("solve") ||
        lower.includes("write")
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text = "",
      file_base64,
      file_type,
      file_name,
      target_level = "C1",
      max_words = 15,
      mode = "extract", // "extract" | "enrich"
    } = body;

    const trimmedText = typeof text === "string" ? text.trim() : "";

    // 1. Check if user provided neither text nor file
    if (!trimmedText && !file_base64) {
      return NextResponse.json(
        { detail: "Matn yoki fayl kiritilishi shart." },
        { status: 400 }
      );
    }

    // 2. Strict guardrail: Pre-check text for off-topic requests
    if (trimmedText && isOffTopicRequest(trimmedText)) {
      return NextResponse.json(
        {
          success: false,
          error: REFUSAL_MESSAGE,
          detail: REFUSAL_MESSAGE,
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-")) {
      try {
        // Construct strict guardrailed prompt
        const prompt = `You are Lexora AI, an elite IELTS/CEFR Academic Lexicographer.
STRICT SCOPE CONSTRAINT:
You ONLY extract and format English vocabulary, Uzbek definitions, advanced synonyms, and authentic IELTS-style academic example sentences for vocabulary learners.

STRICT REFUSAL POLICY:
If the user's input asks general questions, programming/coding instructions, math problems, recipes, jokes, casual chit-chat, politics, personal advice, or ANY task unrelated to English vocabulary:
YOU MUST REFUSE TO ANSWER.
Return ONLY this JSON object:
{"error": "${REFUSAL_MESSAGE}"}

ALLOWED TASK:
Extract up to ${max_words} most valuable ${target_level} level English academic vocabulary words, phrasal verbs, or idiomatic collocations from the provided text or document/image.
For each term, provide:
1. "term_en": lowercase English word or phrase.
2. "meaning_uz": precise, natural Uzbek academic translation.
3. "synonyms": 2 to 4 comma-separated synonyms.
4. "example_en": an authentic, high-scoring IELTS academic example sentence.
5. "level": CEFR level (e.g. "B2", "C1", or "C2").

Input Text (if any):
"""
${trimmedText.slice(0, 5000)}
"""

Return ONLY a valid JSON array of objects:
[
  {
    "term_en": "word",
    "meaning_uz": "ma'nosi",
    "synonyms": "synonym1, synonym2",
    "example_en": "Example sentence using the word.",
    "level": "${target_level}"
  }
]`;

        // Build parts for multimodal or text
        const parts: any[] = [{ text: prompt }];

        if (file_base64 && file_type) {
          // Clean base64 data if it contains data URI prefix
          const cleanBase64 = file_base64.replace(/^data:[^;]+;base64,/, "");
          parts.push({
            inlineData: {
              mimeType: file_type,
              data: cleanBase64,
            },
          });
        }

        const modelName = "gemini-3.5-flash-lite";

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (rawText) {
            const parsed = JSON.parse(rawText);

            // Check if the AI returned a refusal error
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.error) {
              return NextResponse.json(
                {
                  success: false,
                  error: parsed.error || REFUSAL_MESSAGE,
                  detail: parsed.error || REFUSAL_MESSAGE,
                },
                { status: 400 }
              );
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
              const formattedCards = parsed.map((item) => ({
                term_en: String(item.term_en || "").trim().toLowerCase(),
                meaning_uz: String(item.meaning_uz || "").trim(),
                synonyms: String(item.synonyms || "").trim(),
                example_en: String(item.example_en || "").trim(),
                level: String(item.level || target_level).trim(),
              }));

              const sourceInfo = file_name
                ? `Fayl: ${file_name}`
                : trimmedText
                ? trimmedText.slice(0, 40) + "..."
                : "Multimodal AI Tahlili";

              return NextResponse.json({
                success: true,
                count: formattedCards.length,
                total_extracted: formattedCards.length,
                words: formattedCards,
                cards: formattedCards,
                source_info: sourceInfo,
                source: "gemini_ai",
              });
            }
          }
        } else {
          const errData = await res.text();
          console.warn("Gemini API non-200 response:", res.status, errData);
        }
      } catch (aiErr) {
        console.warn("Gemini API call failed, attempting fallback:", aiErr);
      }
    }

    // Heuristic Fallback if AI key is absent or network fails
    const lowerText = trimmedText.toLowerCase();
    const matched = FALLBACK_WORDS.filter((item) =>
      lowerText.includes(item.term_en)
    );

    const resultWords = matched.length > 0 ? matched : FALLBACK_WORDS.slice(0, 6);

    return NextResponse.json({
      success: true,
      count: resultWords.length,
      total_extracted: resultWords.length,
      words: resultWords,
      cards: resultWords,
      source_info: trimmedText ? trimmedText.slice(0, 35) + "..." : "Lug'at to'plami",
      source: "offline_heuristic",
    });
  } catch (error: any) {
    console.error("Extract vocab route error:", error);
    return NextResponse.json(
      { detail: error.message || "So'zlarni ajratishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
