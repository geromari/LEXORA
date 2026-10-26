import prisma from "./prisma";

export function getBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function getBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME?.trim() || "lexora_uzbot";
}

export function getAppUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://lexora.uz");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}

export async function callTelegramApi<T = any>(
  method: string,
  payload: Record<string, any>
): Promise<{ ok: boolean; result?: T; description?: string }> {
  const token = getBotToken();
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not configured.");
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not set" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error(`Telegram API error on ${method}:`, data.description);
    }
    return data;
  } catch (error: any) {
    console.error(`Telegram API network error on ${method}:`, error);
    return { ok: false, description: error.message };
  }
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  extra: Record<string, any> = {}
) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export async function sendTelegramSticker(
  chatId: number | string,
  sticker: string
) {
  return callTelegramApi("sendSticker", {
    chat_id: chatId,
    sticker,
  });
}

export async function editTelegramMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  extra: Record<string, any> = {}
) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  return callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

export async function setTelegramWebhook(webhookUrl: string, secretToken?: string) {
  const payload: Record<string, any> = {
    url: webhookUrl,
    drop_pending_updates: true,
    allowed_updates: ["message", "callback_query"],
  };
  if (secretToken) {
    payload.secret_token = secretToken;
  }
  return callTelegramApi("setWebhook", payload);
}

export async function getTelegramWebhookInfo() {
  return callTelegramApi("getWebhookInfo", {});
}

export async function getTelegramBotMe() {
  return callTelegramApi("getMe", {});
}

// ============================================================================
// Keyboards
// ============================================================================

export function getMainReplyKeyboard(appUrl: string) {
  const emojiUser = process.env.TELEGRAM_EMOJI_USER;
  const emojiCalendar = process.env.TELEGRAM_EMOJI_CALENDAR;
  const emojiStats = process.env.TELEGRAM_EMOJI_STATS;
  const emojiQuiz = process.env.TELEGRAM_EMOJI_QUIZ;
  const emojiBookmark = process.env.TELEGRAM_EMOJI_HARD_WORDS;
  const emojiBell = process.env.TELEGRAM_EMOJI_REMINDER;
  const emojiWeb = process.env.TELEGRAM_EMOJI_WEBAPP;

  return {
    keyboard: [
      [
        {
          text: emojiQuiz ? "Tezkor Quiz (5 ta so'z)" : "⚡️ Tezkor Quiz (5 ta so'z)",
          style: "primary",
          ...(emojiQuiz ? { icon_custom_emoji_id: emojiQuiz } : {}),
        },
      ],
      [
        {
          text: emojiUser ? "Profil" : "👤 Profil",
          style: "primary", // Blue button matching Lucide User in Image 0
          ...(emojiUser ? { icon_custom_emoji_id: emojiUser } : {}),
        },
        {
          text: emojiCalendar ? "Kunlik takrorlash" : "🗓 Kunlik takrorlash",
          style: "success", // Green button matching Lucide Calendar in Image 1
          ...(emojiCalendar ? { icon_custom_emoji_id: emojiCalendar } : {}),
        },
      ],
      [
        {
          text: emojiStats ? "Statistika" : "📊 Statistika",
          style: "success",
          ...(emojiStats ? { icon_custom_emoji_id: emojiStats } : {}),
        },
        {
          text: emojiBookmark ? "Qiyin so'zlarim" : "📑 Qiyin so'zlarim",
          ...(emojiBookmark ? { icon_custom_emoji_id: emojiBookmark } : {}),
        },
      ],
      [
        {
          text: emojiBell ? "Eslatmalar" : "🔔 Eslatmalar",
          ...(emojiBell ? { icon_custom_emoji_id: emojiBell } : {}),
        },
        {
          text: emojiWeb ? "Lexora Web App ↗️" : "🌐 Lexora Web Platformasi ↗️",
          style: "primary",
          ...(emojiWeb ? { icon_custom_emoji_id: emojiWeb } : {}),
        },
      ],
    ],
    resize_keyboard: true,
  };
}

