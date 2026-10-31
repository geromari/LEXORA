export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  sender_chat?: TelegramChat;
  date: number;
  chat: TelegramChat;
  text?: string;
  reply_to_message?: TelegramMessage;
  web_app_data?: {
    data: string;
    button_text: string;
  };
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  inline_message_id?: string;
  chat_instance?: string;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface ReplyKeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
  web_app?: { url: string };
}

export interface ReplyKeyboardMarkup {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  is_persistent?: boolean;
  input_field_placeholder?: string;
}

export interface QuizQuestion {
  cardId: number;
  termEn: string;
  meaningUz: string;
  exampleEn?: string;
  synonyms?: string;
  phonetic?: string;
  level?: string;
  options: string[];
  correctIndex: number;
}

export interface QuizSession {
  id: string;
  userId: string;
  chatId: number;
  mode: "standard" | "hard" | "review" | "deck" | "all";
  deckId?: number;
  deckTitle?: string;
  currentIndex: number;
  questions: QuizQuestion[];
  userAnswers: {
    questionIndex: number;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
  score: number;
  isAnswered: boolean;
  createdAt: number;
}

export interface WordLookupResult {
  termEn: string;
  meaningUz: string;
  phonetic?: string;
  partOfSpeech?: string;
  level?: string;
  synonyms?: string;
  exampleEn?: string;
  exampleUz?: string;
  cardId?: number;
  source: "database" | "api" | "curated";
}
