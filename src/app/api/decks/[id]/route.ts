import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ensureLexoraDb } from "@/lib/ensureDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureLexoraDb();
    const { id } = await params;
    const deckId = parseInt(id, 10);

    if (isNaN(deckId)) {
      return NextResponse.json(
        { detail: "Noto'g'ri to'plam identifikatori." },
        { status: 400 }
      );
    }

    const user = await getSessionUser(req);
    const now = new Date();

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!deck) {
      return NextResponse.json(
        { detail: "To'plam topilmadi." },
        { status: 404 }
      );
    }

    // Foydalanuvchi progresslarini olish
    const cardIds = deck.cards.map((c) => c.id);
    const progressList = cardIds.length > 0
      ? await prisma.studyProgress.findMany({
          where: {
            cardId: { in: cardIds },
            userId: user ? user.id : null,
          },
        })
      : [];

    const progressMap = new Map<number, (typeof progressList)[0]>();
    for (const p of progressList) {
      progressMap.set(p.cardId, p);
    }

    let totalBoxPoints = 0;
    let dueCount = 0;
    let learnedCount = 0;

    const formattedCards = deck.cards.map((card) => {
      const prog = progressMap.get(card.id);
      if (prog) {
        totalBoxPoints += prog.boxLevel;
        if (prog.boxLevel >= 3) learnedCount++;
        if (new Date(prog.nextReviewAt) <= now) dueCount++;
      } else {
        dueCount++;
      }

      return {
        id: card.id,
        deck_id: card.deckId,
        term_en: card.termEn,
        meaning_uz: card.meaningUz,
        synonyms: card.synonyms,
        example_en: card.exampleEn,
        progress: prog
          ? {
              id: prog.id,
              card_id: prog.cardId,
              box_level: prog.boxLevel,
              next_review_at: prog.nextReviewAt.toISOString(),
              correct_streak: prog.correctStreak,
              wrong_count: prog.wrongCount,
            }
          : {
              id: 0,
              card_id: card.id,
              box_level: 0,
              next_review_at: now.toISOString(),
              correct_streak: 0,
              wrong_count: 0,
            },
      };
    });

    const totalCards = deck.cards.length;
    const masteryPercentage = totalCards > 0
      ? Math.round((totalBoxPoints / (totalCards * 5)) * 1000) / 10
      : 0.0;

    return NextResponse.json({
      id: deck.id,
      user_id: deck.userId,
      title: deck.title,
      description: deck.description || "",
      level: deck.level,
      is_public: deck.isPublic,
      created_at: deck.createdAt.toISOString(),
      card_count: totalCards,
      mastery_percentage: masteryPercentage,
      due_count: dueCount,
      learned_count: learnedCount,
      is_owner: user ? deck.userId === user.id : false,
      cards: formattedCards,
    });
  } catch (error: any) {
    console.error("Get deck detail error:", error);
    return NextResponse.json(
      { detail: error.message || "To'plamni olishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deckId = parseInt(id, 10);
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json(
        { detail: "Avtorizatsiyadan o'tilmagan." },
        { status: 401 }
      );
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json(
        { detail: "To'plam topilmadi." },
        { status: 404 }
      );
    }

    if (deck.userId !== user.id) {
      return NextResponse.json(
        { detail: "Siz faqat o'zingiz yaratgan to'plamlarni o'chira olasiz." },
        { status: 403 }
      );
    }

    await prisma.deck.delete({
      where: { id: deckId },
    });

    return NextResponse.json({ success: true, message: "To'plam o'chirildi." });
  } catch (error: any) {
    console.error("Delete deck error:", error);
    return NextResponse.json(
      { detail: error.message || "To'plamni o'chirishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
