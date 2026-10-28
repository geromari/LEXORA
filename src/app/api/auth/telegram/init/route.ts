import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureLexoraDb } from "@/lib/ensureDb";
import { getSessionUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    await ensureLexoraDb();

    // Check if user is currently logged in (for linking an existing account)
    const currentUser = await getSessionUser(req);

    const sessionToken = crypto.randomUUID().replace(/-/g, "");

    await prisma.telegramAuthSession.create({
      data: {
        sessionToken,
        userId: currentUser ? currentUser.id : null,
        status: "pending",
      },
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "lexora_uzbot";
    const botUrl = `https://t.me/${botUsername}?start=auth_${sessionToken}`;

    return NextResponse.json({
      session_token: sessionToken,
      bot_url: botUrl,
    });
  } catch (error: any) {
    console.error("Telegram init error:", error);
    return NextResponse.json(
      { detail: error.message || "Telegram sessiyasini yaratishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
