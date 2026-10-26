import { NextRequest, NextResponse } from "next/server";
import {
  getBotToken,
  getAppUrl,
  getTelegramBotMe,
  getTelegramWebhookInfo,
  setTelegramWebhook,
} from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const token = getBotToken();
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "TELEGRAM_BOT_TOKEN sozlanmagan.",
          solution:
            "Iltimos, Vercel loyihangizning 'Settings -> Environment Variables' bo'limiga TELEGRAM_BOT_TOKEN o'zgaruvchisini qo'shing va loyihani qayta deploy qiling.",
        },
        { status: 400 }
      );
    }

    // 1. Check Bot Identity
    const botMe = await getTelegramBotMe();
    if (!botMe.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Telegram Bot Tokeni yaroqsiz yoki Telegram API bilan bog'lanishda xatolik.",
          details: botMe.description,
          solution:
            "@BotFather orqali olingan haqiqiy bot tokenini TELEGRAM_BOT_TOKEN ga to'g'ri kiritganingizni tekshiring.",
        },
        { status: 400 }
      );
    }

    const appUrl = getAppUrl();
    const webhookUrl = `${appUrl}/api/telegram/webhook`;

    // 2. Register Webhook
    const setRes = await setTelegramWebhook(
      webhookUrl,
      process.env.TELEGRAM_WEBHOOK_SECRET
    );

    // 3. Get Current Webhook Info
    const infoRes = await getTelegramWebhookInfo();

    return NextResponse.json({
      ok: true,
      message: "Telegram Bot Webhook muvaffaqiyatli sozlandi!",
      bot: botMe.result,
      webhook_url: webhookUrl,
      set_webhook_result: setRes,
      webhook_status: infoRes.result,
      hint: "Endi Telegramda botingizga /start buyrug'ini yuborib tekshirib ko'rishingiz mumkin.",
    });
  } catch (error: any) {
    console.error("Telegram setup error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
