import prisma from "../prisma";
import { calculateNextReview } from "../srs";
import { escapeHtml } from "./api";
import {
  getQuizOptionsKeyboard,
  getQuizNextKeyboard,
  getQuizSummaryKeyboard,
} from "./keyboards";
import {
  getQuizSession,
  saveQuizSession,
  deleteQuizSession,
} from "./helpers";
import { QuizQuestion, QuizSession } from "./types";
import seedWordsData from "../../../prisma/seed_words.json";

const DEFAULT_DISTRACTORS = [
  "rivojlantirmoq, ravnaq topmoq",
  "sinchiklab tekshirmoq, tahlil qilmoq",
  "kamaytirmoq, susaytirmoq",
  "aniq ifodalamoq, bayon etmoq",
  "ajralmas, juda muhim",
  "katta daromad keltiruvchi",
  "hamma joyda mavjud bo'lgan",
  "mayda detallarigacha sinchiklab bajarilgan",
  "barqaror, uzoq muddat davom etuvchi",
  "muqarrar, qochib bo'lmaydigan",
  "chuqur, teran, ta'sirli",
  "muhim burilish nuqtasi",
  "tez moslashuvchan, chidamli",
  "keng qamrovli, har tomonlama",
  "ravshan, yaqqol ko'rinib turgan",
];

interface CardItem {
  id: number;
  deckId: number;
  termEn: string;
  meaningUz: string;
  synonyms: string | null;
  exampleEn: string | null;
}

export interface CreateQuizOptions {
  deckId?: number;
  limit?: number | "all";
}

