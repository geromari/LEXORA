/**
 * Smart Match Validator for Vydex IELTS/CEFR Vocabulary Platform
 * Supports Uzbek Latin diacritics, apostrophes, and flexible keyword matching
 */

// Normalize all forms of apostrophes, quotes, and accents
export function normalizeApostrophes(str: string): string {
  return str
    .replace(/[‘'’`ʼʻ]/g, "'") // standard single quote
    .replace(/[“”"«»]/g, "") // remove quotes
    .trim();
}

// Clean string: lowercase, standardize apostrophes, collapse spaces
export function cleanText(str: string): string {
  return normalizeApostrophes(str)
    .toLowerCase()
    .replace(/[.,!?;:()[\]{}"]/g, " ") // remove punctuation and brackets
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks whether user input matches target vocabulary text
 * @param userInput - The text entered by the learner
 * @param targetText - The official card definition or term
 * @param lang - 'uz' for English-to-Uzbek, 'en' for Uzbek-to-English
 */
export function checkSmartMatch(
  userInput: string,
  targetText: string,
  lang: "uz" | "en" = "uz"
): boolean {
  if (!userInput || !targetText) return false;

  const cleanUser = cleanText(userInput);
  const cleanTarget = cleanText(targetText);

  if (cleanUser.length === 0) return false;

  // Exact cleaned match
  if (cleanUser === cleanTarget) return true;

  if (lang === "en") {
    // English mode (UZ -> EN)
    // 1. Strip optional leading "to " (e.g. "to thrive" vs "thrive", "to pad balance sheets" vs "pad balance sheets")
    const strippedUser = cleanUser.replace(/^to\s+/, "");
    const strippedTarget = cleanTarget.replace(/^to\s+/, "");

    if (strippedUser === strippedTarget) return true;

    // 2. Also check if user input matches target without hyphens/dashes
    const dehyphenUser = strippedUser.replace(/[-–—]/g, " ").replace(/\s+/g, " ").trim();
    const dehyphenTarget = strippedTarget.replace(/[-–—]/g, " ").replace(/\s+/g, " ").trim();

    if (dehyphenUser === dehyphenTarget) return true;

    // 3. Check comma-separated synonyms in English
    const targetSynonyms = targetText
      .split(/[,;/]/)
      .map((s) => cleanText(s).replace(/^to\s+/, ""));

    if (targetSynonyms.includes(strippedUser)) return true;

    return false;
  }

  // Uzbek mode (EN -> UZ)
  // If targetText has multiple meanings separated by commas, slashes, or semicolons:
  // (e.g., "gullab-yashnamoq, rivojlanmoq, barq urmoq", "tashqarisida, undan ham ortiq")
  const targetSegments = targetText
    .split(/[,;/]|yoki|\(|\)/) // split by punctuation, 'yoki' (or), parentheses
    .map((s) => cleanText(s))
    .filter((s) => s.length > 0);

  // 1. Check if user input directly matches any complete segment
  for (const seg of targetSegments) {
    if (seg === cleanUser) return true;
  }

  // 2. If user entered at least 4 characters, check if it matches ANY valid keyword in target
  if (cleanUser.length >= 4) {
    // Extract keywords from target segments
    const targetWords = cleanTarget
      .split(/\s+/)
      .filter((w) => w.length >= 4);

    // If user input matches any target keyword
    if (targetWords.includes(cleanUser)) {
      return true;
    }

    // Check if user input is contained inside any segment
    for (const seg of targetSegments) {
      if (seg.includes(cleanUser) || cleanUser.includes(seg)) {
        return true;
      }
    }
  }

  // 3. Typo tolerance: Levenshtein distance <= 1 for single words >= 5 chars
  if (cleanUser.length >= 5) {
    for (const seg of targetSegments) {
      if (levenshteinDistance(cleanUser, seg) <= 1) {
        return true;
      }
    }
  }

  return false;
}

// Levenshtein distance for minor typo allowance
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 999;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
