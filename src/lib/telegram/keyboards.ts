import { InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup } from "./types";

export function getMainReplyKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [
        { text: "📚 Mening to'plamlarim" },
        { text: "🔥 Barcha lug'atni takrorlash" },
      ],
      [
        { text: "🗓 Kunlik takrorlash" },
        { text: "⚡️ Tezkor Quiz (5 ta)" },
      ],
      [
        { text: "🔍 Aqlli Lug'at" },
        { text: "✍️ Gap tekshirish" },
      ],
      [
        { text: "📊 Profil & Statistika" },
        { text: "📌 Qiyin so'zlar" },
      ],
      [
        { text: "🌐 Web Platforma ↗️" },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function getWelcomeInlineKeyboard(appUrl: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "📚 Mening to'plamlarim", callback_data: "decks:list" },
        { text: "🔥 Barcha lug'atni takrorlash", callback_data: "quiz:all" },
      ],
      [
        { text: "⚡️ Tezkor Quiz (5 ta)", callback_data: "quiz:start" },
        { text: "🗓 Kunlik takrorlash", callback_data: "review:start" },
      ],
      [
        { text: "📊 Mening Profilim", callback_data: "stats" },
        { text: "📌 Qiyin so'zlarim", callback_data: "hard_words" },
      ],
      [
        { text: "✍️ IELTS Gap Tekshiruvi", callback_data: "check:prompt" },
        { text: "📖 Qo'llanma", callback_data: "help" },
      ],
      [
        { text: "🌐 Veb-Platformani ochish ↗️", url: appUrl },
      ],
    ],
  };
}

export function getDecksListInlineKeyboard(
  decks: Array<{ id: number; title: string; cardCount: number }>,
  totalCards: number
): InlineKeyboardMarkup {
  const buttons: InlineKeyboardButton[][] = [];

  // Yuqorida barcha lug'atni takrorlash imkoni
  buttons.push([
    {
      text: `🔥 Barcha lug'atni takrorlash (${totalCards} ta so'z)`,
      callback_data: "quiz:all",
    },
  ]);

  // Har bir to'plam tugmasi
  for (const deck of decks) {
    buttons.push([
      {
        text: `📁 ${deck.title} (${deck.cardCount} ta so'z)`,
        callback_data: `deck:view:${deck.id}`,
      },
    ]);
  }

  buttons.push([
    { text: "⚡️ Tezkor Quiz (5 ta)", callback_data: "quiz:start" },
    { text: "🔙 Bosh menyu", callback_data: "main_menu" },
  ]);

  return { inline_keyboard: buttons };
}

export function getDeckDetailInlineKeyboard(
  deckId: number,
  cardCount: number
): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `⚡️ Barcha so'zlarni takrorlash (${cardCount} ta)`,
          callback_data: `quiz:deck:${deckId}:all`,
        },
      ],
      [
        {
          text: "⚡️ 5 ta so'zdan tezkor quiz",
          callback_data: `quiz:deck:${deckId}:5`,
        },
      ],
      [
        { text: "🔙 To'plamlar ro'yxati", callback_data: "decks:list" },
        { text: "🏠 Bosh menyu", callback_data: "main_menu" },
      ],
    ],
  };
}

export function getQuizOptionsKeyboard(
  sessionId: string,
  qIndex: number,
  options: string[]
): InlineKeyboardMarkup {
  const letters = ["A", "B", "C", "D"];
  return {
    inline_keyboard: options.map((opt, idx) => [
      {
        text: `${letters[idx]}) ${opt}`,
        callback_data: `qans:${sessionId}:${qIndex}:${idx}`,
      },
    ]),
  };
}

export function getQuizNextKeyboard(
  sessionId: string,
  isLast: boolean
): InlineKeyboardMarkup {
  if (isLast) {
    return {
      inline_keyboard: [
        [
          { text: "🏆 Natijalarni ko'rish", callback_data: `qdone:${sessionId}` },
        ],
      ],
    };
  }

  return {
    inline_keyboard: [
      [
        { text: "Keyingi savol ➡️", callback_data: `qnext:${sessionId}` },
      ],
    ],
  };
}

export function getQuizSummaryKeyboard(
  appUrl: string,
  meta?: {
    mode?: "standard" | "hard" | "review" | "deck" | "all";
    deckId?: number;
  }
): InlineKeyboardMarkup {
  const buttons: InlineKeyboardButton[][] = [];

  if (meta?.mode === "deck" && meta?.deckId) {
    buttons.push([
      {
        text: "🔁 Shu to'plamni yana takrorlash",
        callback_data: `quiz:deck:${meta.deckId}:all`,
      },
      {
        text: "📁 To'plamga qaytish",
        callback_data: `deck:view:${meta.deckId}`,
      },
    ]);
  } else if (meta?.mode === "all") {
    buttons.push([
      { text: "🔁 Barcha lug'atni yana takrorlash", callback_data: "quiz:all" },
    ]);
  } else if (meta?.mode === "review") {
    buttons.push([
      { text: "🗓 Kunlik takrorlash", callback_data: "review:start" },
    ]);
  } else {
    buttons.push([
      { text: "🔁 Yana 5 ta so'z", callback_data: "quiz:start" },
    ]);
  }

  buttons.push([
    { text: "📚 Mening to'plamlarim", callback_data: "decks:list" },
    { text: "🔥 Barcha lug'at", callback_data: "quiz:all" },
  ]);

  buttons.push([
    { text: "📊 Profil & Statistika", callback_data: "stats" },
    { text: "🔙 Bosh menyu", callback_data: "main_menu" },
  ]);

  buttons.push([
    { text: "🌐 Webda to'liq mashq qilish ↗️", url: appUrl },
  ]);

  return { inline_keyboard: buttons };
}

