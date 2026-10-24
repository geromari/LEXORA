import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const now = new Date();

    const accessibleDecks = await prisma.deck.findMany({
      where: user
        ? {
            OR: [{ isPublic: true }, { userId: user.id }],
          }
        : { isPublic: true },
      select: { id: true },
    });

    const deckIds = accessibleDecks.map((d) => d.id);
    if (deckIds.length === 0) {
      return NextResponse.json({
        total_due: 0,
        total_hardest: 0,
        due_cards: [],
        hardest_cards: [],
      });
    }

    const cards = await prisma.card.findMany({
      where: { deckId: { in: deckIds } },
    });

    const progressRecords = await prisma.studyProgress.findMany({
      where: {
        cardId: { in: cards.map((c) => c.id) },
        userId: user ? user.id : null,
      },
    });

    const progressMap = new Map<number, (typeof progressRecords)[0]>();
    for (const p of progressRecords) {
      progressMap.set(p.cardId, p);
    }

    const dueCards = [];
    const hardestCards = [];

    for (const card of cards) {
      const prog = progressMap.get(card.id);
      const formattedCard = {
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

      if (!prog || new Date(prog.nextReviewAt) <= now) {
        dueCards.push(formattedCard);
      }

      if (prog && prog.wrongCount > 0) {
        hardestCards.push(formattedCard);
      }
    }

    hardestCards.sort(
      (a, b) => (b.progress?.wrong_count || 0) - (a.progress?.wrong_count || 0)
    );

    return NextResponse.json({
      total_due: dueCards.length,
      total_hardest: hardestCards.length,
      due_cards: dueCards.slice(0, 50),
      hardest_cards: hardestCards.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Get due cards error:", error);
    return NextResponse.json(
      { detail: error.message || "Takrorlash ro'yxatini olishda xatolik." },
      { status: 500 }
    );
  }
}
