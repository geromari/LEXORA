import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "./types";

export function getBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || "";
}

export function getBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME?.trim() || "vydex_uzbot";
}

export function getAppUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://vydex.uz");

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url.replace(/\/$/, "");
}

/**
 * Escapes HTML characters for Telegram HTML parse_mode to prevent parsing errors
 */
export function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function callTelegramApi<T = unknown>(
  method: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; result?: T; description?: string; error_code?: number }> {
  const token = getBotToken();
  if (!token) {
    console.warn("[Telegram API] TELEGRAM_BOT_TOKEN is not configured.");
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
      console.warn(`[Telegram API] Error on ${method}:`, data.description);
    }
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    console.error(`[Telegram API] Network error on ${method}:`, message);
    return { ok: false, description: message };
  }
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  extra: {
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
    parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
    disable_web_page_preview?: boolean;
    reply_to_message_id?: number;
  } = {}
) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: extra.parse_mode ?? "HTML",
    disable_web_page_preview: extra.disable_web_page_preview ?? true,
    ...extra,
  });
}

export async function editTelegramMessage(
  chatId: number | string,
  messageId: number,
  text: string,
  extra: {
    reply_markup?: InlineKeyboardMarkup;
    parse_mode?: "HTML" | "MarkdownV2" | "Markdown";
    disable_web_page_preview?: boolean;
  } = {}
) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: extra.parse_mode ?? "HTML",
    disable_web_page_preview: extra.disable_web_page_preview ?? true,
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
  const payload: Record<string, unknown> = {
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

export async function setMyBotCommands() {
  const commands = [
    { command: "quiz", description: "⚡️ 5 ta so'zdan iborat tezkor SRS testi" },
    { command: "review", description: "🗓 Kunlik takrorlash navbati" },
    { command: "stats", description: "📊 Shaxsiy profil va xotira statistikasi" },
    { command: "hard", description: "📌 Qiyin va ko'p xato qilingan so'zlar" },
    { command: "check", description: "✍️ IELTS gap tekshiruvi (AI Examiner)" },
    { command: "help", description: "📖 Bot imkoniyatlari va qo'llanma" },
    { command: "start", description: "🚀 Asosiy menyu va xush kelibsiz" },
  ];

  return callTelegramApi("setMyCommands", { commands });
}
