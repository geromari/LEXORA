const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface UserProfile {
  id: number;
  username: string;
  email?: string | null;
  telegram_id?: number | null;
  avatar_url?: string | null;
  streak_count: number;
  last_active_date?: string | null;
  created_at: string;
  total_decks?: number;
  total_learned_words?: number;
  total_due_words?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface TelegramInitResponse {
  session_token: string;
  bot_url: string;
}

export interface TelegramStatusResponse {
  status: "pending" | "completed";
  access_token?: string;
  user?: UserProfile;
}

export interface StudyProgress {
  id: number;
  card_id: number;
  box_level: number;
  next_review_at: string;
  correct_streak: number;
  wrong_count: number;
}

export interface Card {
  id: number;
  deck_id: number;
  term_en: string;
  meaning_uz: string;
  synonyms?: string | null;
  example_en?: string | null;
  progress?: StudyProgress | null;
}

export interface DeckListItem {
  id: number;
  user_id?: number | null;
  is_owner?: boolean;
  title: string;
  description: string;
  level: string;
  is_public: boolean;
  created_at: string;
  card_count: number;
  mastery_percentage: number;
  due_count: number;
  learned_count: number;
}

export interface DeckDetail extends DeckListItem {
  cards: Card[];
}

export interface ReviewResponse {
  success: boolean;
  card_id: number;
  box_level: number;
  next_review_at: string;
  correct_streak: number;
  wrong_count: number;
  interval_hours: number;
  message: string;
}

export interface DueCardsResponse {
  total_due: number;
  total_hardest: number;
  due_cards: Card[];
  hardest_cards: Card[];
}

export interface ExtractedCardItem {
  term_en: string;
  meaning_uz: string;
  synonyms?: string;
  example_en?: string;
  level?: string;
}

export interface ExtractVocabResponse {
  success: boolean;
  total_extracted: number;
  cards: ExtractedCardItem[];
  source_info: string;
}

export interface CheckSentenceResponse {
  success: boolean;
  score: number;
  grammar_correct: boolean;
  natural_usage: boolean;
  feedback_uz: string;
  improved_sentence: string;
  original_sentence: string;
  target_term: string;
}

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("lexora_auth_token");
  }
  return null;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      const errorText = await res.text();
      if (errorText) errorDetail = errorText;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth endpoints
  register: (payload: { username: string; email?: string; password: string }) =>
    request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email_or_username: string; password: string }) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  loginTelegram: (payload: {
    telegram_id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  }) =>
    request<TokenResponse>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  initTelegramAuth: () =>
    request<TelegramInitResponse>("/api/auth/telegram/init", {
      method: "POST",
    }),
  checkTelegramAuthStatus: (session_token: string) =>
    request<TelegramStatusResponse>(`/api/auth/telegram/status/${session_token}`),
  getMe: () => request<UserProfile>("/api/auth/me"),

  // Decks endpoints
  getDecks: () => request<DeckListItem[]>("/api/decks"),
  getDeck: (id: number) => request<DeckDetail>(`/api/decks/${id}`),
  createDeck: (payload: {
    title: string;
    description?: string;
    level?: string;
    is_public?: boolean;
    cards: Array<{
      term_en: string;
      meaning_uz: string;
      synonyms?: string;
      example_en?: string;
    }>;
  }) =>
    request<DeckDetail>("/api/decks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // SRS & Reviews
  submitReview: (cardId: number, correct: boolean) =>
    request<ReviewResponse>("/api/progress/review", {
      method: "POST",
      body: JSON.stringify({ card_id: cardId, correct }),
    }),
  getDueCards: (limit = 50) =>
    request<DueCardsResponse>(`/api/review/due?limit=${limit}`),

  // AI Features
  extractVocab: (payload: { text: string; level?: string; count?: number }) =>
    request<ExtractVocabResponse>("/api/ai/extract-vocab", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkSentence: (payload: { target_term: string; sentence: string; deck_title?: string }) =>
    request<CheckSentenceResponse>("/api/ai/check-sentence", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
