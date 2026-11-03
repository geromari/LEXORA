import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Vydex Database with 102 Flagship Academic Words...");

  const jsonPath = path.join(__dirname, "seed_words.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(rawData);

  const core47Words = data.core_47;
  const academic55Words = data.academic_55;
  const urban60Words = data.architecture_urban_60 || [];
  const baobabs37Words = data.ielts_reading_baobabs_37 || [];
  const coins38Words = data.ielts_reading_coins_38 || [];
  const grapefruit31Words = data.ielts_reading_grapefruit_31 || [];
  const ieltsTop2000Words = data.ielts_top_2000 || [];
  const luckVsGrit69Words = data.luck_vs_grit_69 || [];
  const englishGlobalLanguage72Words = data.english_global_language_72 || [];

  // 0. Delete "Common reading" if it exists
  await prisma.deck.deleteMany({
    where: {
      OR: [
        { title: { equals: "Common reading", mode: "insensitive" } },
        { title: { contains: "Common reading", mode: "insensitive" } },
      ],
    },
  });

  // 1. Deck 1: Advanced Reading Mastery — 47 Core Words
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

    for (const w of core47Words) {
      const card = await prisma.card.create({
        data: {
          deckId: deck47.id,
          termEn: w.term_en,
          meaningUz: w.meaning_uz,
          synonyms: w.synonyms || null,
          exampleEn: w.example_en || null,
        },
      });

      // Default system progress (userId: null)
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
    console.log(`Seeded Deck 1 with ${core47Words.length} cards.`);
  } else {
    console.log("Deck 1 already exists.");
  }

  // 2. Deck 2: Elite Academic Mastery — 55 Core Words
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
          "Ilmiy va nufuzli matnlarda eng ko'p uchraydigan 55 ta sara so'z va iboralar to'plami. Har bir so'z aniq o'zbekcha ma'no, sinonimlar va boy namunalar bilan jihozlangan.",
        level: "Mastery",
        isPublic: true,
      },
    });

    for (const w of academic55Words) {
      const card = await prisma.card.create({
        data: {
          deckId: deck55.id,
          termEn: w.term_en,
          meaningUz: w.meaning_uz,
          synonyms: w.synonyms || null,
          exampleEn: w.example_en || null,
        },
      });

      // Default system progress (userId: null)
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
    console.log(`Seeded Deck 2 with ${academic55Words.length} cards.`);
  } else {
    console.log("Deck 2 already exists.");
  }

  // 3. Deck 3: Urban Architecture & Heritage — 60 Core Words (B2–C2)
  let deck60 = await prisma.deck.findFirst({
    where: { title: "Urban Architecture & Heritage — 60 Core Words (B2–C2)" },
  });

  if (!deck60 && urban60Words.length > 0) {
    deck60 = await prisma.deck.create({
      data: {
        title: "Urban Architecture & Heritage — 60 Core Words (B2–C2)",
        description:
          "Tarixiy me'morchilik, shaharsozlik va barqaror rivojlanish mavzusidagi 60 ta eng muhim B2, C1 va C2 darajadagi leksika va iboralar to'plami. Har bir so'z o'zbekcha tarjima, boy sinonimlar va kontekstual akademik namunalar bilan boyitilgan.",
        level: "B2-C2",
        isPublic: true,
      },
    });

    for (const w of urban60Words) {
      const card = await prisma.card.create({
        data: {
          deckId: deck60.id,
          termEn: w.term_en,
          meaningUz: w.meaning_uz,
          synonyms: w.synonyms || null,
          exampleEn: w.example_en || null,
        },
      });

      // Default system progress (userId: null)
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
    console.log(`Seeded Deck 3 with ${urban60Words.length} cards.`);
  } else {
    console.log("Deck 3 already exists.");
  }

  // 3. Deck 3: Architecture & Urban Development — 60 Words
  if (urban60Words.length > 0) {
    let deck60 = await prisma.deck.findFirst({
      where: { title: "Architecture & Urban Development — 60 Words" },
    });

    if (!deck60) {
      deck60 = await prisma.deck.create({
        data: {
          title: "Architecture & Urban Development — 60 Words",
          description:
            "Shaharsozlik, arxitektura va madaniy merosni saqlash mavzulariga oid 60 ta muhim akademik so'z va iboralar to'plami.",
          level: "C1",
          isPublic: true,
        },
      });

      for (const w of urban60Words) {
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
      console.log(`Seeded Deck 3 with ${urban60Words.length} cards.`);
    } else {
      console.log("Deck 3 already exists.");
    }
  }

  // 4. Deck 4: Deep Reading: The Baobabs of Madagascar — 37 Words
  if (baobabs37Words.length > 0) {
    let deckBaobabs = await prisma.deck.findFirst({
      where: {
        OR: [
          { title: "Deep Reading: The Baobabs of Madagascar — 37 Words" },
          { title: "IELTS Reading P1: The Baobabs of Madagascar — 37 Words" },
          { title: "Reading Passage 1: The Baobabs of Madagascar" },
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

      for (const w of baobabs37Words) {
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
      console.log(`Seeded Deck 4 (Baobabs) with ${baobabs37Words.length} cards.`);
    } else {
      console.log("Deck 4 (Baobabs) already exists.");
    }
  }

  // 5. Deck 5: Deep Reading: Coins – The First Form of Money — 38 Words
  if (coins38Words.length > 0) {
    let deckCoins = await prisma.deck.findFirst({
      where: {
        OR: [
          { title: "Deep Reading: Coins – The First Form of Money — 38 Words" },
          { title: "IELTS Reading P2: Coins – The First Form of Money — 38 Words" },
          { title: "Reading Passage 2: Coins – the first form of money" },
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

      for (const w of coins38Words) {
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
      console.log(`Seeded Deck 5 (Coins) with ${coins38Words.length} cards.`);
    } else {
      console.log("Deck 5 (Coins) already exists.");
    }
  }

  // 6. Deck 6: Deep Reading: Creating a Better Grapefruit — 31 Words
  if (grapefruit31Words.length > 0) {
    let deckGrapefruit = await prisma.deck.findFirst({
      where: {
        OR: [
          { title: "Deep Reading: Creating a Better Grapefruit — 31 Words" },
          { title: "IELTS Reading P3: Creating a Better Grapefruit — 31 Words" },
          { title: "Reading Passage 3: Creating a Better Grapefruit" },
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

      for (const w of grapefruit31Words) {
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
      console.log(`Seeded Deck 6 (Grapefruit) with ${grapefruit31Words.length} cards.`);
    } else {
      console.log("Deck 6 (Grapefruit) already exists.");
    }
  }

  // 7. Deck 7: Cambridge Top 2000: Oltin Leksika — 2000 Words
  if (ieltsTop2000Words.length > 0) {
    let deck2000 = await prisma.deck.findFirst({
      where: {
        OR: [
          { title: "Cambridge Top 2000: Oltin Leksika" },
          { title: "Cambridge IELTS 10–14: Top 2000 Academic Vocabulary" },
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
      for (let i = 0; i < ieltsTop2000Words.length; i += chunkSize) {
        const chunk = ieltsTop2000Words.slice(i, i + chunkSize);
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
      console.log(`Seeded Deck 7 (Top 2000) with ${ieltsTop2000Words.length} cards.`);
    } else {
      console.log("Deck 7 (Top 2000) already exists.");
    }
  }

  // 8. Deck 8: Luck vs Grit — 69 Words (B2–C2)
  if (luckVsGrit69Words.length > 0) {
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

      for (const w of luckVsGrit69Words) {
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
      console.log(`Seeded Deck 8 (Luck vs Grit) with ${luckVsGrit69Words.length} cards.`);
    } else {
      console.log("Deck 8 (Luck vs Grit) already exists.");
    }
  }

  // 9. Deck 9: English as a Global Language — 72 Words (B2–C2)
  if (englishGlobalLanguage72Words.length > 0) {
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

      for (const w of englishGlobalLanguage72Words) {
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
      console.log(`Seeded Deck 9 (English as a Global Language) with ${englishGlobalLanguage72Words.length} cards.`);
    } else {
      console.log("Deck 9 (English as a Global Language) already exists.");
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
