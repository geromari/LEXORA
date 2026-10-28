import prisma from "../prisma";
import { escapeHtml } from "./api";

export async function getUserStatsData(userId: string) {
  const now = new Date();

  // 1. Total cards in progress
  const totalCards = await prisma.studyProgress.count({
    where: { userId },
  });

  // 2. Mastered (Box 4 & 5)
  const masteredCount = await prisma.studyProgress.count({
    where: { userId, boxLevel: { gte: 4 } },
  });

  // 3. Learning (Box 1, 2, 3)
  const learningCount = await prisma.studyProgress.count({
    where: { userId, boxLevel: { in: [1, 2, 3] } },
  });

  // 4. Box 0 (Weak / New)
  const box0Count = await prisma.studyProgress.count({
    where: { userId, boxLevel: 0 },
  });

  // 5. Due for review today
  const dueCount = await prisma.studyProgress.count({
    where: { userId, nextReviewAt: { lte: now } },
  });

  // 6. Total decks
  const totalDecks = await prisma.deck.count({
    where: { userId },
  });

  // Accuracy calculation
  const accuracy =
    totalCards > 0
      ? Math.min(100, Math.round((masteredCount / totalCards) * 100))
      : 85;

  return {
    totalCards,
    masteredCount,
    learningCount,
    box0Count,
    dueCount,
    totalDecks,
    accuracy,
  };
}

export function formatUserStatsHtml(
  user: { username?: string | null; streakCount?: number },
  stats: Awaited<ReturnType<typeof getUserStatsData>>
): string {
  const name = escapeHtml(user.username || "Foydalanuvchi");

  return (
    `👤 <b>Mening Profilim: ${name}</b>\n` +
    `📊 <b>Spaced Repetition & Lug'at Statistikasi</b>\n\n` +
    `🔥 <b>Kunlik seriya:</b> ${user.streakCount || 0} kun uzluksiz\n` +
    `🎯 <b>O'zlashtirish darajasi:</b> ${stats.accuracy}%\n\n` +
    `📦 <b>Leitner Xotira Qutilari:</b>\n` +
    `• 🟢 <b>Mustahkamlangan (Box 4–5):</b> ${stats.masteredCount} ta so'z\n` +
    `• 🟡 <b>O'rganilmoqda (Box 1–3):</b> ${stats.learningCount} ta so'z\n` +
    `• 🔴 <b>Boshlang'ich/Qiyin (Box 0):</b> ${stats.box0Count} ta so'z\n\n` +
    `🔄 <b>Bugungi takrorlash navbati:</b> ${stats.dueCount} ta so'z\n` +
    `📚 <b>Jami aktiv so'zlar:</b> ${stats.totalCards} ta\n` +
    `📁 <b>Lug'at to'plamlari:</b> ${stats.totalDecks} ta\n\n` +
    `<i>Leitner Spaced Repetition algoritmi unutilish arafasidagi so'zlarni o'z vaqtida takrorlash navbatiga qo'yadi.</i>`
  );
}
