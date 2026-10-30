import prisma from "../prisma";
import { escapeHtml } from "./api";

export interface DeckSummary {
  id: number;
  userId: string | null;
  title: string;
  description: string | null;
  level: string;
  isPublic: boolean;
  cardCount: number;
  isOwner: boolean;
}

export interface DeckDetail {
  id: number;
  userId: string | null;
  title: string;
  description: string | null;
  level: string;
  isPublic: boolean;
  cards: Array<{
    id: number;
    termEn: string;
    meaningUz: string;
    exampleEn: string | null;
    synonyms: string | null;
  }>;
}

/**
 * Foydalanuvchi uchun barcha ommaviy va shaxsiy to'plamlarni oladi
 */
export async function getUserDecks(userId: string): Promise<DeckSummary[]> {
  const decks = await prisma.deck.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    include: {
      _count: {
        select: { cards: true },
      },
    },
    orderBy: [
      { userId: "desc" }, // shaxsiy to'plamlar avval
      { createdAt: "desc" },
    ],
  });

  return decks.map((d) => ({
    id: d.id,
    userId: d.userId,
    title: d.title,
    description: d.description,
    level: d.level,
    isPublic: d.isPublic,
    cardCount: d._count.cards,
    isOwner: d.userId === userId,
  }));
}

/**
 * Tizimdagi jami unikal so'zlar sonini hisoblaydi
 */
export async function getTotalVocabCount(userId: string): Promise<number> {
  const accessibleDecks = await prisma.deck.findMany({
    where: {
      OR: [{ isPublic: true }, { userId }],
    },
    select: { id: true },
  });

  const deckIds = accessibleDecks.map((d) => d.id);
  if (deckIds.length === 0) return 0;

  return prisma.card.count({
    where: {
      deckId: { in: deckIds },
    },
  });
}

/**
 * Muayyan to'plamni barcha kartalari bilan oladi
 */
export async function getDeckWithCards(deckId: number): Promise<DeckDetail | null> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!deck) return null;

  return {
    id: deck.id,
    userId: deck.userId,
    title: deck.title,
    description: deck.description,
    level: deck.level,
    isPublic: deck.isPublic,
    cards: deck.cards,
  };
}

/**
 * To'plamlar ro'yxatini Telegram HTML formatida tayyorlaydi
 */
export function formatDecksListHtml(
  decks: DeckSummary[],
  totalVocabCount: number
): string {
  if (decks.length === 0) {
    return (
      `📚 <b>Mening to'plamlarim</b>\n\n` +
      `Hozircha hech qanday to'plam topilmadi.\n` +
      `Botga yangi so'z yozib yuborish orqali shaxsiy lug'atingizni shakllantirishingiz mumkin!`
    );
  }

  let text =
    `📚 <b>Mening To'plamlarim va Lug'atlar</b>\n\n` +
    `Quyida barcha mavjud to'plamlar va shaxsiy lug'atlaringiz ro'yxati keltirilgan.\n` +
    `Har bir to'plam ichidagi barcha so'zlarni to'liq takrorlashingiz mumkin:\n\n`;

  decks.forEach((deck, idx) => {
    const icon = deck.isOwner ? "⭐" : "📁";
    const typeTag = deck.isOwner ? "<i>(Shaxsiy)</i>" : `[${deck.level}]`;
    text += `${idx + 1}. ${icon} <b>${escapeHtml(deck.title)}</b> ${typeTag}\n`;
    text += `   📊 So'zlar soni: <b>${deck.cardCount} ta</b>\n`;
    if (deck.description) {
      text += `   💬 <i>${escapeHtml(deck.description)}</i>\n`;
    }
    text += `\n`;
  });

  text +=
    `🔥 <b>Jami barcha to'plamlardagi lug'at:</b> ${totalVocabCount} ta so'z\n\n` +
    `<i>Barcha lug'atni birdan takrorlash yoki alohida to'plamni tanlash uchun quyidagi tugmalardan foydalaning:</i>`;

  return text;
}

/**
 * Muayyan to'plam haqidagi batafsil sahifani HTML formatida tayyorlaydi
 */
export function formatDeckDetailHtml(deck: DeckDetail): string {
  const cardCount = deck.cards.length;
  const isOwner = !!deck.userId;

  let text =
    `📁 <b>To'plam: ${escapeHtml(deck.title)}</b>\n\n` +
    `🎯 <b>Daraja:</b> ${escapeHtml(deck.level)}\n` +
    `📊 <b>Lug'at hajmi:</b> <b>${cardCount} ta so'z</b>\n` +
    `🏷 <b>Turi:</b> ${isOwner ? "Shaxsiy to'plam" : "Umumiy akademik to'plam"}\n`;

  if (deck.description) {
    text += `📝 <b>Tavsif:</b> <i>${escapeHtml(deck.description)}</i>\n`;
  }

  text += `\n📋 <b>To'plamdagi so'zlardan namunalar:</b>\n`;

  // Ko'pi bilan 8 ta namunaviy so'z ko'rsatiladi
  const previewCards = deck.cards.slice(0, 8);
  previewCards.forEach((c, i) => {
    text += `${i + 1}. <b>${escapeHtml(c.termEn)}</b> — ${escapeHtml(c.meaningUz)}\n`;
  });

  if (cardCount > 8) {
    text += `<i>...va yana ${cardCount - 8} ta so'z</i>\n`;
  }

  text +=
    `\n💡 <i>Siz ushbu to'plamdagi <b>barcha ${cardCount} ta so'zni</b> to'liq takrorlab mashq qilishingiz mumkin!</i>`;

  return text;
}
