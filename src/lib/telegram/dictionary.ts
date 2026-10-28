import prisma from "../prisma";
import { escapeHtml } from "./api";
import { WordLookupResult } from "./types";
import seedWordsData from "../../../prisma/seed_words.json";

// Curated high-yield academic lexicon for instant, offline lookups
const CURATED_LEXICON: Record<
  string,
  { meaning_uz: string; level: string; synonyms: string; example_en: string; phonetic?: string }
> = {
  scrutinize: {
    meaning_uz: "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
    level: "C1",
    synonyms: "examine closely, audit, inspect, analyze",
    example_en: "Regulatory authorities must scrutinize all financial disclosures thoroughly.",
    phonetic: "/ˈskruː.tɪ.naɪz/",
  },
  thrive: {
    meaning_uz: "gullab-yashnamoq, ravnaq topmoq, muvaffaqiyat qozonmoq",
    level: "C1",
    synonyms: "flourish, prosper, burgeon, blossom",
    example_en: "Innovative startups thrive in supportive economic and academic environments.",
    phonetic: "/θraɪv/",
  },
  foster: {
    meaning_uz: "rivojlantirmoq, rag'batlantirmoq, mehr bilan parvarishlamoq",
    level: "B2/C1",
    synonyms: "cultivate, encourage, nurture, promote",
    example_en: "Collaborative academic seminars foster intellectual maturity among peers.",
    phonetic: "/ˈfɒs.tər/",
  },
  exacerbate: {
    meaning_uz: "kuchaytirib yubormoq, yomonlashtirmoq, og'irlashtirmoq",
    level: "C1",
    synonyms: "aggravate, worsen, intensify, inflame",
    example_en: "Unchecked price inflation continues to exacerbate socio-economic anxiety.",
    phonetic: "/ɪɡˈzæs.ə.beɪt/",
  },
  resilient: {
    meaning_uz: "bardoshli, chidamli, tez o'zini tiklaydigan",
    level: "C1",
    synonyms: "hardy, robust, adaptable, flexible",
    example_en: "Coastal agriculture requires resilient crop varieties to endure climate anomalies.",
    phonetic: "/rɪˈzɪl.jənt/",
  },
  indispensable: {
    meaning_uz: "ajralmas, juda muhim, ularsiz iloji bo'lmagan",
    level: "C1",
    synonyms: "vital, crucial, essential, pivotal",
    example_en: "Critical thinking is indispensable for academic distinction in higher education.",
    phonetic: "/ˌɪn.dɪˈspen.sə.bəl/",
  },
  comprehensive: {
    meaning_uz: "har tomonlama, keng qamrovli, batafsil",
    level: "B2/C1",
    synonyms: "exhaustive, all-inclusive, thorough, broad",
    example_en: "The Ministry announced a comprehensive reform package for scientific research.",
    phonetic: "/ˌkɒm.prɪˈhen.sɪv/",
  },
  inevitable: {
    meaning_uz: "muqarrar, qochib qutulib bo'lmaydigan",
    level: "B2/C1",
    synonyms: "unavoidable, inescapable, assured",
    example_en: "Technological automation is an inevitable milestone of the modern economy.",
    phonetic: "/ɪnˈev.ɪ.tə.bəl/",
  },
  lucrative: {
    meaning_uz: "katta daromad keltiruvchi, serdaromad",
    level: "C1",
    synonyms: "profitable, gainful, high-yielding",
    example_en: "Artificial intelligence development has emerged as a highly lucrative industry.",
    phonetic: "/ˈluː.krə.tɪv/",
  },
  ubiquitous: {
    meaning_uz: "hamma joyda mavjud, keng tarqalgan",
    level: "C2",
    synonyms: "omnipresent, pervasive, everywhere",
    example_en: "Smartphones have become an ubiquitous fixture of modern urban existence.",
    phonetic: "/juːˈbɪk.wɪ.təs/",
  },
  diligent: {
    meaning_uz: "qunt bilan ishlovchi, tirishqoq, g'ayratli",
    level: "B2",
    synonyms: "assiduous, painstaking, hard-working",
    example_en: "Diligent scholars routinely outperform those who rely solely on natural flair.",
    phonetic: "/ˈdɪl.ɪ.dʒənt/",
  },
  meticulous: {
    meaning_uz: "mayda detallarigacha sinchiklab bajarilgan, nihoyatda e'tiborli",
    level: "C1",
    synonyms: "punctilious, painstaking, scrupulous",
    example_en: "Scientific laboratories enforce meticulous adherence to hygiene protocols.",
    phonetic: "/məˈtɪk.jə.ləs/",
  },
  sustainable: {
    meaning_uz: "barqaror, uzoq muddat davom eta oladigan",
    level: "B2",
    synonyms: "viable, durable, self-supporting",
    example_en: "Renewable energy provides the only sustainable solution for the planet.",
    phonetic: "/səˈsteɪ.nə.bəl/",
  },
};

