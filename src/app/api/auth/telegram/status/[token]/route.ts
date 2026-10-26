import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureLexoraDb } from "@/lib/ensureDb";
import { COOKIE_NAME } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    await ensureLexoraDb();
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { detail: "Sessiya tokeni ko'rsatilmadi." },
        { status: 400 }
      );
    }

    const authSession = await prisma.telegramAuthSession.findUnique({
      where: { sessionToken: token },
      include: {
        user: true,
      },
    });

    if (!authSession) {
      return NextResponse.json(
        { detail: "Autentifikatsiya sessiyasi topilmadi yoki eskirgan." },
        { status: 404 }
      );
    }

    if (authSession.status === "pending") {
      return NextResponse.json({
        status: "pending",
      });
    }

    const user = authSession.user;
    const safeUser = user
      ? {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          streakCount: user.streakCount,
          lastActiveDate: user.lastActiveDate,
          createdAt: user.createdAt,
        }
      : null;

    const response = NextResponse.json({
      status: "completed",
      access_token: authSession.jwtToken,
      user: safeUser,
    });

    if (authSession.jwtToken) {
      response.cookies.set(COOKIE_NAME, authSession.jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Telegram status check error:", error);
    return NextResponse.json(
      { detail: error.message || "Sessiya holatini tekshirishda xatolik." },
      { status: 500 }
    );
  }
}