export function getWordLookupKeyboard(
  cardId: number,
  term: string,
  appUrl: string,
  isSaved: boolean = false
): InlineKeyboardMarkup {
  const saveButton = isSaved
    ? { text: "✅ Lug'atingizda saqlangan", callback_data: "noop" }
    : { text: "💾 Lug'atimga saqlash", callback_data: `save:${cardId}` };

  return {
    inline_keyboard: [
      [saveButton],
      [
        {
          text: `✍️ "${term}" bilan gap tekshirish`,
          callback_data: `check:word:${cardId}`,
        },
      ],
      [
        { text: "📚 To'plamlarim", callback_data: "decks:list" },
        { text: "⚡️ Quiz topshirish", callback_data: "quiz:start" },
      ],
      [
        { text: "🌐 Web Platforma ↗️", url: appUrl },
      ],
    ],
  };
}

export function getStatsInlineKeyboard(appUrl: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "📚 Mening to'plamlarim", callback_data: "decks:list" },
        { text: "🔥 Barcha lug'at", callback_data: "quiz:all" },
      ],
      [
        { text: "⚡️ Hozir Quiz boshlash", callback_data: "quiz:start" },
        { text: "🗓 Kunlik takrorlash", callback_data: "review:start" },
      ],
      [
        { text: "📌 Qiyin so'zlar", callback_data: "hard_words" },
        { text: "🔙 Bosh menyu", callback_data: "main_menu" },
      ],
      [
        { text: "🌐 Vebda kengaytirilgan tahlil ↗️", url: appUrl },
      ],
    ],
  };
}

export function getHardWordsInlineKeyboard(
  appUrl: string,
  hasWords: boolean = true
): InlineKeyboardMarkup {
  if (!hasWords) {
    return {
      inline_keyboard: [
        [
          { text: "📚 To'plamlarim", callback_data: "decks:list" },
          { text: "⚡️ Yangi so'zlardan Quiz", callback_data: "quiz:start" },
        ],
        [
          { text: "🔙 Bosh menyu", callback_data: "main_menu" },
        ],
      ],
    };
  }

  return {
    inline_keyboard: [
      [
        { text: "⚡️ Barcha qiyin so'zlarni mashq qilish", callback_data: "hard:practice" },
      ],
      [
        { text: "📚 To'plamlarim", callback_data: "decks:list" },
        { text: "🔥 Barcha lug'at", callback_data: "quiz:all" },
      ],
      [
        { text: "🔙 Bosh menyu", callback_data: "main_menu" },
      ],
      [
        { text: "🌐 Vebda to'liq mashq qilish ↗️", url: appUrl },
      ],
    ],
  };
}

export function getReviewPromptKeyboard(
  hasDueOrDueCount: boolean | number = true
): InlineKeyboardMarkup {
  const count = typeof hasDueOrDueCount === "number" ? hasDueOrDueCount : hasDueOrDueCount ? 1 : 0;
  const hasDue = count > 0;

  if (!hasDue) {
    return {
      inline_keyboard: [
        [
          { text: "📚 Mening to'plamlarim", callback_data: "decks:list" },
          { text: "🔥 Barcha lug'atni takrorlash", callback_data: "quiz:all" },
        ],
        [
          { text: "⚡️ Yangi so'zlardan Quiz", callback_data: "quiz:start" },
          { text: "🔙 Bosh menyu", callback_data: "main_menu" },
        ],
      ],
    };
  }

  const buttons: InlineKeyboardButton[][] = [
    [
      {
        text: count > 1 ? `⚡️ Barcha ${count} ta so'zni takrorlash` : "⚡️ Takrorlashni boshlash",
        callback_data: "review:do_quiz:all",
      },
    ],
  ];

  if (count > 5) {
    buttons.push([
      {
        text: "⚡️ Faqat 5 tasini takrorlash",
        callback_data: "review:do_quiz:5",
      },
    ]);
  }

  buttons.push([
    { text: "📚 Mening to'plamlarim", callback_data: "decks:list" },
    { text: "🔙 Bosh menyu", callback_data: "main_menu" },
  ]);

  return {
    inline_keyboard: buttons,
  };
}
