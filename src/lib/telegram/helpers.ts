import prisma from "../prisma";
import { TelegramUser, QuizSession } from "./types";

interface PendingActionState {
  action: string;
  meta?: Record<string, unknown>;
  expiresAt: number;
}

// In-memory sessions cache with 20-minute expiration
const quizSessions = new Map<string, QuizSession>();
const userStates = new Map<string, PendingActionState>();

export function getQuizSession(sessionId: string): QuizSession | undefined {
  const session = quizSessions.get(sessionId);
  if (!session) return undefined;
  if (Date.now() - session.createdAt > 20 * 60 * 1000) {
    quizSessions.delete(sessionId);
    return undefined;
  }
  return session;
}

export function saveQuizSession(session: QuizSession) {
  quizSessions.set(session.id, session);
}

export function deleteQuizSession(sessionId: string) {
  quizSessions.delete(sessionId);
}

export function setUserPendingAction(
  telegramId: number | string,
  action: string,
  meta?: Record<string, unknown>
) {
  const key = String(telegramId);
  userStates.set(key, {
    action,
    meta,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

export function getUserPendingAction(telegramId: number | string): PendingActionState | null {
  const key = String(telegramId);
  const state = userStates.get(key);
  if (!state) return null;
  if (Date.now() > state.expiresAt) {
    userStates.delete(key);
    return null;
  }
  return state;
}

export function clearUserPendingAction(telegramId: number | string) {
  userStates.delete(String(telegramId));
}

/**
 * Gets or creates a User record from Telegram User data, updating daily streak
 */
export async function getOrCreateTelegramUser(fromUser: TelegramUser) {
  const tId = BigInt(fromUser.id);
  const now = new Date();

  let user = await prisma.user.findUnique({
    where: { telegramId: tId },
  });

  if (user) {
    let newStreak = user.streakCount || 0;
    let shouldUpdate = false;

    if (!user.lastActiveDate) {
      newStreak = 1;
      shouldUpdate = true;
    } else {
      const last = new Date(user.lastActiveDate);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastStart = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
      const diffDays = Math.round((todayStart - lastStart) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        shouldUpdate = true;
      } else if (diffDays > 1) {
        newStreak = 1;
        shouldUpdate = true;
      }
    }

    if (shouldUpdate || !user.lastActiveDate) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          streakCount: newStreak,
          lastActiveDate: now,
        },
      });
    }

    return user;
  }

  // Create new user
  const generatedUsername = fromUser.username
    ? fromUser.username
    : `tg_${fromUser.id}_${Math.floor(100 + Math.random() * 900)}`;

  const existingUsername = await prisma.user.findUnique({
    where: { username: generatedUsername },
  });

  const finalUsername = existingUsername
    ? `${generatedUsername}_${Math.floor(100 + Math.random() * 900)}`
    : generatedUsername;

  user = await prisma.user.create({
    data: {
      telegramId: tId,
      username: finalUsername,
      streakCount: 1,
      lastActiveDate: now,
    },
  });

  return user;
}