/**
 * Multi-tiered lookup:
 * 1. Database Card table match
 * 2. Seed Words / Local Curated Lexicon
 * 3. Free Dictionary API + MyMemory translation
 * 4. Auto-save in DB so it's instantly available for quiz & review
 */
export async function smartLookupWord(queryRaw: string): Promise<WordLookupResult | null> {
  const cleanTerm = queryRaw.trim().toLowerCase();
  if (!cleanTerm || cleanTerm.length > 80) return null;

  // 1. Check Database Cards
  const existingCard = await prisma.card.findFirst({
    where: {
      termEn: {
        equals: cleanTerm,
        mode: "insensitive",
      },
    },
    include: { deck: true },
  });

  if (existingCard) {
    return {
      termEn: existingCard.termEn,
      meaningUz: existingCard.meaningUz,
      phonetic: CURATED_LEXICON[cleanTerm]?.phonetic,
      partOfSpeech: "academic term",
      level: existingCard.deck?.level || "C1",
      synonyms: existingCard.synonyms || undefined,
      exampleEn: existingCard.exampleEn || undefined,
      cardId: existingCard.id,
      source: "database",
    };
  }

  // 2. Check Seed words data
  const allSeedWords = [
    ...(seedWordsData.core_47 || []),
    ...(seedWordsData.academic_55 || []),
  ];
  const seedMatch = allSeedWords.find(
    (w) => w.term_en.toLowerCase() === cleanTerm
  );

  if (seedMatch) {
    const card = await ensureDefaultDeckAndCard(
      cleanTerm,
      seedMatch.meaning_uz,
      seedMatch.synonyms || "academic vocabulary",
      seedMatch.example_en || `Mastering "${cleanTerm}" elevates academic writing.`
    );

    return {
      termEn: seedMatch.term_en,
      meaningUz: seedMatch.meaning_uz,
      level: "C1",
      synonyms: seedMatch.synonyms,
      exampleEn: seedMatch.example_en,
      cardId: card.id,
      source: "curated",
    };
  }

  // 3. Check Curated local lexicon
  if (CURATED_LEXICON[cleanTerm]) {
    const item = CURATED_LEXICON[cleanTerm];
    const card = await ensureDefaultDeckAndCard(
      cleanTerm,
      item.meaning_uz,
      item.synonyms,
      item.example_en
    );

    return {
      termEn: cleanTerm,
      meaningUz: item.meaning_uz,
      phonetic: item.phonetic,
      level: item.level,
      synonyms: item.synonyms,
      exampleEn: item.example_en,
      cardId: card.id,
      source: "curated",
    };
  }

  // 4. Online Dictionary + Translation APIs
  try {
    const [dictData, translationData] = await Promise.allSettled([
      fetchFreeDictionary(cleanTerm),
      fetchMyMemoryTranslation(cleanTerm),
    ]);

    let meaningUz = "";
    let phonetic = "";
    let partOfSpeech = "";
    let synonyms = "";
    let exampleEn = "";

    if (dictData.status === "fulfilled" && dictData.value) {
      phonetic = dictData.value.phonetic || "";
      partOfSpeech = dictData.value.partOfSpeech || "";
      synonyms = dictData.value.synonyms || "";
      exampleEn = dictData.value.exampleEn || "";
    }

    if (translationData.status === "fulfilled" && translationData.value) {
      meaningUz = translationData.value;
    }

    // If translation is empty or same as input, provide informative fallback
    if (!meaningUz || meaningUz.toLowerCase() === cleanTerm) {
      meaningUz = `${cleanTerm} — inglizcha so'z/ibora`;
    }

    if (!exampleEn) {
      exampleEn = `Academic researchers frequently utilize the term "${cleanTerm}" in scholarly discourse.`;
    }

    const card = await ensureDefaultDeckAndCard(
      cleanTerm,
      meaningUz,
      synonyms || "academic vocabulary",
      exampleEn
    );

    return {
      termEn: cleanTerm,
      meaningUz,
      phonetic: phonetic || undefined,
      partOfSpeech: partOfSpeech || undefined,
      level: "C1",
      synonyms: synonyms || undefined,
      exampleEn,
      cardId: card.id,
      source: "api",
    };
  } catch (err) {
    console.warn("Online dictionary lookup failed for:", cleanTerm, err);
  }

  return null;
}

