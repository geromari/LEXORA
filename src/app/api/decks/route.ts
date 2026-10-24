import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const now = new Date();

    const decks = await prisma.deck.findMany({
      where: user
        ? {
            OR: [{ isPublic: true }, { userId: user.id }],
          }
        : { isPublic: true },
      include: {
        cards: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const allCardIds = decks.flatMap((d) => d.cards.map((c) => c.id));

    // Foydalanuvchining (yoki tizim default) progresslarini olish
    const progressRecords = allCardIds.length > 0
      ? await prisma.studyProgress.findMany({
          where: {
            cardId: { in: allCardIds },
            userId: user ? user.id : null,
          },
        })
      : [];

    const progressMap = new Map<number, (typeof progressRecords)[0]>();
    for (const p of progressRecords) {
      progressMap.set(p.cardId, p);
    }

    const response = decks.map((deck) => {
      const totalCards = deck.cards.length;
      let totalBoxPoints = 0;
      let dueCount = 0;
      let learnedCount = 0;

      if (totalCards > 0) {
        for (const card of deck.cards) {
          const prog = progressMap.get(card.id);
          if (prog) {
            totalBoxPoints += prog.boxLevel;
            if (prog.boxLevel >= 3) learnedCount++;
            if (new Date(prog.nextReviewAt) <= now) dueCount++;
          } else {
            dueCount++; // Hali o'rganilmagan (Box 0)
          }
        }
      }

      const masteryPercentage = totalCards > 0
        ? Math.round((totalBoxPoints / (totalCards * 5)) * 1000) / 10
        : 0.0;

      return {
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
      };
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("List decks error:", error);
    return NextResponse.json(
      { detail: error.message || "To'plamlarni olishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    const body = await req.json();
    const { title, description, level = "C1", is_public = true, cards = [] } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { detail: "To'plam nomi kiritilishi shart." },
        { status: 400 }
      );
    }

    const now = new Date();

    const deck = await prisma.deck.create({
      data: {
        userId: user ? user.id : null,
        title: title.trim(),
        description: description?.trim() || "",
        level: level.trim(),
        isPublic: Boolean(is_public),
      },
    });

    const createdCards = [];
    for (const c of cards) {
      if (!c.term_en || !c.meaning_uz) continue;

      const card = await prisma.card.create({
        data: {
          deckId: deck.id,
          termEn: c.term_en.trim(),
          meaningUz: c.meaning_uz.trim(),
          synonyms: c.synonyms?.trim() || null,
          exampleEn: c.example_en?.trim() || null,
        },
      });

      // StudyProgress yaratish
      const prog = await prisma.studyProgress.create({
        data: {
          cardId: card.id,
          userId: user ? user.id : null,
          boxLevel: 0,
          nextReviewAt: now,
          correctStreak: 0,
          wrongCount: 0,
        },
      });

      createdCards.push({
        id: card.id,
        deck_id: card.deckId,
        term_en: card.termEn,
        meaning_uz: card.meaningUz,
        synonyms: card.synonyms,
        example_en: card.exampleEn,
        progress: {
          id: prog.id,
          card_id: prog.cardId,
          box_level: prog.boxLevel,
          next_review_at: prog.nextReviewAt.toISOString(),
          correct_streak: prog.correctStreak,
          wrong_count: prog.wrongCount,
        },
      });
    }

    return NextResponse.json(
      {
        id: deck.id,
        user_id: deck.userId,
        title: deck.title,
        description: deck.description,
        level: deck.level,
        is_public: deck.isPublic,
        created_at: deck.createdAt.toISOString(),
        card_count: createdCards.length,
        mastery_percentage: 0.0,
        due_count: createdCards.length,
        learned_count: 0,
        cards: createdCards,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create deck error:", error);
    return NextResponse.json(
      { detail: error.message || "To'plam yaratishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
