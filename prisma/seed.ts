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

  // 1. Deck 1: IELTS Reading Advanced — 47 Core Words
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

  // 2. Deck 2: IELTS & Academic Mastery — 55 Core Words (C1–C2)
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

  // 4. Deck 4: IELTS Reading P1: The Baobabs of Madagascar — 37 Words
  if (baobabs37Words.length > 0) {
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

  // 5. Deck 5: IELTS Reading P2: Coins – The First Form of Money — 38 Words
  if (coins38Words.length > 0) {
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

  // 6. Deck 6: IELTS Reading P3: Creating a Better Grapefruit — 31 Words
  if (grapefruit31Words.length > 0) {
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
