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
];

interface CardItem {
  id: number;
  deckId: number;
  termEn: string;
  meaningUz: string;
  synonyms: string | null;
  exampleEn: string | null;
}

export async function createQuizSession(
  userId: string,
  chatId: number,
  mode: "standard" | "hard" | "review" = "standard"
): Promise<QuizSession | null> {
  const now = new Date();
  let candidateCards: CardItem[] = [];

  if (mode === "hard") {
    // 1. Pick hard words (wrongCount > 0 or boxLevel 0)
    const hardProgress = await prisma.studyProgress.findMany({
      where: {
        userId,
        OR: [{ wrongCount: { gt: 0 } }, { boxLevel: 0 }],
      },
      include: { card: true },
      orderBy: [{ wrongCount: "desc" }, { boxLevel: "asc" }],
      take: 15,
    });
    candidateCards = hardProgress.map((p) => p.card);
  } else if (mode === "review") {
    // 2. Pick due review words
    const dueProgress = await prisma.studyProgress.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      include: { card: true },
      take: 15,
    });
    candidateCards = dueProgress.map((p) => p.card);
  }

  // If candidate count < 5, supplement with other cards
  if (candidateCards.length < 5) {
    const existingIds = candidateCards.map((c) => c.id);
    const needed = 5 - candidateCards.length;

    const extraCards = await prisma.card.findMany({
      where: {
        id: { notIn: existingIds },
      },
      take: 30,
    });

    // Shuffle and pick
    const shuffledExtra = extraCards.sort(() => 0.5 - Math.random()).slice(0, needed);
    candidateCards.push(...shuffledExtra);
  }

  // If still < 5 (e.g. fresh empty DB), seed from seed_words.json
  if (candidateCards.length < 5) {
    const seedPool = [
      ...(seedWordsData.core_47 || []),
      ...(seedWordsData.academic_55 || []),
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

    const needed = 5 - candidateCards.length;
    for (let i = 0; i < needed; i++) {
      const item = seedPool[i % seedPool.length];
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

  // Pick exactly 5 distinct cards and shuffle them
  const selectedCards = candidateCards
    .filter((c, idx, arr) => arr.findIndex((x) => x.id === c.id) === idx)
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  if (selectedCards.length === 0) return null;

  // Fetch a pool of distractor meanings from DB
  const poolCards = await prisma.card.findMany({
    select: { meaningUz: true },
    take: 50,
  });

  const meaningPool = poolCards
    .map((c) => c.meaningUz.trim())
    .filter(Boolean)
    .concat(DEFAULT_DISTRACTORS);

  // Build 5 QuizQuestions
  const questions: QuizQuestion[] = selectedCards.map((card) => {
    const correctMeaning = card.meaningUz.trim();

    // Pick 3 random distractors that are not equal to correct meaning
    const distractors = meaningPool
      .filter((m) => m !== correctMeaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // If still less than 3, pad with defaults
    while (distractors.length < 3) {
      distractors.push(DEFAULT_DISTRACTORS[distractors.length]);
    }

    const rawOptions = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = rawOptions.indexOf(correctMeaning);

    // Shorten option if too long for inline button
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

  const modeBadge =
    session.mode === "hard"
      ? " [📌 Qiyin so'zlar mashqi]"
      : session.mode === "review"
      ? " [🗓 Kunlik takrorlash]"
      : "";

  const text =
    `⚡️ <b>Tezkor Quiz • [${num}/${total}]</b>${modeBadge}\n\n` +
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
      error: "Quiz sessiyasi eskirgan. Yangi quiz boshlash uchun /quiz buyrug'ini bering.",
    };
  }

  // Prevent double answering same question
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

  // 1. Update Spaced Repetition (SRS) Progress in DB
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

  // 2. Build Feedback text
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
  const percent = Math.round((score / total) * 100);

  let rating = "";
  let badge = "";

  if (score === 5) {
    badge = "🌟 Mukammal natija!";
    rating = "Barcha 5 ta savolga to'g'ri javob berdingiz! C1 akademik so'z boyligingiz a'lo darajada.";
  } else if (score >= 4) {
    badge = "👏 Ajoyib natija!";
    rating = "Deyarli barcha so'zlarni to'g'ri topdingiz. Spaced Repetition xotirangiz mustahkamlanmoqda.";
  } else if (score >= 3) {
    badge = "👍 Yaxshi harakat!";
    rating = "Yaxshi natija! Xato qilingan so'zlarni muntazam takrorlab boring.";
  } else {
    badge = "💪 Davom eting!";
    rating = "Xatolar — o'rganishning eng yaxshi yo'li. Qiyin so'zlar bo'limidan ushbu so'zlarni yana bir bor mashq qiling.";
  }

  const text =
    `🏆 <b>Quiz Natijasi: ${score} / ${total} (${percent}%)</b>\n` +
    `<b>${badge}</b>\n\n` +
    `${rating}\n\n` +
    `🔥 <b>Kunlik seriyangiz:</b> ${user.streakCount || 0} kun uzluksiz\n` +
    `📦 <b>SRS Xotira:</b> Javoblaringiz Leitner tizimiga kiritildi va navbatdagi takrorlash vaqti belgilandi.\n\n` +
    `<i>Mashg'ulotni davom ettirish uchun quyidagi tugmalardan birini tanlang:</i>`;

  const keyboard = getQuizSummaryKeyboard(appUrl);

  // Clean up session from memory
  deleteQuizSession(session.id);

  return { text, keyboard };
}
