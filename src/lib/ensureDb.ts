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
    // 0. "Common reading" to'plamini o'chirish (foydalanuvchi talabiga ko'ra)
    try {
      await prisma.deck.deleteMany({
        where: {
          OR: [
            { title: { equals: "Common reading", mode: "insensitive" } },
            { title: { contains: "Common reading", mode: "insensitive" } },
          ],
        },
      });
    } catch (delErr) {
      console.warn("Notice deleting Common reading deck:", delErr);
    }

    const {
      core_47,
      academic_55,
      architecture_urban_60,
      ielts_reading_baobabs_37,
      ielts_reading_coins_38,
      ielts_reading_grapefruit_31,
      ielts_top_2000,
    } = seedWordsData as {
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
      ielts_reading_baobabs_37?: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
      ielts_reading_coins_38?: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
      ielts_reading_grapefruit_31?: Array<{
        term_en: string;
        meaning_uz: string;
        synonyms?: string;
        example_en?: string;
      }>;
      ielts_top_2000?: Array<{
        number?: number;
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

    // Deck 4: IELTS Reading P1: The Baobabs of Madagascar — 37 Words
    if (ielts_reading_baobabs_37 && ielts_reading_baobabs_37.length > 0) {
      let deckBaobabs = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "IELTS Reading P1: The Baobabs of Madagascar — 37 Words" },
            { title: "Reading Passage 1: The Baobabs of Madagascar" },
            { title: { contains: "Baobabs of Madagascar" } },
          ],
        },
      });

      if (!deckBaobabs) {
        deckBaobabs = await prisma.deck.create({
          data: {
            title: "IELTS Reading P1: The Baobabs of Madagascar — 37 Words",
            description:
              "IELTS Reading Passage 1 (The Baobabs of Madagascar) matnining 37 ta eng muhim akademik so'z va iboralar to'plami. Botanika, ekologiya va tabiatni muhofaza qilish leksikasi.",
            level: "B2-C1",
            isPublic: true,
          },
        });

        for (const w of ielts_reading_baobabs_37) {
          const card = await prisma.card.create({
            data: {
              deckId: deckBaobabs.id,
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

    // Deck 5: IELTS Reading P2: Coins – The First Form of Money — 38 Words
    if (ielts_reading_coins_38 && ielts_reading_coins_38.length > 0) {
      let deckCoins = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "IELTS Reading P2: Coins – The First Form of Money — 38 Words" },
            { title: "Reading Passage 2: Coins – the first form of money" },
            { title: { contains: "first form of money" } },
          ],
        },
      });

      if (!deckCoins) {
        deckCoins = await prisma.deck.create({
          data: {
            title: "IELTS Reading P2: Coins – The First Form of Money — 38 Words",
            description:
              "IELTS Reading Passage 2 (Coins – The First Form of Money) matnining 38 ta eng muhim akademik so'z va iboralar to'plami. Tarix, numizmatika, iqtisodiyot va metallurgiya leksikasi.",
            level: "C1",
            isPublic: true,
          },
        });

        for (const w of ielts_reading_coins_38) {
          const card = await prisma.card.create({
            data: {
              deckId: deckCoins.id,
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

    // Deck 6: IELTS Reading P3: Creating a Better Grapefruit — 31 Words
    if (ielts_reading_grapefruit_31 && ielts_reading_grapefruit_31.length > 0) {
      let deckGrapefruit = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "IELTS Reading P3: Creating a Better Grapefruit — 31 Words" },
            { title: "Reading Passage 3: Creating a Better Grapefruit" },
            { title: { contains: "Better Grapefruit" } },
          ],
        },
      });

      if (!deckGrapefruit) {
        deckGrapefruit = await prisma.deck.create({
          data: {
            title: "IELTS Reading P3: Creating a Better Grapefruit — 31 Words",
            description:
              "IELTS Reading Passage 3 (Creating a Better Grapefruit) matnining 31 ta eng muhim akademik so'z va iboralar to'plami. Qishloq xo'jaligi fanlari, kimyo, ta'm idroki va biotexnologiya leksikasi.",
            level: "C1-C2",
            isPublic: true,
          },
        });

        for (const w of ielts_reading_grapefruit_31) {
          const card = await prisma.card.create({
            data: {
              deckId: deckGrapefruit.id,
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

    // Deck 7: Cambridge IELTS 10–14: Top 2000 Academic Vocabulary — 2000 Words
    if (ielts_top_2000 && ielts_top_2000.length > 0) {
      let deck2000 = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Cambridge IELTS 10–14: Top 2000 Academic Vocabulary" },
            { title: { contains: "Top 2000 Academic Vocabulary" } },
            { title: { contains: "Top 2000 Vocabulary" } },
          ],
        },
      });

      if (!deck2000) {
        deck2000 = await prisma.deck.create({
          data: {
            title: "Cambridge IELTS 10–14: Top 2000 Academic Vocabulary",
            description:
              "Cambridge IELTS 10–14 kitoblaridagi 60 ta Academic Reading matnidan haqiqiy chastota bo'yicha saralangan barcha 2000 ta akademik so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va kontekstual misollar bilan to'liq jihozlangan.",
            level: "B2–C2",
            isPublic: true,
          },
        });

        const chunkSize = 250;
        for (let i = 0; i < ielts_top_2000.length; i += chunkSize) {
          const chunk = ielts_top_2000.slice(i, i + chunkSize);
          await prisma.card.createMany({
            data: chunk.map((w) => ({
              deckId: deck2000!.id,
              termEn: w.term_en,
              meaningUz: w.meaning_uz,
              synonyms: w.synonyms || null,
              exampleEn: w.example_en || null,
            })),
          });
        }
        console.log(`Auto-seeded Deck 7 (Top 2000) with ${ielts_top_2000.length} cards.`);
      }
    }

    console.log("Auto-seeded flagship cards successfully.");
  } catch (seedErr) {
    console.error("Auto-seed error:", seedErr);
  }
}
