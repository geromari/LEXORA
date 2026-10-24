export const SRS_INTERVALS_HOURS: Record<number, number> = {
  0: 0,    // Darhol qayta takrorlash
  1: 24,   // 1 kun
  2: 72,   // 3 kun
  3: 168,  // 7 kun (1 hafta)
  4: 336,  // 14 kun (2 hafta)
  5: 720,  // 30 kun (1 oy)
};

export interface SRSResult {
  newBoxLevel: number;
  nextReviewAt: Date;
  newStreak: number;
  newWrongCount: number;
  intervalHours: number;
}

export function calculateNextReview(
  currentBox: number,
  currentStreak: number,
  currentWrong: number,
  correct: boolean
): SRSResult {
  const now = new Date();

  if (correct) {
    let newBox = Math.min(5, currentBox + 1);
    if (newBox === 0) newBox = 1;
    const intervalHours = SRS_INTERVALS_HOURS[newBox] ?? 720;
    const nextReviewAt = new Date(now.getTime() + intervalHours * 3600 * 1000);

    return {
      newBoxLevel: newBox,
      nextReviewAt,
      newStreak: currentStreak + 1,
      newWrongCount: currentWrong,
      intervalHours,
    };
  } else {
    return {
      newBoxLevel: 0,
      nextReviewAt: now,
      newStreak: 0,
      newWrongCount: currentWrong + 1,
      intervalHours: 0,
    };
  }
}
