import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureLexoraDb } from "@/lib/ensureDb";

export async function GET(req: NextRequest) {
  try {
    await ensureLexoraDb();
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { detail: "Avtorizatsiyadan o'tilmagan." },
        { status: 401 }
      );
    }

    const now = new Date();

    const [totalDecks, totalLearned, totalDue] = await Promise.all([
      prisma.deck.count({
        where: { userId: user.id },
      }),
      prisma.studyProgress.count({
        where: {
          userId: user.id,
          boxLevel: { gte: 3 },
        },
      }),
      prisma.studyProgress.count({
        where: {
          userId: user.id,
          nextReviewAt: { lte: now },
        },
      }),
    ]);

    return NextResponse.json({
      ...user,
      total_decks: totalDecks,
      total_learned_words: totalLearned,
      total_due_words: totalDue,
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { detail: error.message || "Foydalanuvchi ma'lumotlarini olishda xatolik." },
      { status: 500 }
    );
  }
}
