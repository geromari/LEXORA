import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { ensureLexoraDb } from "@/lib/ensureDb";

export async function POST(req: NextRequest) {
  try {
    await ensureLexoraDb();
    const body = await req.json();
    const { telegram_id, username, first_name, photo_url } = body;

    if (!telegram_id) {
      return NextResponse.json(
        { detail: "telegram_id kiritilishi shart." },
        { status: 400 }
      );
    }

    const tId = BigInt(telegram_id);
    let user = await prisma.user.findUnique({
      where: { telegramId: tId },
    });

    if (!user) {
      const generatedUsername = username
        ? username.trim()
        : `tg_${telegram_id}_${Math.floor(Math.random() * 1000)}`;

      user = await prisma.user.create({
        data: {
          telegramId: tId,
          username: generatedUsername,
          avatarUrl: photo_url || null,
          streakCount: 0,
        },
      });
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      streakCount: user.streakCount,
      lastActiveDate: user.lastActiveDate,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user: safeUser,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Telegram auth error:", error);
    return NextResponse.json(
      { detail: error.message || "Telegram orqali kirishda xatolik." },
      { status: 500 }
    );
  }
}