interface FreeDictEntry {
  phonetic?: string;
  phonetics?: Array<{ text?: string }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{ definition?: string; example?: string }>;
    synonyms?: string[];
  }>;
}

async function fetchFreeDictionary(word: string) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as FreeDictEntry[];
    if (!Array.isArray(data) || !data.length) return null;

    const entry = data[0];
    const phonetic =
      entry.phonetic ||
      entry.phonetics?.find((p) => Boolean(p.text))?.text ||
      "";
    const firstMeaning = entry.meanings?.[0];
    const partOfSpeech = firstMeaning?.partOfSpeech || "";
    const definition = firstMeaning?.definitions?.[0]?.definition || "";
    const example = firstMeaning?.definitions?.[0]?.example || "";
    const synonymsList: string[] = [];

    if (firstMeaning?.synonyms && Array.isArray(firstMeaning.synonyms)) {
      synonymsList.push(...firstMeaning.synonyms.slice(0, 3));
    }

    return {
      phonetic,
      partOfSpeech,
      definition,
      exampleEn: example,
      synonyms: synonymsList.join(", "),
    };
  } catch {
    return null;
  }
}

async function fetchMyMemoryTranslation(word: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|uz`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const text = data?.responseData?.translatedText;
    if (text && typeof text === "string" && text.toLowerCase() !== word.toLowerCase()) {
      return text.trim();
    }
    return null;
  } catch {
    return null;
  }
}

async function ensureDefaultDeckAndCard(
  termEn: string,
  meaningUz: string,
  synonyms: string,
  exampleEn: string
) {
  let deck = await prisma.deck.findFirst({
    where: { isPublic: true },
  });

  if (!deck) {
    deck = await prisma.deck.create({
      data: {
        title: "IELTS & Academic Core",
        description: "Akademik so'zlar va iboralar to'plami",
        level: "C1",
        isPublic: true,
      },
    });
  }

  const card = await prisma.card.create({
    data: {
      deckId: deck.id,
      termEn,
      meaningUz,
      synonyms,
      exampleEn,
    },
  });

  return card;
}

/**
 * Formats a WordLookupResult into beautiful Telegram HTML
 */
export function formatWordCardHtml(item: WordLookupResult): string {
  const term = escapeHtml(item.termEn.toUpperCase());
  const phonetic = item.phonetic ? ` <code>${escapeHtml(item.phonetic)}</code>` : "";
  const levelBadge = item.level ? ` [<b>${escapeHtml(item.level)}</b>]` : " [<b>C1</b>]";
  const pos = item.partOfSpeech ? ` <i>(${escapeHtml(item.partOfSpeech)})</i>` : "";

  let html = `📖 <b>${term}</b>${phonetic}${levelBadge}${pos}\n\n`;
  html += `🇺🇿 <b>O'zbekcha ma'nosi:</b>\n👉 <b>${escapeHtml(item.meaningUz)}</b>\n\n`;

  if (item.synonyms) {
    html += `💡 <b>Sinonimlar:</b>\n<i>${escapeHtml(item.synonyms)}</i>\n\n`;
  }

  if (item.exampleEn) {
    html += `📝 <b>IELTS Namunaviy gap:</b>\n<i>"${escapeHtml(item.exampleEn)}"</i>\n`;
  }

  html += `\n<i>Ushbu so'zni xotirada uzoq saqlash uchun <b>"Lug'atimga saqlash"</b> tugmasini bosing:</i>`;

  return html;
}
