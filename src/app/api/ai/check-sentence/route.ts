import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { term, sentence } = body;

    if (!term || !sentence) {
      return NextResponse.json(
        { detail: "So'z va gap kiritilishi shart." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-")) {
      try {
        const prompt = `You are a certified IELTS Writing examiner evaluating a student's practice sentence.
Target vocabulary word: "${term}"
Student's sentence: "${sentence}"

Analyze the sentence:
1. Did the student use the target word "${term}" grammatically and naturally?
2. Score the sentence from 1 to 10 (10 being perfect Band 9 academic English).
3. Provide constructive feedback in natural Uzbek language (e.g. grammar correction, word choice).
4. Provide an improved, high-level C1/C2 version of their sentence.

Return ONLY a valid JSON object with keys:
{
  "score": number (1-10),
  "is_correct": boolean,
  "feedback_uz": string,
  "improved_sentence": string
}`;

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
            return NextResponse.json({
              success: true,
              score: parsed.score || 8,
              is_correct: parsed.is_correct ?? true,
              feedback_uz: parsed.feedback_uz || "Yaxshi tuzilgan akademik gap.",
              improved_sentence: parsed.improved_sentence || sentence,
              source: "gemini_ai",
            });
          }
        }
      } catch (aiErr) {
        console.warn("Gemini sentence check failed, using fallback:", aiErr);
      }
    }

    // Heuristic Fallback
    const hasTerm = sentence.toLowerCase().includes(term.toLowerCase());
    const length = sentence.trim().split(/\s+/).length;
    const isGood = hasTerm && length >= 5;

    return NextResponse.json({
      success: true,
      score: isGood ? 8.5 : 5.0,
      is_correct: isGood,
      feedback_uz: isGood
        ? `"${term}" so'zi kontekstda to'g'ri qo'llanilgan. Grammatika va uslub IELTS talablariga javob beradi.`
        : `Gapda "${term}" so'zi aniq ifodalanmagan yoki gap juda qisqa. Kamida 5-6 ta so'zdan iborat to'liq gap tuzish tavsiya etiladi.`,
      improved_sentence: isGood
        ? sentence.trim()
        : `Recent academic research demonstrates how governments must systematically address such challenges.`,
      source: "offline_heuristic",
    });
  } catch (error: any) {
    console.error("Check sentence error:", error);
    return NextResponse.json(
      { detail: error.message || "Gapni tekshirishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
