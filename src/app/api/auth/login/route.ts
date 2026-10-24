import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { detail: "Foydalanuvchi nomi va parol kiritilishi shart." },
        { status: 400 }
      );
    }

    const trimmed = username.trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmed },
          { email: trimmed.toLowerCase() },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { detail: "Foydalanuvchi nomi yoki parol noto'g'ri." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { detail: "Foydalanuvchi nomi yoki parol noto'g'ri." },
        { status: 401 }
      );
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
    console.error("Login error:", error);
    return NextResponse.json(
      { detail: error.message || "Tizimga kirishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
