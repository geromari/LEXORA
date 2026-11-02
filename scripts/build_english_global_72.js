const fs = require('fs');
const path = require('path');

const words = [
  {
    number: 1,
    level: "B2",
    term_en: "Interconnected",
    meaning_uz: "o'zaro bog'langan",
    synonyms: "linked, interrelated, interwoven, connected",
    example_en: "In today's interconnected world, economic and linguistic trends cross borders in a matter of seconds."
  },
  {
    number: 2,
    level: "B2",
    term_en: "Stumbling block",
    meaning_uz: "to'siq, halaqit beruvchi narsa",
    synonyms: "obstacle, hurdle, barrier, impediment",
    example_en: "Unfamiliar idioms can become a serious stumbling block for non-native English speakers."
  },
  {
    number: 3,
    level: "B2",
    term_en: "Dominance",
    meaning_uz: "hukmronlik",
    synonyms: "supremacy, hegemony, mastery, predominance",
    example_en: "The global dominance of English in scientific publications creates significant hurdles for researchers from non-Anglophone countries."
  },
  {
    number: 4,
    level: "B2",
    term_en: "Invention",
    meaning_uz: "ixtiro",
    synonyms: "creation, breakthrough, innovation, contrivance",
    example_en: "The invention of artificial international auxiliary languages like Esperanto aimed to bridge cross-cultural divides."
  },
  {
    number: 5,
    level: "B2",
    term_en: "Universal",
    meaning_uz: "umumiy, butun dunyoga oid",
    synonyms: "global, worldwide, ubiquitous, all-encompassing",
    example_en: "Philosophers have long dreamed of a universal language that could eliminate misunderstandings between nations."
  },
  {
    number: 6,
    level: "B2",
    term_en: "Neutral",
    meaning_uz: "betaraf",
    synonyms: "impartial, unbiased, objective, non-partisan",
    example_en: "Constructed languages were designed to be politically and culturally neutral."
  },
  {
    number: 7,
    level: "B2",
    term_en: "Favoritism",
    meaning_uz: "tarafkashlik",
    synonyms: "bias, partiality, preferential treatment, nepotism",
    example_en: "Using a single national language globally inevitably invites accusations of favoritism."
  },
  {
    number: 8,
    level: "B2",
    term_en: "Lingua franca",
    meaning_uz: "xalqaro aloqa tili",
    synonyms: "common tongue, bridge language, vehicular language",
    example_en: "English functions as the modern lingua franca of international aviation, shipping, and scientific research."
  },
  {
    number: 9,
    level: "B2",
    term_en: "Globalization",
    meaning_uz: "globallashuv",
    synonyms: "internationalization, worldwide integration, global expansion",
    example_en: "Rapid globalization has heightened the necessity of communicating through a shared linguistic medium."
  },
  {
    number: 10,
    level: "B2",
    term_en: "Barrier",
    meaning_uz: "to'siq",
    synonyms: "obstacle, hindrance, barricade, blockade",
    example_en: "Differences in language can form an insurmountable barrier to trade and mutual understanding."
  },
  {
    number: 11,
    level: "B2",
    term_en: "Miscommunication",
    meaning_uz: "noto'g'ri aloqa, tushunmovchilik",
    synonyms: "misunderstanding, misinterpretation, confusion, cross-purposes",
    example_en: "Subtle differences in cultural nuance frequently lead to diplomatic miscommunication."
  },
  {
    number: 12,
    level: "B2",
    term_en: "Standardized",
    meaning_uz: "standartlashtirilgan",
    synonyms: "normalized, uniform, regulated, systematized",
    example_en: "International pilots are required to speak standardized phraseology to prevent fatal accidents."
  },
  {
    number: 13,
    level: "B2",
    term_en: "Accessible",
    meaning_uz: "qulay, hammaga tushunarli",
    synonyms: "approachable, available, comprehensible, reachable",
    example_en: "A language should be phonetically accessible and structurally transparent for beginners."
  },
  {
    number: 14,
    level: "B2",
    term_en: "Accident",
    meaning_uz: "tasodif, falokat",
    synonyms: "mishap, coincidence, chance occurrence, casualty",
    example_en: "The global supremacy of English was not a mere historical accident, but the outcome of empire and commerce."
  },
  {
    number: 15,
    level: "B2",
    term_en: "Consequence",
    meaning_uz: "oqibat",
    synonyms: "result, outcome, repercussion, ramification",
    example_en: "Linguistic homogenization is an unintended consequence of modern economic integration."
  },
  {
    number: 16,
    level: "B2",
    term_en: "Risk",
    meaning_uz: "xavf",
    synonyms: "peril, hazard, danger, jeopardy",
    example_en: "Without deliberate preservation efforts, minority dialects run the risk of total extinction."
  },
  {
    number: 17,
    level: "B2",
    term_en: "Rule",
    meaning_uz: "qoida",
    synonyms: "regulation, precept, guideline, principle",
    example_en: "Esperanto was engineered with strictly regular grammatical rules and zero irregular verbs."
  },
  {
    number: 18,
    level: "B2",
    term_en: "Advantage",
    meaning_uz: "ustunlik",
    synonyms: "benefit, edge, asset, upper hand",
    example_en: "Native fluency in the global lingua franca confers an immense economic advantage."
  },
  {
    number: 19,
    level: "B2",
    term_en: "Irregular",
    meaning_uz: "tartibsiz",
    synonyms: "anomalous, erratic, inconsistent, non-standard",
    example_en: "English spelling is notoriously irregular, making literacy acquisition notoriously demanding."
  },
  {
    number: 20,
    level: "B2",
    term_en: "Subtlety",
    meaning_uz: "noziklik, murakkablik",
    synonyms: "nuance, delicacy, intricacy, refinement",
    example_en: "Translating poetry requires mastering every delicate subtlety of the source language."
  },
  {
    number: 21,
    level: "B2",
    term_en: "Consistent",
    meaning_uz: "izchil",
    synonyms: "coherent, uniform, steady, dependable",
    example_en: "Learners thrive when grammatical systems are logically consistent and predictable."
  },
  {
    number: 22,
    level: "B2",
    term_en: "Measurement",
    meaning_uz: "o'lchov",
    synonyms: "metric, appraisal, gauge, quantification",
    example_en: "Standardized test scores provide a uniform measurement of international communication competency."
  },
  {
    number: 23,
    level: "B2",
    term_en: "Cultural dominance",
    meaning_uz: "madaniy hukmronlik",
    synonyms: "cultural hegemony, cultural imperialism, soft supremacy",
    example_en: "The worldwide proliferation of Western cinema has reinforced American cultural dominance."
  },
  {
    number: 24,
    level: "B2",
    term_en: "Identity",
    meaning_uz: "o'zlik",
    synonyms: "individuality, distinctiveness, selfhood, persona",
    example_en: "Mother tongues are deeply intertwined with ancestral identity and community pride."
  },
  {
    number: 25,
    level: "B2",
    term_en: "Emotion",
    meaning_uz: "his-tuyg'u",
    synonyms: "sentiment, feeling, passion, affection",
    example_en: "Many bilingual individuals feel that authentic emotion is expressed most sincerely in their native tongue."
  },
  {
    number: 26,
    level: "B2",
    term_en: "Memory",
    meaning_uz: "xotira",
    synonyms: "retention, recall, recollection, remembrance",
    example_en: "Words learned alongside meaningful personal memories stay rooted in long-term retention."
  },
  {
    number: 27,
    level: "B2",
    term_en: "Efficient",
    meaning_uz: "samarali",
    synonyms: "streamlined, productive, effective, economical",
    example_en: "Conducting global conferences in one shared language provides an efficient working protocol."
  },
  {
    number: 28,
    level: "B2",
    term_en: "Resistant",
    meaning_uz: "qarshilik qiluvchi",
    synonyms: "reluctant, defiant, unyielding, opposed",
    example_en: "Traditional communities can be resistant to foreign language mandates in public schools."
  },
  {
    number: 29,
    level: "B2",
    term_en: "Investment",
    meaning_uz: "sarmoya",
    synonyms: "expenditure, venture, commitment, outlay",
    example_en: "Mastering a global language requires a colossal investment of time and focused practice."
  },
  {
    number: 30,
    level: "B2",
    term_en: "Mandate",
    meaning_uz: "majburiy qilish",
    synonyms: "decree, directive, order, injunction",
    example_en: "The educational ministry introduced a mandate requiring foreign language instruction from primary school."
  },
  {
    number: 31,
    level: "C1",
    term_en: "Provocative",
    meaning_uz: "bahs uyg'otuvchi",
    synonyms: "contentious, stimulating, inflammatory, challenging",
    example_en: "The professor's provocative essay questioned whether English ought to remain the world's academic default."
  },
  {
    number: 32,
    level: "C1",
    term_en: "Hierarchy",
    meaning_uz: "ierarxiya, pog'ona tizimi",
    synonyms: "pecking order, stratification, ranking, grading",
    example_en: "Linguistic prestige creates an informal hierarchy where certain dialects are prized over others."
  },
  {
    number: 33,
    level: "C1",
    term_en: "Favoritism",
    meaning_uz: "tarafkashlik, yon bosish",
    synonyms: "partiality, bias, cronyism, nepotism",
    example_en: "Institutional favoritism toward native speakers marginalizes equally qualified multilingual scholars."
  },
  {
    number: 34,
    level: "C1",
    term_en: "Subconscious",
    meaning_uz: "ongsiz ravishda",
    synonyms: "subliminal, latent, instinctive, unmindful",
    example_en: "Speakers often harbor subconscious prejudices regarding non-standard accents."
  },
  {
    number: 35,
    level: "C1",
    term_en: "Elusive",
    meaning_uz: "qiyin tushunarli, ushlash mushkul",
    synonyms: "intangible, fleeting, enigmatic, evasive",
    example_en: "Capturing the true essence of an ancient poem in another tongue remains famously elusive."
  },
  {
    number: 36,
    level: "C1",
    term_en: "Purpose-built",
    meaning_uz: "maxsus qurilgan",
    synonyms: "custom-designed, tailor-made, bespoke, engineered",
    example_en: "Esperanto is a purpose-built language conceived to democratize international dialogue."
  },
  {
    number: 37,
    level: "C1",
    term_en: "Engineered",
    meaning_uz: "sun'iy yaratilgan",
    synonyms: "constructed, fabricated, designed, synthesized",
    example_en: "An engineered language eliminates the grammatical irregularities that plague organic tongues."
  },
  {
    number: 38,
    level: "C1",
    term_en: "Democratize",
    meaning_uz: "tenglashtirmoq",
    synonyms: "equalize, broaden access, popularize, emancipate",
    example_en: "Affordable translation software helps democratize international scientific participation."
  },
  {
    number: 39,
    level: "C1",
    term_en: "Flattening",
    meaning_uz: "tekislashtirish, bir xil qilish",
    synonyms: "homogenizing, leveling, uniformizing, neutralizing",
    example_en: "Critics worry that global monoculture leads to a flattening of diverse cultural idioms."
  },
  {
    number: 40,
    level: "C1",
    term_en: "Sterile",
    meaning_uz: "samarasiz, bepusht",
    synonyms: "lifeless, bland, uninspired, barren",
    example_en: "Skeptics dismissed artificial communication systems as sterile, devoid of living historical lore."
  },
  {
    number: 41,
    level: "C1",
    term_en: "Logistics",
    meaning_uz: "tashkiliy jarayonlar, logistika",
    synonyms: "coordination, planning, organization, orchestration",
    example_en: "Managing simultaneous interpretation across twenty official languages poses formidable logistics."
  },
  {
    number: 42,
    level: "C1",
    term_en: "Colossal",
    meaning_uz: "ulkan, behad katta",
    synonyms: "gigantic, gargantuan, immense, mammoth",
    example_en: "Maintaining multilingual governmental machinery demands a colossal financial expenditure."
  },
  {
    number: 43,
    level: "C1",
    term_en: "Compel",
    meaning_uz: "majbur qilmoq",
    synonyms: "coerce, oblige, impel, enforce",
    example_en: "Commercial pressure can compel small firms to conduct internal meetings exclusively in English."
  },
  {
    number: 44,
    level: "C1",
    term_en: "Resistance",
    meaning_uz: "qarshilik",
    synonyms: "opposition, defiance, pushback, antagonism",
    example_en: "The proposed language reform was met with stiff cultural resistance from local poets and educators."
  },
  {
    number: 45,
    level: "C1",
    term_en: "Implementation",
    meaning_uz: "amalga oshirish",
    synonyms: "execution, enactment, deployment, realization",
    example_en: "The effective implementation of bilingual schooling requires years of curriculum development."
  },
  {
    number: 46,
    level: "C1",
    term_en: "Leapfrog",
    meaning_uz: "sakrab o'tmoq, tezda tashlab o'tmoq",
    synonyms: "bypass, vault over, skip past, outpace",
    example_en: "Modern digital classrooms enable students to leapfrog outdated rote-learning methodologies."
  },
  {
    number: 47,
    level: "C1",
    term_en: "Geopolitical",
    meaning_uz: "geosiyosiy",
    synonyms: "geo-strategic, international-relations, power-political",
    example_en: "Linguistic reach is frequently an index of geopolitical and economic supremacy."
  },
  {
    number: 48,
    level: "C1",
    term_en: "Undertone",
    meaning_uz: "yashirin ma'no",
    synonyms: "undercurrent, nuance, suggestion, subtext",
    example_en: "His speech contained an unmistakable nationalist undertone beneath polite diplomatic rhetoric."
  },
  {
    number: 49,
    level: "C1",
    term_en: "Soft power",
    meaning_uz: "yumshoq kuch (madaniy ta'sir)",
    synonyms: "cultural diplomacy, indirect influence, persuasive clout",
    example_en: "Music, literature, and cinema are cornerstones of a country's soft power overseas."
  },
  {
    number: 50,
    level: "C1",
    term_en: "Bias",
    meaning_uz: "tarafkashlik, og'ish",
    synonyms: "prejudice, slant, predisposition, skew",
    example_en: "Peer reviewers must guard against subconscious bias when reading manuscripts with foreign syntax."
  },
  {
    number: 51,
    level: "C1",
    term_en: "Standardization",
    meaning_uz: "standartlashtirish",
    synonyms: "codification, normalization, harmonization, regulation",
    example_en: "The standardization of technical vocabulary guarantees safety across global air traffic controllers."
  },
  {
    number: 52,
    level: "C1",
    term_en: "Appeal",
    meaning_uz: "joziba, da'vat",
    synonyms: "attraction, allure, resonance, plea",
    example_en: "The international appeal of studying abroad has created unprecedented demand for English tests."
  },
  {
    number: 53,
    level: "C1",
    term_en: "Dilute",
    meaning_uz: "suyultirmoq, zaiflashtirmoq",
    synonyms: "water down, attenuate, diminish, weaken",
    example_en: "Adopting pervasive loanwords from abroad can gradually dilute traditional lexicon."
  },
  {
    number: 54,
    level: "C1",
    term_en: "Formidable",
    meaning_uz: "qo'rqinchli, katta",
    synonyms: "daunting, redoubtable, intimidating, arduous",
    example_en: "Acquiring C2 native-level mastery remains a formidable hurdle for adult language students."
  },
  {
    number: 55,
    level: "C1",
    term_en: "Herculean",
    meaning_uz: "g'oyat qiyin, og'ir",
    synonyms: "monumental, arduous, colossal, backbreaking",
    example_en: "Translating encyclopedia volumes into under-resourced languages is a Herculean undertaking."
  },
  {
    number: 56,
    level: "C1",
    term_en: "Fairness",
    meaning_uz: "adolat",
    synonyms: "equity, justice, impartiality, even-handedness",
    example_en: "A fair international community ensures that linguistic background does not dictate career ceilings."
  },
  {
    number: 57,
    level: "C1",
    term_en: "Clarity",
    meaning_uz: "aniqlik",
    synonyms: "lucidity, precision, transparency, coherence",
    example_en: "Unambiguous clarity is paramount when drafting binding multilateral peace treaties."
  },
  {
    number: 58,
    level: "C1",
    term_en: "Diversity",
    meaning_uz: "xilma-xillik",
    synonyms: "variety, heterogeneity, multiplicity, plurality",
    example_en: "Linguistic diversity safeguards distinct human worldviews and indigenous ecological knowledge."
  },
  {
    number: 59,
    level: "C1",
    term_en: "Heritage",
    meaning_uz: "meros",
    synonyms: "legacy, inheritance, tradition, patrimony",
    example_en: "Folklore passed down through centuries constitutes irreplaceable cultural heritage."
  },
  {
    number: 60,
    level: "C2",
    term_en: "Pitfall",
    meaning_uz: "yashirin xavf, qiyinchilik",
    synonyms: "hidden trap, hazard, snag, peril",
    example_en: "A common pitfall in translation is relying on false friends that mirror words in the target language."
  },
  {
    number: 61,
    level: "C2",
    term_en: "Cultural richness",
    meaning_uz: "madaniy boylik",
    synonyms: "cultural depth, cultural wealth, civilizational abundance",
    example_en: "The untranslatable metaphors of native speeches reflect exceptional cultural richness."
  },
  {
    number: 62,
    level: "C2",
    term_en: "Bloodless",
    meaning_uz: "jonli hislardan xoli",
    synonyms: "lifeless, anaemic, insipid, clinical",
    example_en: "Artificially synthesized speech often strikes audiences as bloodless and detached."
  },
  {
    number: 63,
    level: "C2",
    term_en: "Kaleidoscope",
    meaning_uz: "xilma-xillik, rang-baranglik",
    synonyms: "variegated tapestry, medley, mosaic, spectrum",
    example_en: "The historic bazaar resonated with a colorful kaleidoscope of accents from across Eurasia."
  },
  {
    number: 64,
    level: "C2",
    term_en: "Monotone",
    meaning_uz: "bir ohangli, zerikarli",
    synonyms: "unvaried, repetitive, uniform, dreary",
    example_en: "A monocultural society risks lapsing into linguistic monotone."
  },
  {
    number: 65,
    level: "C2",
    term_en: "Logistical nightmare",
    meaning_uz: "tashkiliy dahshat",
    synonyms: "operational catastrophe, organizational chaos, coordination morass",
    example_en: "Coordinating simultaneous translation for delegates across forty language pairs became a logistical nightmare."
  },
  {
    number: 66,
    level: "C2",
    term_en: "Leapfrogged the problem",
    meaning_uz: "muammoni sakrab o'tib ketmoq",
    synonyms: "bypassed the obstacle, skirted the dilemma, superseded the issue",
    example_en: "Real-time AI earpieces leapfrogged the problem of manual conference interpretation."
  },
  {
    number: 67,
    level: "C2",
    term_en: "Worldview",
    meaning_uz: "dunyoqarash",
    synonyms: "Weltanschauung, philosophy, paradigm, cosmic outlook",
    example_en: "Each indigenous dialect embeds an intricate ecological worldview evolved over millennia."
  },
  {
    number: 68,
    level: "C2",
    term_en: "Yearning for unity",
    meaning_uz: "birlikka chanqoqlik",
    synonyms: "aspiration for concord, thirst for harmony, longing for solidarity",
    example_en: "The creation of universal auxiliary languages mirrored humanity's yearning for unity in the shadow of war."
  },
  {
    number: 69,
    level: "C2",
    term_en: "Unfair leg up",
    meaning_uz: "adolatsiz ustunlik",
    synonyms: "unearned advantage, undue head start, unfair edge",
    example_en: "Growing up in an English-speaking metropolis grants applicants an unfair leg up in international competitions."
  },
  {
    number: 70,
    level: "C2",
    term_en: "Sweeping away",
    meaning_uz: "butunlay olib tashlash",
    synonyms: "eradicating, obliterating, purging, wiping out",
    example_en: "Hyper-urbanization risks sweeping away regional dialects before they can be linguistically documented."
  },
  {
    number: 71,
    level: "C2",
    term_en: "Cacophony",
    meaning_uz: "g'ala-g'ovur, chalg'ituvchi tovushlar uyg'unligi",
    synonyms: "dissonance, clamor, tumult, bedlam",
    example_en: "Without synchronized translation headsets, the summit chamber devolved into an impenetrable cacophony."
  },
  {
    number: 72,
    level: "C2",
    term_en: "Profound expression",
    meaning_uz: "chuqur ifoda",
    synonyms: "deep manifestation, poignant articulation, rich disclosure",
    example_en: "Classical epic literature represents the most profound expression of a civilization's spiritual heritage."
  }
];

// Write to prisma/english_global_language_72.json
const jsonPath = path.join(__dirname, '../prisma/english_global_language_72.json');
fs.writeFileSync(jsonPath, JSON.stringify(words, null, 2), 'utf-8');
console.log(`Saved ${words.length} words to ${jsonPath}`);

// Also update prisma/seed_words.json
const seedWordsPath = path.join(__dirname, '../prisma/seed_words.json');
const seedWords = JSON.parse(fs.readFileSync(seedWordsPath, 'utf-8'));
seedWords['english_global_language_72'] = words;
fs.writeFileSync(seedWordsPath, JSON.stringify(seedWords, null, 2), 'utf-8');
console.log(`Updated prisma/seed_words.json with key 'english_global_language_72' (${words.length} items)`);
