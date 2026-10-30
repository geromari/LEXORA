import prisma from "./prisma";
import seedWordsData from "../../prisma/seed_words.json";

let isEnsured = false;

export async function ensureVydexDb() {
  if (isEnsured) return;

  try {
    // 1. PostgreSQL da jadvallarni yaratish (agar mavjud bo'lmasa)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE,
        "username" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT,
        "telegramId" BIGINT UNIQUE,
        "avatarUrl" TEXT,
        "streakCount" INTEGER NOT NULL DEFAULT 0,
        "lastActiveDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Deck" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
        "title" TEXT NOT NULL,
        "description" TEXT DEFAULT '',
        "level" TEXT NOT NULL DEFAULT 'C1',
        "isPublic" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Card" (
        "id" SERIAL PRIMARY KEY,
        "deckId" INTEGER NOT NULL REFERENCES "Deck"("id") ON DELETE CASCADE,
        "termEn" TEXT NOT NULL,
        "meaningUz" TEXT NOT NULL,
        "synonyms" TEXT,
        "exampleEn" TEXT
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StudyProgress" (
        "id" SERIAL PRIMARY KEY,
        "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
        "cardId" INTEGER NOT NULL REFERENCES "Card"("id") ON DELETE CASCADE,
        "boxLevel" INTEGER NOT NULL DEFAULT 0,
        "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "correctStreak" INTEGER NOT NULL DEFAULT 0,
        "wrongCount" INTEGER NOT NULL DEFAULT 0
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "StudyProgress_userId_cardId_idx" ON "StudyProgress"("userId", "cardId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TelegramAuthSession" (
        "id" SERIAL PRIMARY KEY,
        "sessionToken" TEXT UNIQUE NOT NULL,
        "userId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
        "telegramId" BIGINT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "jwtToken" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "TelegramAuthSession_sessionToken_idx" ON "TelegramAuthSession"("sessionToken");
    `);

    isEnsured = true;

    // 2. Boshlang'ich to'plamlarni tekshirish va to'ldirish
    await autoSeedDecks();
  } catch (err) {
    console.warn("ensureVydexDb notice:", err);
  }
}

// Backward-compatible alias
export const ensureLexoraDb = ensureVydexDb;

async function autoSeedDecks() {
  try {
    const { core_47, academic_55, architecture_urban_60 } = seedWordsData as {
      core_47: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
      academic_55: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
      architecture_urban_60?: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
    };

    // Deck 1
    let deck47 = await prisma.deck.findFirst({
      where: { title: "IELTS Reading Advanced — 47 Core Words" },
    });
    if (!deck47) {
      deck47 = await prisma.deck.create({
        data: {
          title: "IELTS Reading Advanced — 47 Core Words",
          description:
            "IELTS Reading C1/C2 darajasidagi eng muhim va kontekstual 47 ta akademik so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va kontekstual namunalar bilan boyitilgan.",
          level: "C1",
          isPublic: true,
        },
      });

      for (const w of core_47) {
        const card = await prisma.card.create({
          data: {
            deckId: deck47.id,
            termEn: w.term_en,
            meaningUz: w.meaning_uz,
            synonyms: w.synonyms || null,
            exampleEn: w.example_en || null,
          },
        });

        await prisma.studyProgress.create({
          data: {
            cardId: card.id,
            userId: null,
            boxLevel: 0,
            nextReviewAt: new Date(),
            correctStreak: 0,
            wrongCount: 0,
          },
        });
      }
    }

    // Deck 2
    let deck55 = await prisma.deck.findFirst({
      where: { title: "IELTS & Academic Mastery — 55 Core Words (C1–C2)" },
    });
    if (!deck55) {
      deck55 = await prisma.deck.create({
        data: {
          title: "IELTS & Academic Mastery — 55 Core Words (C1–C2)",
          description:
            "IELTS va ilmiy-akademik matnlarda eng ko'p uchraydigan 55 ta muhim so'z va iboralar to'plami (B2, C1, C2). Har bir so'z aniq o'zbekcha ma'no, sinonimlar va boy kontekstual namunalar bilan jihozlangan.",
          level: "C1-C2",
          isPublic: true,
        },
      });

      for (const w of academic_55) {
        const card = await prisma.card.create({
          data: {
            deckId: deck55.id,
            termEn: w.term_en,
            meaningUz: w.meaning_uz,
            synonyms: w.synonyms || null,
            exampleEn: w.example_en || null,
          },
        });

        await prisma.studyProgress.create({
          data: {
            cardId: card.id,
            userId: null,
            boxLevel: 0,
            nextReviewAt: new Date(),
            correctStreak: 0,
            wrongCount: 0,
          },
        });
      }
    }

    // Deck 3
    if (architecture_urban_60 && architecture_urban_60.length > 0) {
      let deck60 = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Urban Architecture & Heritage — 60 Core Words (B2–C2)" },
            { title: "Architecture & Urban Development — 60 Words" },
          ],
        },
      });

      if (!deck60) {
        deck60 = await prisma.deck.create({
          data: {
            title: "Urban Architecture & Heritage — 60 Core Words (B2–C2)",
            description:
              "Tarixiy me'morchilik, shaharsozlik va barqaror rivojlanish mavzusidagi 60 ta eng muhim B2, C1 va C2 darajadagi leksika va iboralar to'plami. Har bir so'z o'zbekcha tarjima, boy sinonimlar va kontekstual akademik namunalar bilan boyitilgan.",
            level: "B2-C2",
            isPublic: true,
          },
        });

        for (const w of architecture_urban_60) {
          const card = await prisma.card.create({
            data: {
              deckId: deck60.id,
              termEn: w.term_en,
              meaningUz: w.meaning_uz,
              synonyms: w.synonyms || null,
              exampleEn: w.example_en || null,
            },
          });

          await prisma.studyProgress.create({
            data: {
              cardId: card.id,
              userId: null,
              boxLevel: 0,
              nextReviewAt: new Date(),
              correctStreak: 0,
              wrongCount: 0,
            },
          });
        }
      }
    }

    console.log("Auto-seeded flagship cards successfully.");
  } catch (seedErr) {
    console.error("Auto-seed error:", seedErr);
  }
}
