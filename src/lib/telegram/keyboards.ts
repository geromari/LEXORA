import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "./types";

export function getMainReplyKeyboard(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [
        { text: "⚡️ Tezkor Quiz (5 ta)" },
        { text: "🗓 Kunlik takrorlash" },
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
        { text: "⚡️ Tezkor Quiz (5 ta so'z)", callback_data: "quiz:start" },
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

export function getQuizSummaryKeyboard(appUrl: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: "🔁 Yana 5 ta so'z", callback_data: "quiz:start" },
        { text: "📌 Qiyin so'zlar", callback_data: "hard_words" },
      ],
      [
        { text: "📊 Profil & Statistika", callback_data: "stats" },
        { text: "🔙 Bosh menyu", callback_data: "main_menu" },
      ],
      [
        { text: "🌐 Webda to'liq mashq qilish ↗️", url: appUrl },
      ],
    ],
  };
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
        { text: "⚡️ Shu so'zdan Quiz topshirish", callback_data: "quiz:start" },
        { text: "🌐 Web Platforma ↗️", url: appUrl },
      ],
    ],
  };
}

export function getStatsInlineKeyboard(appUrl: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
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
          { text: "⚡️ Yangi so'zlardan Quiz", callback_data: "quiz:start" },
          { text: "🔙 Bosh menyu", callback_data: "main_menu" },
        ],
      ],
    };
  }

  return {
    inline_keyboard: [
      [
        { text: "⚡️ Faqat qiyin so'zlardan test", callback_data: "hard:practice" },
      ],
      [
        { text: "⚡️ Yangi so'zlardan Quiz", callback_data: "quiz:start" },
        { text: "🔙 Bosh menyu", callback_data: "main_menu" },
      ],
      [
        { text: "🌐 Vebda to'liq mashq qilish ↗️", url: appUrl },
      ],
    ],
  };
}

export function getReviewPromptKeyboard(hasDue: boolean = true): InlineKeyboardMarkup {
  if (!hasDue) {
    return {
      inline_keyboard: [
        [
          { text: "⚡️ Yangi so'zlardan Quiz", callback_data: "quiz:start" },
          { text: "🔙 Bosh menyu", callback_data: "main_menu" },
        ],
      ],
    };
  }

  return {
    inline_keyboard: [
      [
        { text: "⚡️ Takrorlashni boshlash", callback_data: "review:do_quiz" },
      ],
      [
        { text: "🔙 Bosh menyu", callback_data: "main_menu" },
      ],
    ],
  };
}
