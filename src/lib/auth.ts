import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vydex-secret-key-2026-production-jwt"
);

export const COOKIE_NAME = "vydex_session";
export const LEGACY_COOKIE_NAME = "lexora_session";

export interface TokenPayload {
  userId: string;
  username: string;
  email?: string | null;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: Request) {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const cookieHeader = req.headers.get("cookie") || "";
      const match =
        cookieHeader.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]*)`)) ||
        cookieHeader.match(new RegExp(`(^|;\\s*)${LEGACY_COOKIE_NAME}=([^;]*)`));
      if (match) token = match[2];
    }
  } else {
    try {
      const cookieStore = await cookies();
      token =
        cookieStore.get(COOKIE_NAME)?.value ||
        cookieStore.get(LEGACY_COOKIE_NAME)?.value;
    } catch {
      // Outside Request / Server Action context
    }
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        streakCount: true,
        lastActiveDate: true,
        createdAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}