export function getWelcomeInlineKeyboard(appUrl: string) {
  const emojiUser = process.env.TELEGRAM_EMOJI_USER;
  const emojiCalendar = process.env.TELEGRAM_EMOJI_CALENDAR;
  const emojiStats = process.env.TELEGRAM_EMOJI_STATS;
  const emojiQuiz = process.env.TELEGRAM_EMOJI_QUIZ;
  const emojiBookmark = process.env.TELEGRAM_EMOJI_HARD_WORDS;
  const emojiBell = process.env.TELEGRAM_EMOJI_REMINDER;
  const emojiWeb = process.env.TELEGRAM_EMOJI_WEBAPP;

  return {
    inline_keyboard: [
      [
        {
          text: emojiQuiz ? "Tezkor Quiz (5 ta so'z)" : "⚡️ Tezkor Quiz (5 ta so'z)",
          callback_data: "quiz:start",
          style: "primary",
          ...(emojiQuiz ? { icon_custom_emoji_id: emojiQuiz } : {}),
        },
      ],
      [
        {
          text: emojiUser ? "Profil" : "👤 Profil",
          callback_data: "stats",
          style: "primary",
          ...(emojiUser ? { icon_custom_emoji_id: emojiUser } : {}),
        },
        {
          text: emojiCalendar ? "Kunlik takrorlash" : "🗓 Kunlik takrorlash",
          callback_data: "quiz:start",
          style: "success",
          ...(emojiCalendar ? { icon_custom_emoji_id: emojiCalendar } : {}),
        },
      ],
      [
        {
          text: emojiStats ? "Statistika" : "📊 Statistika",
          callback_data: "stats",
          style: "success",
          ...(emojiStats ? { icon_custom_emoji_id: emojiStats } : {}),
        },
        {
          text: emojiBookmark ? "Qiyin so'zlarim" : "📑 Qiyin so'zlarim",
          callback_data: "hard_words",
          ...(emojiBookmark ? { icon_custom_emoji_id: emojiBookmark } : {}),
        },
      ],
      [
        {
          text: emojiBell ? "Eslatmalar" : "🔔 Eslatmalar",
          callback_data: "reminder:toggle",
          ...(emojiBell ? { icon_custom_emoji_id: emojiBell } : {}),
        },
        {
          text: "📖 Bot qo'llanmasi",
          callback_data: "help",
        },
      ],
      [
        {
          text: emojiWeb ? "Lexora Web App ↗️" : "🌐 Lexora Web Platformasi ↗️",
          url: appUrl,
          style: "primary",
          ...(emojiWeb ? { icon_custom_emoji_id: emojiWeb } : {}),
        },
      ],
    ],
  };
}

export function getLookupInlineKeyboard(cardId: number, appUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "💾 Lug'atimga saqlash",
          callback_data: `save:${cardId}`,
          style: "success",
        },
      ],
      [
        {
          text: "🌐 Webda mashq qilish ↗️",
          url: appUrl,
          style: "primary",
        },
      ],
    ],
  };
}

export function getStatsInlineKeyboard(appUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "⚡️ Hozir Quiz boshlash",
          callback_data: "quiz:start",
          style: "success",
        },
      ],
      [
        {
          text: "🌐 Webda to'liq tahlil ↗️",
          url: appUrl,
          style: "primary",
        },
        {
          text: "🔙 Asosiy menyu",
          callback_data: "main_menu",
        },
      ],
    ],
  };
}

export function getHardWordsInlineKeyboard(appUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: "⚡️ Tezkor Quiz (5 ta so'z)",
          callback_data: "quiz:start",
          style: "primary",
        },
      ],
      [
        {
          text: "🌐 Webda to'liq mashq qilish ↗️",
          url: appUrl,
          style: "primary",
        },
        {
          text: "🔙 Asosiy menyu",
          callback_data: "main_menu",
        },
      ],
    ],
  };
}

