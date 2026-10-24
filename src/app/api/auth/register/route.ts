import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { detail: "Foydalanuvchi nomi va parol kiritilishi shart." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { detail: "Bu foydalanuvchi nomi yoki email allaqachon band." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email ? email.trim().toLowerCase() : null,
        passwordHash,
        streakCount: 0,
      },
      select: {
        id: true,
        username: true,
        email: true,
        streakCount: true,
        lastActiveDate: true,
        createdAt: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json({
      access_token: token,
      token_type: "bearer",
      user,
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
    console.error("Register error:", error);
    return NextResponse.json(
      { detail: error.message || "Ro'yxatdan o'tishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
