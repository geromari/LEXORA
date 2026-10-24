import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateNextReview } from "@/lib/srs";
import { ensureLexoraDb } from "@/lib/ensureDb";

export async function POST(req: NextRequest) {
  try {
    await ensureLexoraDb();
    const user = await getSessionUser(req);
    const body = await req.json();
    const { card_id, correct, performance } = body;

    const cardId = parseInt(card_id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json(
        { detail: "Noto'g'ri card_id." },
        { status: 400 }
      );
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json(
        { detail: `Card #${cardId} topilmadi.` },
        { status: 404 }
      );
    }

    const isCorrect =
      typeof correct === "boolean"
        ? correct
        : performance === "good" || performance === "easy" || performance === 1 || performance === 2;

    const userId = user ? user.id : null;
    const now = new Date();

    let progress = await prisma.studyProgress.findFirst({
      where: {
        cardId: card.id,
        userId: userId,
      },
    });

    if (!progress) {
      progress = await prisma.studyProgress.create({
        data: {
          cardId: card.id,
          userId: userId,
          boxLevel: 0,
          nextReviewAt: now,
          correctStreak: 0,
          wrongCount: 0,
        },
      });
    }

    const srs = calculateNextReview(
      progress.boxLevel,
      progress.correctStreak,
      progress.wrongCount,
      isCorrect
    );

    const updatedProgress = await prisma.studyProgress.update({
      where: { id: progress.id },
      data: {
        boxLevel: srs.newBoxLevel,
        nextReviewAt: srs.nextReviewAt,
        correctStreak: srs.newStreak,
        wrongCount: srs.newWrongCount,
      },
    });

    // Foydalanuvchi streaki
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastDate = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
      if (lastDate) lastDate.setHours(0, 0, 0, 0);

      let newStreak = user.streakCount;
      if (!lastDate) {
        newStreak = 1;
      } else {
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: newStreak,
          lastActiveDate: new Date(),
        },
      });
    }

    let message = "";
    if (isCorrect) {
      if (srs.intervalHours >= 24) {
        const days = Math.floor(srs.intervalHours / 24);
        message = `Barakalla! So'z ${srs.newBoxLevel}-qutiga ko'tarildi. Keyingi takrorlash ${days} kundan keyin.`;
      } else {
        message = `To'g'ri javob! So'z ${srs.newBoxLevel}-qutiga ko'tarildi.`;
      }
    } else {
      message = "Qayta takrorlash kerak. So'z 0-qutiga qaytarildi.";
    }

    return NextResponse.json({
      card_id: card.id,
      new_box_level: updatedProgress.boxLevel,
      next_review_at: updatedProgress.nextReviewAt.toISOString(),
      correct_streak: updatedProgress.correctStreak,
      wrong_count: updatedProgress.wrongCount,
      interval_hours: srs.intervalHours,
      message,
    });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { detail: error.message || "Takrorlashni saqlashda xatolik." },
      { status: 500 }
    );
  }
}