export function getReminderInlineKeyboard(isEnabled: boolean = true) {
  return {
    inline_keyboard: [
      [
        {
          text: isEnabled ? "🔕 Eslatmani o'chirish" : "🔔 Eslatmani yoqish",
          callback_data: "reminder:toggle_action",
        },
      ],
      [
        {
          text: "🔙 Asosiy menyu",
          callback_data: "main_menu",
        },
      ],
    ],
  };
}

export function getQuizOptionKeyboard(
  cardId: number,
  options: string[],
  correctIndex: number,
  questionNum: number
) {
  const letters = ["A", "B", "C", "D"];
  return {
    inline_keyboard: options.map((opt, idx) => [
      {
        text: `${letters[idx]}) ${opt}`,
        callback_data: `qopt:${cardId}:${idx === correctIndex ? 1 : 0}:${questionNum}`,
      },
    ]),
  };
}

export function getQuizFeedbackKeyboard(
  isLast: boolean,
  nextQuestionNum: number,
  appUrl: string
) {
  if (isLast) {
    return {
      inline_keyboard: [
        [
          {
            text: "🔁 Yana 5 ta so'z",
            callback_data: "quiz:start",
            style: "primary",
          },
          {
            text: "📊 Natijalar & Profil",
            callback_data: "stats",
            style: "success",
          },
        ],
        [
          {
            text: "🌐 Web Platformaga o'tish ↗️",
            url: appUrl,
            style: "primary",
          },
          {
            text: "🔙 Asosiy menyu",
            callback_data: "main_menu",
          },
        ],
      ],
    };
  }

  return {
    inline_keyboard: [
      [
        {
          text: "Keyingi savol ➡️",
          callback_data: `quiz:next:${nextQuestionNum}`,
          style: "primary",
        },
      ],
      [
        {
          text: "🔙 Asosiy menyu",
          callback_data: "main_menu",
        },
      ],
    ],
  };
}

// ============================================================================
// User Helpers
// ============================================================================

export async function getOrCreateTelegramUser(fromUser: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}) {
  const tId = BigInt(fromUser.id);
  const now = new Date();

  let user = await prisma.user.findUnique({
    where: { telegramId: tId },
  });

  if (user) {
    // Check daily streak
    const lastDate = user.lastActiveDate;
    let shouldUpdateStreak = false;
    let newStreak = user.streakCount;

    if (!lastDate) {
      newStreak = 1;
      shouldUpdateStreak = true;
    } else {
      const last = new Date(lastDate);
      const diffDays = Math.floor(
        (now.setHours(0, 0, 0, 0) - new Date(last).setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        newStreak += 1;
        shouldUpdateStreak = true;
      } else if (diffDays > 1) {
        newStreak = 1;
        shouldUpdateStreak = true;
      }
    }

    if (shouldUpdateStreak || !user.lastActiveDate) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: newStreak,
          lastActiveDate: new Date(),
        },
      });
    }

    return user;
  }

  // Create new user
  const generatedUsername = fromUser.username
    ? fromUser.username
    : `tg_${fromUser.id}_${Math.floor(Math.random() * 1000)}`;

  // Ensure unique username
  const existingUsername = await prisma.user.findUnique({
    where: { username: generatedUsername },
  });

  const finalUsername = existingUsername
    ? `${generatedUsername}_${Math.floor(Math.random() * 1000)}`
    : generatedUsername;

  user = await prisma.user.create({
    data: {
      telegramId: tId,
      username: finalUsername,
      streakCount: 1,
      lastActiveDate: new Date(),
    },
  });

  return user;
}

// Fallback academic lexicon for instant lookup when word is not yet seeded
export const FALLBACK_LEXICON: Record<
  string,
  { meaning_uz: string; synonyms: string; example_en: string }
