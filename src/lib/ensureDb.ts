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

      // Eski nomdagi to'plamlarni yangilash
      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "IELTS Reading Advanced — 47 Core Words" },
            { title: { contains: "IELTS Reading Advanced" } },
          ],
        },
        data: {
          title: "Advanced Reading Mastery — 47 Core Words",
          description: "Ingliz tili chuqurlashtirilgan o'qish matnlaridan 47 ta eng muhim so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va namunalar bilan boyitilgan.",
          level: "Advanced",
        },
      });

      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "IELTS & Academic Mastery — 55 Core Words (C1–C2)" },
            { title: { contains: "Academic Mastery — 55 Core Words" } },
          ],
        },
        data: {
          title: "Elite Academic Mastery — 55 Core Words",
          description: "Ilmiy va nufuzli matnlarda eng ko'p uchraydigan 55 ta sara so'z va iboralar to'plami. Har bir so'z aniq o'zbekcha ma'no, sinonimlar va namunalar bilan jihozlangan.",
          level: "Mastery",
        },
      });

      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "IELTS Reading P1: The Baobabs of Madagascar — 37 Words" },
            { title: { contains: "Baobabs of Madagascar" } },
          ],
        },
        data: {
          title: "Deep Reading: The Baobabs of Madagascar — 37 Words",
          description: "The Baobabs of Madagascar ilmiy matnining 37 ta eng muhim leksikasi. Botanika, ekologiya va tabiatni muhofaza qilish so'zlari.",
          level: "Nature & Bio",
        },
      });

      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "IELTS Reading P2: Coins – The First Form of Money — 38 Words" },
            { title: { contains: "Coins – The First Form of Money" } },
            { title: { contains: "Coins – the first form of money" } },
          ],
        },
        data: {
          title: "Deep Reading: Coins – The First Form of Money — 38 Words",
          description: "Coins – The First Form of Money matnining 38 ta eng muhim so'z va iboralar to'plami. Tarix, numizmatika, iqtisodiyot va savdo leksikasi.",
          level: "History & Econ",
        },
      });

      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "IELTS Reading P3: Creating a Better Grapefruit — 31 Words" },
            { title: { contains: "Creating a Better Grapefruit" } },
          ],
        },
        data: {
          title: "Deep Reading: Creating a Better Grapefruit — 31 Words",
          description: "Creating a Better Grapefruit matnining 31 ta eng muhim so'z va iboralar to'plami. Qishloq xo'jaligi, kimyo va biotexnologiya leksikasi.",
          level: "Science",
        },
      });

      await prisma.deck.updateMany({
        where: {
          OR: [
            { title: "Cambridge IELTS 10–14: Top 2000 Academic Vocabulary" },
            { title: { contains: "Top 2000 Academic Vocabulary" } },
            { title: { contains: "Top 2000 Vocabulary" } },
          ],
        },
        data: {
          title: "Cambridge Top 2000: Oltin Leksika",
          description: "60 ta ilmiy va publitsistik matndan chastota bo'yicha saralangan barcha 2000 ta oltin so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va misollar bilan jihozlangan.",
          level: "Super Vocab",
        },
      });
    } catch (delErr) {
      console.warn("Notice updating/deleting decks:", delErr);
    }

    const seedDataAny = seedWordsData as any;
    const core_47 = seedDataAny.core_47 || [];
    const academic_55 = seedDataAny.academic_55 || [];
    const architecture_urban_60 = seedDataAny.architecture_urban_60 || [];
    const reading_baobabs_37 = seedDataAny.reading_baobabs_37 || seedDataAny.ielts_reading_baobabs_37 || [];
    const reading_coins_38 = seedDataAny.reading_coins_38 || seedDataAny.ielts_reading_coins_38 || [];
    const reading_grapefruit_31 = seedDataAny.reading_grapefruit_31 || seedDataAny.ielts_reading_grapefruit_31 || [];
    const cambridge_top_2000 = seedDataAny.cambridge_top_2000 || seedDataAny.ielts_top_2000 || [];
    const luck_vs_grit_69 = seedDataAny.luck_vs_grit_69 || [];
    const english_global_language_72 = seedDataAny.english_global_language_72 || [];
    const invest_in_the_young_63 = seedDataAny.invest_in_the_young_63 || [];

    // Deck 1
    let deck47 = await prisma.deck.findFirst({
      where: {
        OR: [
          { title: "Advanced Reading Mastery — 47 Core Words" },
          { title: "IELTS Reading Advanced — 47 Core Words" },
        ],
      },
    });
    if (!deck47) {
      deck47 = await prisma.deck.create({
        data: {
          title: "Advanced Reading Mastery — 47 Core Words",
          description:
            "Ingliz tili chuqurlashtirilgan o'qish matnlaridan 47 ta eng muhim so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va namunalar bilan boyitilgan.",
          level: "Advanced",
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
      where: {
        OR: [
          { title: "Elite Academic Mastery — 55 Core Words" },
          { title: "IELTS & Academic Mastery — 55 Core Words (C1–C2)" },
        ],
      },
    });
    if (!deck55) {
      deck55 = await prisma.deck.create({
        data: {
          title: "Elite Academic Mastery — 55 Core Words",
          description:
            "Ilmiy va nufuzli matnlarda eng ko'p uchraydigan 55 ta sara so'z va iboralar to'plami. Har bir so'z aniq o'zbekcha ma'no, sinonimlar va namunalar bilan jihozlangan.",
          level: "Mastery",
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

    // Deck 4: Deep Reading: The Baobabs of Madagascar — 37 Words
    if (reading_baobabs_37 && reading_baobabs_37.length > 0) {
      let deckBaobabs = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Deep Reading: The Baobabs of Madagascar — 37 Words" },
            { title: { contains: "Baobabs of Madagascar" } },
          ],
        },
      });

      if (!deckBaobabs) {
        deckBaobabs = await prisma.deck.create({
          data: {
            title: "Deep Reading: The Baobabs of Madagascar — 37 Words",
            description:
              "The Baobabs of Madagascar ilmiy matnining 37 ta eng muhim leksikasi. Botanika, ekologiya va tabiatni muhofaza qilish so'zlari.",
            level: "Nature & Bio",
            isPublic: true,
          },
        });

        for (const w of reading_baobabs_37) {
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

    // Deck 5: Deep Reading: Coins – The First Form of Money — 38 Words
    if (reading_coins_38 && reading_coins_38.length > 0) {
      let deckCoins = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Deep Reading: Coins – The First Form of Money — 38 Words" },
            { title: { contains: "first form of money" } },
          ],
        },
      });

      if (!deckCoins) {
        deckCoins = await prisma.deck.create({
          data: {
            title: "Deep Reading: Coins – The First Form of Money — 38 Words",
            description:
              "Coins – The First Form of Money matnining 38 ta eng muhim so'z va iboralar to'plami. Tarix, numizmatika, iqtisodiyot va savdo leksikasi.",
            level: "History & Econ",
            isPublic: true,
          },
        });

        for (const w of reading_coins_38) {
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

    // Deck 6: Deep Reading: Creating a Better Grapefruit — 31 Words
    if (reading_grapefruit_31 && reading_grapefruit_31.length > 0) {
      let deckGrapefruit = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Deep Reading: Creating a Better Grapefruit — 31 Words" },
            { title: { contains: "Better Grapefruit" } },
          ],
        },
      });

      if (!deckGrapefruit) {
        deckGrapefruit = await prisma.deck.create({
          data: {
            title: "Deep Reading: Creating a Better Grapefruit — 31 Words",
            description:
              "Creating a Better Grapefruit matnining 31 ta eng muhim so'z va iboralar to'plami. Qishloq xo'jaligi, kimyo va biotexnologiya leksikasi.",
            level: "Science",
            isPublic: true,
          },
        });

        for (const w of reading_grapefruit_31) {
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

    // Deck 7: Cambridge Top 2000: Oltin Leksika — 2000 Words
    if (cambridge_top_2000 && cambridge_top_2000.length > 0) {
      let deck2000 = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Cambridge Top 2000: Oltin Leksika" },
            { title: { contains: "Top 2000 Academic Vocabulary" } },
            { title: { contains: "Top 2000 Vocabulary" } },
          ],
        },
      });

      if (!deck2000) {
        deck2000 = await prisma.deck.create({
          data: {
            title: "Cambridge Top 2000: Oltin Leksika",
            description:
              "60 ta ilmiy va publitsistik matndan chastota bo'yicha saralangan barcha 2000 ta oltin so'z va iboralar to'plami. Har bir so'z o'zbekcha tarjima, sinonimlar va misollar bilan jihozlangan.",
            level: "Super Vocab",
            isPublic: true,
          },
        });

        const chunkSize = 250;
        for (let i = 0; i < cambridge_top_2000.length; i += chunkSize) {
          const chunk = cambridge_top_2000.slice(i, i + chunkSize);
          await prisma.card.createMany({
            data: chunk.map((w: any) => ({
              deckId: deck2000!.id,
              termEn: w.term_en,
              meaningUz: w.meaning_uz,
              synonyms: w.synonyms || null,
              exampleEn: w.example_en || null,
            })),
          });
        }
        console.log(`Auto-seeded Deck 7 (Top 2000) with ${cambridge_top_2000.length} cards.`);
      }
    }

    // Deck 8: Luck vs Grit — 69 Words (B2–C2)
    if (luck_vs_grit_69 && luck_vs_grit_69.length > 0) {
      let deckLuckVsGrit = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Luck vs Grit" },
            { title: "Luck vs Grit — 69 Words (B2–C2)" },
            { title: { contains: "Luck vs Grit", mode: "insensitive" } },
          ],
        },
      });

      if (!deckLuckVsGrit) {
        deckLuckVsGrit = await prisma.deck.create({
          data: {
            title: "Luck vs Grit",
            description:
              "Omad va matonat (Luck vs Grit) mavzusidagi 69 ta muhim B2, C1 va C2 darajadagi leksika, iboralar va metaforalar to'plami. Har bir so'z o'zbekcha tarjima, boy sinonimlar va kontekstual namunalar bilan to'liq jihozlangan.",
            level: "B2–C2",
            isPublic: true,
          },
        });

        for (const w of luck_vs_grit_69) {
          const card = await prisma.card.create({
            data: {
              deckId: deckLuckVsGrit.id,
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
        console.log(`Auto-seeded Deck 8 (Luck vs Grit) with ${luck_vs_grit_69.length} cards.`);
      }
    }

    // Deck 9: English as a Global Language — 72 Words (B2–C2)
    if (english_global_language_72 && english_global_language_72.length > 0) {
      let deckEnglishGlobal = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "English as a Global Language" },
            { title: "English as a Global Language — 72 Words (B2–C2)" },
            { title: { contains: "English as a Global Language", mode: "insensitive" } },
          ],
        },
      });

      if (!deckEnglishGlobal) {
        deckEnglishGlobal = await prisma.deck.create({
          data: {
            title: "English as a Global Language — 72 Words (B2–C2)",
            description:
              "Ingliz tili global til sifatida mavzusidagi 72 ta muhim B2, C1 va C2 darajadagi leksika to'plami. Globallashuv, til siyosati, madaniy hukmronlik va xalqaro aloqa mavzularini qamrab oladi. Har bir so'z o'zbekcha tarjima, sinonimlar va kontekstual namunalar bilan jihozlangan.",
            level: "B2–C2",
            isPublic: true,
          },
        });

        for (const w of english_global_language_72) {
          const card = await prisma.card.create({
            data: {
              deckId: deckEnglishGlobal.id,
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
        console.log(`Auto-seeded Deck 9 (English as a Global Language) with ${english_global_language_72.length} cards.`);
      }
    }

    // Deck 10: Invest in the Young — 63 Words (B2–C2)
    if (invest_in_the_young_63 && invest_in_the_young_63.length > 0) {
      let deckInvestYoung = await prisma.deck.findFirst({
        where: {
          OR: [
            { title: "Invest in the Young" },
            { title: "Invest in the Young — 63 Words (B2–C2)" },
            { title: { contains: "Invest in the Young", mode: "insensitive" } },
          ],
        },
      });

      if (!deckInvestYoung) {
        deckInvestYoung = await prisma.deck.create({
          data: {
            title: "Invest in the Young — 63 Words (B2–C2)",
            description:
              "Yoshlarga investitsiya kiritish va maktab sport hamda san'at ta'limini moliyalashtirish mavzusidagi 63 ta muhim B2, C1 va C2 darajadagi leksika, iboralar va metaforalar to'plami. Har bir so'z o'zbekcha aniq ma'no, boy sinonimlar va kontekstual akademik namunalar bilan to'liq jihozlangan.",
            level: "B2–C2",
            isPublic: true,
          },
        });

        for (const w of invest_in_the_young_63) {
          const card = await prisma.card.create({
            data: {
              deckId: deckInvestYoung.id,
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
        console.log(`Auto-seeded Deck 10 (Invest in the Young) with ${invest_in_the_young_63.length} cards.`);
      }
    }

    console.log("Auto-seeded flagship cards successfully.");
  } catch (seedErr) {
    console.error("Auto-seed error:", seedErr);
  }
}