export async function createQuizSession(
  userId: string,
  chatId: number,
  mode: "standard" | "hard" | "review" | "deck" | "all" = "standard",
  options?: CreateQuizOptions
): Promise<QuizSession | null> {
  const now = new Date();
  let candidateCards: CardItem[] = [];
  let deckTitle: string | undefined;

  // 1. Muayyan to'plam (Deck) bo'yicha takrorlash
  if (mode === "deck" && options?.deckId) {
    const deck = await prisma.deck.findUnique({
      where: { id: options.deckId },
      include: {
        cards: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!deck || deck.cards.length === 0) {
      return null;
    }

    deckTitle = deck.title;

    if (options.limit === 5 && deck.cards.length > 5) {
      candidateCards = [...deck.cards].sort(() => 0.5 - Math.random()).slice(0, 5);
    } else {
      // Foydalanuvchi talabi: to'plamdagi BARCHA lug'atni to'liq takrorlash
      candidateCards = [...deck.cards].sort(() => 0.5 - Math.random());
    }
  }

  // 2. Barcha mavjud yuklangan lug'atlarni birdan takrorlash
  else if (mode === "all") {
    const accessibleDecks = await prisma.deck.findMany({
      where: {
        OR: [{ isPublic: true }, { userId }],
      },
      include: {
        cards: true,
      },
    });

    const allCards = accessibleDecks.flatMap((d) => d.cards);

    // Unikal so'zlarni ajratib olish (termEn bo'yicha)
    const seenTerms = new Set<string>();
    const deduped: CardItem[] = [];
    for (const card of allCards) {
      const key = card.termEn.toLowerCase().trim();
      if (!seenTerms.has(key)) {
        seenTerms.add(key);
        deduped.push(card);
      }
    }

    deckTitle = "Barcha lug'atlar";

    if (options?.limit && typeof options.limit === "number") {
      candidateCards = deduped.sort(() => 0.5 - Math.random()).slice(0, options.limit);
    } else {
      // BARCHA yuklangan so'zlar
      candidateCards = deduped.sort(() => 0.5 - Math.random());
    }
  }

  // 3. Qiyin so'zlarni takrorlash
  else if (mode === "hard") {
    const hardProgress = await prisma.studyProgress.findMany({
      where: {
        userId,
        OR: [{ wrongCount: { gt: 0 } }, { boxLevel: 0 }],
      },
      include: { card: true },
      orderBy: [{ wrongCount: "desc" }, { boxLevel: "asc" }],
      take: options?.limit && typeof options.limit === "number" ? options.limit : 50,
    });
    candidateCards = hardProgress.map((p) => p.card);
    deckTitle = "Qiyin so'zlar";

    if (options?.limit === 5 && candidateCards.length > 5) {
      candidateCards = candidateCards.slice(0, 5);
    }
  }

  // 4. Kunlik takrorlash (SRS due)
  else if (mode === "review") {
    const dueProgress = await prisma.studyProgress.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      include: { card: true },
      orderBy: { nextReviewAt: "asc" },
      take: options?.limit && typeof options.limit === "number" ? options.limit : undefined,
    });
    candidateCards = dueProgress.map((p) => p.card);
    deckTitle = "Kunlik takrorlash";

    if (options?.limit === 5 && candidateCards.length > 5) {
      candidateCards = candidateCards.slice(0, 5);
    }
  }

  // 5. Standart Tezkor Quiz
  else {
    deckTitle = "Tezkor Quiz";
    const limit = typeof options?.limit === "number" ? options.limit : 5;

    const someCards = await prisma.card.findMany({
      take: 50,
    });
    candidateCards = someCards.sort(() => 0.5 - Math.random()).slice(0, limit);
  }

  // Standart yoki bo'sh bazada agar kartalar soni < 5 bo'lsa, seed_words dan to'ldirish
  if (candidateCards.length < 5 && (mode === "standard" || candidateCards.length === 0)) {
    const seedPool = [
      ...(seedWordsData.core_47 || []),
      ...(seedWordsData.academic_55 || []),
      ...((seedWordsData as any).architecture_urban_60 || []),
      ...((seedWordsData as any).ielts_reading_baobabs_37 || []),
      ...((seedWordsData as any).ielts_reading_coins_38 || []),
      ...((seedWordsData as any).ielts_reading_grapefruit_31 || []),
      ...((seedWordsData as any).ielts_top_2000 || []),
    ];
    let defaultDeck = await prisma.deck.findFirst({ where: { isPublic: true } });
    if (!defaultDeck) {
      defaultDeck = await prisma.deck.create({
        data: {
          title: "IELTS Core Vocabulary",
          level: "C1",
          isPublic: true,
        },
      });
    }

    const needed = Math.max(5 - candidateCards.length, 5);
    for (let i = 0; i < needed; i++) {
      const item = seedPool[i % seedPool.length];
      const existing = await prisma.card.findFirst({
        where: { termEn: item.term_en },
      });

      if (existing) {
        if (!candidateCards.some((c) => c.id === existing.id)) {
          candidateCards.push(existing);
        }
      } else {
        const created = await prisma.card.create({
          data: {
            deckId: defaultDeck.id,
            termEn: item.term_en,
            meaningUz: item.meaning_uz,
            synonyms: item.synonyms,
            exampleEn: item.example_en,
          },
        });
        candidateCards.push(created);
      }
    }
  }

  // Agar baribir so'z topilmasa
  if (candidateCards.length === 0) return null;

  // Distractorlar (noto'g'ri variantlar) bazasini shakllantirish
  const poolCards = await prisma.card.findMany({
    select: { meaningUz: true },
    take: 150,
  });

  const meaningPool = Array.from(
    new Set(
      poolCards
        .map((c) => c.meaningUz.trim())
        .filter(Boolean)
        .concat(DEFAULT_DISTRACTORS)
    )
  );

  // Barcha tanlangan kartalar bo'yicha savollarni tuzish
  const questions: QuizQuestion[] = candidateCards.map((card) => {
    const correctMeaning = card.meaningUz.trim();

    // To'g'ri ma'nodan farqli 3 ta tasodifiy noto'g'ri variant
    const distractors = meaningPool
      .filter((m) => m !== correctMeaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    while (distractors.length < 3) {
      for (const def of DEFAULT_DISTRACTORS) {
        if (def !== correctMeaning && !distractors.includes(def)) {
          distractors.push(def);
          if (distractors.length >= 3) break;
        }
      }
    }

    const rawOptions = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = rawOptions.indexOf(correctMeaning);

    const options = rawOptions.map((opt) =>
      opt.length > 42 ? opt.slice(0, 40) + "..." : opt
    );

    return {
      cardId: card.id,
      termEn: card.termEn,
      meaningUz: correctMeaning,
      exampleEn: card.exampleEn || undefined,
      synonyms: card.synonyms || undefined,
      options,
      correctIndex,
    };
  });

  const session: QuizSession = {
    id: `qz_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    chatId,
    mode,
    deckId: options?.deckId,
    deckTitle,
    currentIndex: 0,
    questions,
    userAnswers: [],
    score: 0,
    isAnswered: false,
    createdAt: Date.now(),
  };

  saveQuizSession(session);
  return session;
}

export function renderQuestionMessage(session: QuizSession, qIndex: number) {
  const question = session.questions[qIndex];
  const total = session.questions.length;
  const num = qIndex + 1;

  let modeBadge = "";
  if (session.mode === "deck") {
    modeBadge = ` [📁 ${escapeHtml(session.deckTitle || "To'plam")}]`;
  } else if (session.mode === "all") {
    modeBadge = ` [🔥 Barcha lug'at]`;
  } else if (session.mode === "review") {
    modeBadge = ` [🗓 Kunlik takrorlash]`;
  } else if (session.mode === "hard") {
    modeBadge = ` [📌 Qiyin so'zlar]`;
  } else {
    modeBadge = ` [⚡️ Tezkor Quiz]`;
  }

  const text =
    `⚡️ <b>Quiz • [${num}/${total}]</b>${modeBadge}\n\n` +
    `🇬🇧 <b>${escapeHtml(question.termEn)}</b>\n\n` +
    `<i>Ushbu so'zning to'g'ri o'zbekcha tarjimasini tanlang:</i>`;

  const keyboard = getQuizOptionsKeyboard(session.id, qIndex, question.options);

  return { text, keyboard };
}

export async function processQuizAnswer(
  sessionId: string,
  qIndex: number,
  selectedIndex: number,
  user: { id: string }
) {
  const session = getQuizSession(sessionId);
  if (!session) {
    return {
      error: "Quiz sessiyasi eskirgan. Yangi test boshlash uchun /quiz yoki to'plamlar bo'limidan foydalaning.",
    };
  }

  if (session.isAnswered && session.currentIndex === qIndex) {
    return { alreadyAnswered: true };
  }

  const question = session.questions[qIndex];
  if (!question) {
    return { error: "Savol topilmadi." };
  }

  const isCorrect = selectedIndex === question.correctIndex;
  if (isCorrect) {
    session.score += 1;
  }

  session.userAnswers.push({
    questionIndex: qIndex,
    selectedIndex,
    isCorrect,
  });
  session.isAnswered = true;
  saveQuizSession(session);

  // 1. Spaced Repetition (SRS) ni yangilash
  try {
    const existingProg = await prisma.studyProgress.findFirst({
      where: { userId: user.id, cardId: question.cardId },
    });

    const currentBox = existingProg?.boxLevel ?? 0;
    const currentStreak = existingProg?.correctStreak ?? 0;
    const currentWrong = existingProg?.wrongCount ?? 0;

    const srs = calculateNextReview(currentBox, currentStreak, currentWrong, isCorrect);

    if (existingProg) {
      await prisma.studyProgress.update({
        where: { id: existingProg.id },
        data: {
          boxLevel: srs.newBoxLevel,
          nextReviewAt: srs.nextReviewAt,
          correctStreak: srs.newStreak,
          wrongCount: srs.newWrongCount,
        },
      });
    } else {
      await prisma.studyProgress.create({
        data: {
          userId: user.id,
          cardId: question.cardId,
          boxLevel: srs.newBoxLevel,
          nextReviewAt: srs.nextReviewAt,
          correctStreak: srs.newStreak,
          wrongCount: srs.newWrongCount,
        },
      });
    }
  } catch (err) {
    console.error("Failed to update StudyProgress:", err);
  }

  // 2. Feedback xabarini tayyorlash
  const isLast = qIndex >= session.questions.length - 1;
  const statusHeader = isCorrect
    ? "✅ <b>To'g'ri javob! Barakalla!</b>"
    : `❌ <b>Noto'g'ri!</b>\nSiz tanladingiz: <s>${escapeHtml(
        question.options[selectedIndex]
      )}</s>\nTo'g'ri javob: <b>${escapeHtml(question.meaningUz)}</b>`;

  let text =
    `${statusHeader}\n\n` +
    `🇬🇧 <b>${escapeHtml(question.termEn)}</b> — ${escapeHtml(question.meaningUz)}\n`;

  if (question.exampleEn) {
    text += `📝 <b>IELTS Misol:</b> <i>"${escapeHtml(question.exampleEn)}"</i>\n`;
  }
  if (question.synonyms) {
    text += `💡 <b>Sinonimlar:</b> <i>${escapeHtml(question.synonyms)}</i>\n`;
  }

  const keyboard = getQuizNextKeyboard(session.id, isLast);

  return { text, keyboard, isCorrect };
}

export function renderQuizSummary(
  session: QuizSession,
  user: { streakCount?: number },
  appUrl: string
) {
  const total = session.questions.length;
  const score = session.score;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  let badge = "";
  let rating = "";

  if (score === total && total > 0) {
    badge = "🌟 Mukammal natija (100%)!";
    rating = `Barcha <b>${total} ta</b> savolga to'g'ri javob berdingiz! Akademik so'z boyligingiz a'lo darajada.`;
  } else if (percent >= 80) {
    badge = "👏 Ajoyib natija!";
    rating = `${total} tadan <b>${score} ta</b> so'zni to'g'ri topdingiz. Spaced Repetition xotirangiz mustahkamlanmoqda.`;
  } else if (percent >= 60) {
    badge = "👍 Yaxshi natija!";
    rating = `${total} tadan <b>${score} ta</b> to'g'ri javob. Xato qilingan so'zlarni muntazam takrorlab boring.`;
  } else {
    badge = "💪 Davom eting!";
    rating = `${total} tadan <b>${score} ta</b> to'g'ri javob. Xatolar — o'rganishning eng yaxshi yo'li. Qayta takrorlab o'zlashtiring!`;
  }

  let modeDetail = "";
  if (session.mode === "deck" && session.deckTitle) {
    modeDetail = `📁 To'plam: <b>${escapeHtml(session.deckTitle)}</b>\n`;
  } else if (session.mode === "all") {
    modeDetail = `🔥 <b>Barcha lug'atlar bo'yicha to'liq takrorlash yakunlandi!</b>\n`;
  } else if (session.mode === "review") {
    modeDetail = `🗓 <b>Kunlik takrorlash yakunlandi!</b>\n`;
  }

  const text =
    `🏆 <b>Quiz Natijasi: ${score} / ${total} (${percent}%)</b>\n` +
    `<b>${badge}</b>\n\n` +
    modeDetail +
    `${rating}\n\n` +
    `🔥 <b>Kunlik seriyangiz:</b> ${user.streakCount || 0} kun uzluksiz\n` +
    `📦 <b>SRS Xotira:</b> Javoblaringiz Leitner tizimiga kiritildi va navbatdagi takrorlash vaqtlari hisoblab chiqildi.\n\n` +
    `<i>Mashg'ulotni davom ettirish uchun quyidagi tugmalardan birini tanlang:</i>`;

  const keyboard = getQuizSummaryKeyboard(appUrl, {
    mode: session.mode,
    deckId: session.deckId,
  });

  // Xotirani tozalash
  deleteQuizSession(session.id);

  return { text, keyboard };
}