> = {
  scrutinize: {
    meaning_uz: "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
    synonyms: "examine closely, audit, inspect",
    example_en: "Regulatory authorities must scrutinize all financial disclosures.",
  },
  thrive: {
    meaning_uz: "gullab-yashnamoq, ravnaq topmoq",
    synonyms: "flourish, prosper, burgeon",
    example_en: "Innovative startups thrive in supportive economic environments.",
  },
  foster: {
    meaning_uz: "rivojlantirmoq, rag'batlantirmoq, parvarishlamoq",
    synonyms: "cultivate, encourage, nurture",
    example_en: "Collaborative seminars foster intellectual maturity among peers.",
  },
  "ripple effect": {
    meaning_uz: "zanjirsimon ta'sir, kaskadli oqibat",
    synonyms: "domino effect, chain reaction",
    example_en: "Economic downturns trigger an immediate ripple effect across households.",
  },
  "window dressing": {
    meaning_uz: "ko'zbo'yamachilik, faqat tashqi ko'rinishni yaxshilash",
    synonyms: "superficial facade, pretense",
    example_en: "Critics argued the policy change was mere window dressing.",
  },
  polarization: {
    meaning_uz: "qutblashuv, qarama-qarshi tomonlarga bo'linish",
    synonyms: "division, dichotomy, discord",
    example_en: "Social media algorithms often exacerbate societal polarization.",
  },
  legitimacy: {
    meaning_uz: "qonuniylik, jamoatchilik e'tirofi",
    synonyms: "validity, authenticity, authority",
    example_en: "Transparent institutions preserve public legitimacy.",
  },
  prosperity: {
    meaning_uz: "farovonlik, to'kin-sochinlik",
    synonyms: "affluence, economic well-being",
    example_en: "Equitable growth is indispensable for durable prosperity.",
  },
  overreach: {
    meaning_uz: "vakolatini suiiste'mol qilish, haddidan oshish",
    synonyms: "encroachment, overstepping",
    example_en: "The judiciary stepped in to curb executive overreach.",
  },
  altruism: {
    meaning_uz: "xolis yaxshilik, fidoyilik, saxovat",
    synonyms: "benevolence, selflessness",
    example_en: "Genuine altruism inspires community solidarity.",
  },
  cohesion: {
    meaning_uz: "jipslik, mustahkam birdamlik",
    synonyms: "solidarity, unity",
    example_en: "Cultural exchanges reinforce social cohesion.",
  },
  recruitment: {
    meaning_uz: "xodimlarni jalb qilish, tanlov",
    synonyms: "talent acquisition, hiring",
    example_en: "Targeted recruitment campaigns attract skilled researchers.",
  },
  underserved: {
    meaning_uz: "e'tibordan chetda qolgan, yetarli xizmat ko'rsatilmagan",
    synonyms: "underprivileged, neglected",
    example_en: "Mobile medical units deliver aid to underserved villages.",
  },
  fulfilling: {
    meaning_uz: "qoniqish bag'ishlovchi, ma'noli",
    synonyms: "rewarding, gratifying",
    example_en: "Mentoring younger students is exceptionally fulfilling.",
  },
  inevitable: {
    meaning_uz: "muqarrar, oldini olib bo'lmaydigan",
    synonyms: "unavoidable, inescapable",
    example_en: "Technological transformation is an inevitable reality.",
  },
  comprehensive: {
    meaning_uz: "har tomonlama, keng qamrovli",
    synonyms: "exhaustive, all-inclusive",
    example_en: "The committee proposed a comprehensive reform package.",
  },
  exacerbate: {
    meaning_uz: "kuchaytirib yubormoq, yomonlashtirmoq",
    synonyms: "aggravate, worsen, intensify",
    example_en: "Unchecked price inflation continues to exacerbate financial anxiety.",
  },
  resilient: {
    meaning_uz: "bardoshli, chidamli, tez o'zini tiklaydigan",
    synonyms: "hardy, robust, adaptable",
    example_en: "Coastal agriculture requires resilient crop varieties.",
  },
  indispensable: {
    meaning_uz: "ajralmas, juda zarur",
    synonyms: "vital, crucial, essential",
    example_en: "Critical thinking is indispensable in the modern digital age.",
  },
};
