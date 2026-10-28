import prisma from "../prisma";
import { escapeHtml } from "./api";

export async function getHardWordsData(userId: string) {
  const records = await prisma.studyProgress.findMany({
    where: {
      userId,
      OR: [{ wrongCount: { gt: 0 } }, { boxLevel: 0 }],
    },
    include: { card: true },
    orderBy: [{ wrongCount: "desc" }, { boxLevel: "asc" }],
    take: 8,
  });

  return records;
}

export function formatHardWordsHtml(records: Awaited<ReturnType<typeof getHardWordsData>>): {
  text: string;
  hasWords: boolean;
} {
  if (!records.length) {
    const text =
      `🎉 <b>Sizda hozircha qiyin deb belgilangan so'zlar yo'q!</b>\n\n` +
      `Barcha so'zlarni a'lo darajada o'zlashtirmoqdasiz. Yangi akademik so'zlarni sinash uchun tezkor quizni boshlang!`;
    return { text, hasWords: false };
  }

  const lines = [
    `📌 <b>Qiyin so'zlarim (Eng ko'p xato qilinganlar):</b>\n`,
  ];

  records.forEach((prog, idx) => {
    const term = escapeHtml(prog.card.termEn);
    const meaning = escapeHtml(prog.card.meaningUz);
    lines.push(
      `${idx + 1}. 🇬🇧 <b>${term}</b> — ${meaning}\n` +
        `   ❌ Xatolar: <b>${prog.wrongCount} marta</b> | 📦 Leitner Box: <b>${prog.boxLevel}-bosqich</b>`
    );
  });

  lines.push(
    `\n💡 <i>Ushbu so'zlarni xotirada mustahkamlash uchun quyidagi <b>"Faqat qiyin so'zlardan test"</b> tugmasini bosing!</i>`
  );

  return { text: lines.join("\n"), hasWords: true };
}
