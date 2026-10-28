import prisma from "../prisma";

export async function getDailyReviewCount(userId: string): Promise<number> {
  const now = new Date();
  return prisma.studyProgress.count({
    where: {
      userId,
      nextReviewAt: { lte: now },
    },
  });
}

export function formatDailyReviewPrompt(dueCount: number): {
  text: string;
  hasDue: boolean;
} {
  if (dueCount > 0) {
    const text =
      `🗓 <b>Kunlik Spaced Repetition Takrorlash</b>\n\n` +
      `Bugun xotirangizdan unutilish arafasidagi <b>${dueCount} ta so'z</b> navbatda turibdi.\n\n` +
      `<i>Leitner xotira qoidasi: so'zlarni uzoq muddatli xotiraga muhrlash uchun ularni aynan vaqtida takrorlash shart.</i>\n\n` +
      `Mashg'ulotni boshlash uchun quyidagi tugmani bosing:`;
    return { text, hasDue: true };
  }

  const text =
    `🎉 <b>Bugungi barcha so'zlar o'z vaqtida takrorlandi!</b>\n\n` +
    `Sizda hozircha takrorlash navbatida turgan so'zlar yo'q. Spaced Repetition jadvali bo'yicha keyingi so'zlar vaqti kelganda eslatib turamiz.\n\n` +
    `💡 Yangi akademik so'zlar o'rganish uchun <b>Tezkor Quiz</b> topshirishingiz yoki botga yangi so'z yuborishingiz mumkin!`;

  return { text, hasDue: false };
}
