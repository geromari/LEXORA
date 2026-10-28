import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import { ensureLexoraDb } from "@/lib/ensureDb";

export async function POST(req: NextRequest) {
  try {
    await ensureLexoraDb();
    const body = await req.json();
    const { email, name, avatar_url, google_id } = body;

    if (!email) {
      return NextResponse.json(
        { detail: "Google hisobi emaili kiritilmadi." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Try to find user by email
    let user = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
      },
    });

    if (!user) {
      // Generate clean unique username from name or email
      let baseUsername = (name || cleanEmail.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 18);

      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = `user_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      // Check if username taken
      const existingWithUsername = await prisma.user.findUnique({
        where: { username: baseUsername },
      });

      const finalUsername = existingWithUsername
        ? `${baseUsername}_${Math.floor(100 + Math.random() * 899)}`
        : baseUsername;

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          username: finalUsername,
          avatarUrl: avatar_url || null,
          streakCount: 1,
        },
      });
    } else if (avatar_url && !user.avatarUrl) {
      // Update avatar if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: avatar_url },
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
    console.error("Google auth error:", error);
    return NextResponse.json(
      { detail: error.message || "Google orqali ro'yxatdan o'tishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
