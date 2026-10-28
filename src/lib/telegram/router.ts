import { NextRequest, NextResponse } from "next/server";
import prisma from "../prisma";
import { ensureLexoraDb } from "../ensureDb";
import { signToken } from "../auth";
import {
  escapeHtml,
  getAppUrl,
  sendTelegramMessage,
  editTelegramMessage,
  answerTelegramCallbackQuery,
} from "./api";
import {
  getMainReplyKeyboard,
  getWelcomeInlineKeyboard,
  getStatsInlineKeyboard,
  getHardWordsInlineKeyboard,
  getReviewPromptKeyboard,
  getWordLookupKeyboard,
} from "./keyboards";
import {
  getOrCreateTelegramUser,
  setUserPendingAction,
  getUserPendingAction,
  clearUserPendingAction,
  getQuizSession,
} from "./helpers";
import { smartLookupWord, formatWordCardHtml } from "./dictionary";
import {
  createQuizSession,
  renderQuestionMessage,
  processQuizAnswer,
  renderQuizSummary,
} from "./quizEngine";
import { checkSentenceWithAi, formatSentenceEvaluationHtml } from "./sentenceChecker";
import { getUserStatsData, formatUserStatsHtml } from "./userStats";
import { getHardWordsData, formatHardWordsHtml } from "./hardWords";
import { getDailyReviewCount, formatDailyReviewPrompt } from "./dailyReview";
import { TelegramUpdate } from "./types";

export async function handleTelegramUpdate(req: NextRequest): Promise<NextResponse> {
  try {
    await ensureLexoraDb();

    // 1. Secret token verification (if configured)
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret && secretHeader !== configuredSecret) {
      console.warn("[Telegram Webhook] Secret token mismatch");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const update: TelegramUpdate = await req.json();
    const appUrl = getAppUrl();

    // 2. Handle Text Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || "").trim();
      const from = msg.from;

      if (!chatId || !from) {
        return NextResponse.json({ ok: true });
      }

      // 2.1 Handle /start (with Deep-linking)
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const startArg = parts[1]?.trim() || "";

        // Deep-link case 1: /start auth_<session_token> (Web SSO Login)
        if (startArg.startsWith("auth_")) {
          const sessionToken = startArg.replace("auth_", "").trim();
          const authSession = await prisma.telegramAuthSession.findUnique({
            where: { sessionToken },
          });

          if (authSession && authSession.status === "pending") {
            let user = authSession.userId
              ? await prisma.user.findUnique({ where: { id: authSession.userId } })
              : null;

            if (user) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  telegramId: BigInt(from.id),
                  lastActiveDate: new Date(),
                },
              });
            } else {
              user = await getOrCreateTelegramUser(from);
            }

            const jwtToken = await signToken({
              userId: user.id,
              username: user.username,
              email: user.email,
            });

            await prisma.telegramAuthSession.update({
              where: { sessionToken },
              data: {
                status: "completed",
                userId: user.id,
                telegramId: BigInt(from.id),
                jwtToken,
              },
            });

            const replyText =
              `🎉 <b>Akkauntingiz veb-platforma bilan muvaffaqiyatli ulandi!</b>\n\n` +
              `👤 Foydalanuvchi: <b>${escapeHtml(user.username)}</b>\n` +
              `🔥 Kunlik seriyangiz: <b>${user.streakCount} kun</b>\n\n` +
              `Brauzeringizdagi sahifa avtomatik yangilanadi va barcha ma'lumotlaringiz sinxronlashadi.`;

            await sendTelegramMessage(chatId, replyText, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🚀 Veb-saytga o'tish", url: appUrl }],
                ],
              },
            });
            return NextResponse.json({ ok: true });
          }
        }

        // Deep-link case 2: /start link_<userId>
        if (startArg.startsWith("link_")) {
          const targetUserId = startArg.replace("link_", "").trim();
          const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
          });

          if (targetUser) {
            await prisma.user.update({
              where: { id: targetUser.id },
              data: {
                telegramId: BigInt(from.id),
                lastActiveDate: new Date(),
              },
            });

            const replyText =
              `🎉 <b>Muvaffaqiyatli bog'landi!</b>\n\n` +
              `Sizning Vydex profilingiz (<b>${escapeHtml(
                targetUser.username
              )}</b>) Telegram akkauntingiz bilan sinxronlashtirildi!`;

            await sendTelegramMessage(chatId, replyText, {
              reply_markup: getWelcomeInlineKeyboard(appUrl),
            });
            return NextResponse.json({ ok: true });
          }
        }

        // Standard /start: Onboarding
        const user = await getOrCreateTelegramUser(from);
        const name = escapeHtml(from.first_name || user.username);

        const welcomeText =
          `✨ <b>Assalomu alaykum, ${name}!</b>\n\n` +
          `<b>Vydex</b> — Spaced Repetition (SRS) va AI asosidagi akademik IELTS & CEFR so'z yodlash botiga xush kelibsiz!\n\n` +
          `🔥 <b>Kunlik seriyangiz:</b> ${user.streakCount} kun uzluksiz\n\n` +
          `<b>Asosiy imkoniyatlar:</b>\n` +
          `• ⚡️ <b>Tezkor Quiz</b>: 5 ta so'zdan iborat interaktiv SRS testi\n` +
          `• 🗓 <b>Kunlik takrorlash</b>: Unutilish arafasidagi so'zlarni vaqtida qaytarish\n` +
          `• 🔍 <b>Aqlli Lug'at</b>: Istalgan inglizcha so'z yuboring — tarjimasi, darajasi va IELTS misoli bilan to'plamingizga saqlaydi\n` +
          `• ✍️ <b>Gap tekshirish</b>: O'z gapingizni yuboring — AI IELTS Writing mezonlari bo'yicha baholaydi\n` +
          `• 📊 <b>Profil & Statistika</b>: Leitner xotira tahlili va o'zlashtirish ko'rsatkichlari\n` +
          `• 📌 <b>Qiyin so'zlar</b>: Eng ko'p xato qilingan so'zlar ustida ishlash\n\n` +
          `Quyidagi menyudan kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri biror inglizcha so'z yozib yuboring:`;

        await sendTelegramMessage(
          chatId,
          "⚡️ Boshqaruv tugmalari faollashtirildi:",
          { reply_markup: getMainReplyKeyboard() }
        );

        await sendTelegramMessage(chatId, welcomeText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });

        return NextResponse.json({ ok: true });
      }

      // Ensure user exists
      const user = await getOrCreateTelegramUser(from);

      // Check for user pending action (e.g. awaiting sentence for AI check)
      const pendingAction = getUserPendingAction(from.id);
      if (pendingAction && pendingAction.action === "awaiting_sentence") {
        clearUserPendingAction(from.id);
        const targetWord =
          typeof pendingAction.meta?.targetWord === "string"
            ? pendingAction.meta.targetWord
            : undefined;
        const result = await checkSentenceWithAi(text, targetWord);
        const html = formatSentenceEvaluationHtml(text, result, targetWord);
        await sendTelegramMessage(chatId, html, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⚡️ Yangi Quiz topshirish", callback_data: "quiz:start" }],
              [{ text: "🔙 Bosh menyu", callback_data: "main_menu" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // 2.2 Handle /help or Guide
      if (text === "/help" || text.includes("Qo'llanma") || text.includes("Yordam")) {
        const helpText =
          `📖 <b>Vydex Bot Qo'llanmasi:</b>\n\n` +
          `• <b>/quiz</b> yoki <b>⚡️ Tezkor Quiz (5 ta)</b> — 5 ta so'zdan iborat interaktiv SRS testi\n` +
          `• <b>/review</b> yoki <b>🗓 Kunlik takrorlash</b> — Bugun unutilish arafasidagi so'zlarni qaytarish\n` +
          `• <b>/stats</b> yoki <b>📊 Profil & Statistika</b> — Leitner xotira tahlili va seriyangiz\n` +
          `• <b>/hard</b> yoki <b>📌 Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar va ulardan test\n` +
          `• <b>/check &lt;gap&gt;</b> yoki <b>✍️ Gap tekshirish</b> — IELTS Writing AI tekshiruvi\n\n` +
          `💡 <b>Aqlli Lug'at:</b>\n` +
          `Botga istalgan inglizcha so'zni yozib yuboring (masalan: <code>scrutinize</code>, <code>thrive</code>, <code>resilient</code>). ` +
          `Bot uning o'zbekcha tarjimasi, CEFR darajasi va IELTS namunaviy gapini ko'rsatib, shaxsiy lug'atingizga saqlab beradi!`;

        await sendTelegramMessage(chatId, helpText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.3 Handle /quiz or "⚡️ Tezkor Quiz (5 ta)"
      if (text === "/quiz" || text.includes("Tezkor Quiz") || text === "⚡️") {
        const session = await createQuizSession(user.id, chatId, "standard");
        if (!session) {
          await sendTelegramMessage(
            chatId,
            "Hozircha bazada so'zlar topilmadi. Iltimos, avval biror so'z yuborib lug'atga qo'shing."
          );
          return NextResponse.json({ ok: true });
        }
        const qMsg = renderQuestionMessage(session, 0);
        await sendTelegramMessage(chatId, qMsg.text, { reply_markup: qMsg.keyboard });
        return NextResponse.json({ ok: true });
      }

      // 2.4 Handle /review or "🗓 Kunlik takrorlash"
      if (text === "/review" || text.includes("Kunlik takrorlash") || text.includes("takrorlash")) {
        const count = await getDailyReviewCount(user.id);
        const prompt = formatDailyReviewPrompt(count);
        await sendTelegramMessage(chatId, prompt.text, {
          reply_markup: getReviewPromptKeyboard(prompt.hasDue),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.5 Handle /stats or Profile
      if (
        text === "/stats" ||
        text === "/profile" ||
        text.includes("Profil") ||
        text.includes("Statistika")
      ) {
        const stats = await getUserStatsData(user.id);
        const statsHtml = formatUserStatsHtml(user, stats);
        await sendTelegramMessage(chatId, statsHtml, {
          reply_markup: getStatsInlineKeyboard(appUrl),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.6 Handle /hard or Hard Words
      if (text === "/hard" || text === "/hard_words" || text.includes("Qiyin so'zlar")) {
        const records = await getHardWordsData(user.id);
        const formatted = formatHardWordsHtml(records);
        await sendTelegramMessage(chatId, formatted.text, {
          reply_markup: getHardWordsInlineKeyboard(appUrl, formatted.hasWords),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.7 Handle /check or "✍️ Gap tekshirish"
      if (text.startsWith("/check") || text.includes("Gap tekshirish") || text === "✍️") {
        const gapText = text.replace(/^\/check\s*/i, "").trim();

        if (gapText.length > 5) {
          const result = await checkSentenceWithAi(gapText);
          const html = formatSentenceEvaluationHtml(gapText, result);
          await sendTelegramMessage(chatId, html, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⚡️ Yangi Quiz topshirish", callback_data: "quiz:start" }],
                [{ text: "🔙 Bosh menyu", callback_data: "main_menu" }],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        // Prompt user for sentence
        setUserPendingAction(from.id, "awaiting_sentence");
        const promptText =
          `✍️ <b>IELTS Writing AI Gap Tekshiruvi</b>\n\n` +
          `Istalgan inglizcha gap yozib yuboring (masalan: <i>"Although modern technologies thrive, environmental issues must be addressed."</i>).\n\n` +
          `Sun'iy intellekt (AI) grammatikangizni, so'z tanlash mahoratingizni va IELTS Band darajasini tahlil qilib beradi:`;

        await sendTelegramMessage(chatId, promptText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Bekor qilish", callback_data: "main_menu" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // 2.8 Handle "🔍 Aqlli Lug'at" prompt
      if (text.includes("Aqlli Lug'at") || text === "🔍") {
        const dictText =
          `🔍 <b>Aqlli Lug'at Qidiruvi</b>\n\n` +
          `Botga istalgan inglizcha so'z yoki iborani yozib yuboring (masalan: <code>scrutinize</code>, <code>resilient</code>, <code>foster</code>).\n\n` +
          `Bot uning o'zbekcha akademik tarjimasi, CEFR darajasi, sinonimlari va IELTS kontekst namunaviy gapini ko'rsatib, shaxsiy lug'atingizga saqlaydi!`;

        await sendTelegramMessage(chatId, dictText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.9 Handle Web Platform link
      if (text.includes("Web Platforma") || text === "🌐") {
        const webText =
          `🌐 <b>Vydex Web Platformasi</b>\n\n` +
          `Kengaytirilgan interaktiv mashqlar, IELTS tahlillari va Spaced Repetition xotira arenasiga to'liq kirish:\n\n` +
          `🔗 Manzil: <b>${appUrl}</b>\n\n` +
          `<i>Saytga kirgach "Telegram orqali kirish" tugmasini bosing — profilingiz avtomatik sinxronlashadi.</i>`;

        await sendTelegramMessage(chatId, webText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🌐 Veb-Platformaga o'tish ↗️", url: appUrl }],
              [{ text: "🔙 Bosh menyu", callback_data: "main_menu" }],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // 2.10 Default: Word Lookup for any input
      if (!text.startsWith("/")) {
        const lookupResult = await smartLookupWord(text);

        if (lookupResult && lookupResult.cardId) {
          const cardHtml = formatWordCardHtml(lookupResult);

          // Check if user already has this card in progress
          const existingProg = await prisma.studyProgress.findFirst({
            where: { userId: user.id, cardId: lookupResult.cardId },
          });

          await sendTelegramMessage(chatId, cardHtml, {
            reply_markup: getWordLookupKeyboard(
              lookupResult.cardId,
              lookupResult.termEn,
              appUrl,
              !!existingProg
            ),
          });
          return NextResponse.json({ ok: true });
        }

        // If not found
        await sendTelegramMessage(
          chatId,
          `🔍 <b>"${escapeHtml(text)}"</b> so'zi bo'yicha ma'lumot topilmadi.\n` +
            `Iltimos, so'zning to'g'ri yozilganini tekshirib qayta yuboring yoki quyidagi bo'limlardan foydalaning:`,
          { reply_markup: getWelcomeInlineKeyboard(appUrl) }
        );
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // 3. Handle Callback Queries
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || "";
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const from = cq.from;

      if (!chatId || !from) {
        return NextResponse.json({ ok: true });
      }

      const user = await getOrCreateTelegramUser(from);

      // 3.1 Main Menu
      if (data === "main_menu") {
        clearUserPendingAction(from.id);
        const name = escapeHtml(from.first_name || user.username);
        const welcomeText =
          `✨ <b>Asosiy Menyu</b>\n\n` +
          `Foydalanuvchi: <b>${name}</b>\n` +
          `🔥 Kunlik seriya: <b>${user.streakCount} kun</b>\n\n` +
          `Kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri inglizcha so'z yozib yuboring:`;

        if (messageId) {
          await editTelegramMessage(chatId, messageId, welcomeText, {
            reply_markup: getWelcomeInlineKeyboard(appUrl),
          });
        } else {
          await sendTelegramMessage(chatId, welcomeText, {
            reply_markup: getWelcomeInlineKeyboard(appUrl),
          });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.2 Help
      if (data === "help") {
        const helpText =
          `📖 <b>Vydex Bot Qo'llanmasi:</b>\n\n` +
          `• ⚡️ <b>Tezkor Quiz</b> — 5 ta so'zdan iborat interaktiv SRS testi\n` +
          `• 🗓 <b>Kunlik takrorlash</b> — Bugun unutilish arafasidagi so'zlarni qaytarish\n` +
          `• 📊 <b>Profil & Statistika</b> — Leitner xotira tahlili va seriyangiz\n` +
          `• 📌 <b>Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar va ulardan test\n` +
          `• ✍️ <b>Gap tekshirish</b> — IELTS Writing AI tahlili\n\n` +
          `💡 <b>Aqlli Lug'at:</b> Istalgan inglizcha so'z yuboring — tarjimasi, darajasi va misolini ko'rsatib, to'plamingizga saqlaydi!`;

        if (messageId) {
          await editTelegramMessage(chatId, messageId, helpText, {
            reply_markup: {
              inline_keyboard: [
                [{ text: "⚡️ Quiz boshlash", callback_data: "quiz:start" }],
                [{ text: "🔙 Bosh menyu", callback_data: "main_menu" }],
              ],
            },
          });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.3 Stats
      if (data === "stats" || data === "my_stats") {
        const stats = await getUserStatsData(user.id);
        const statsHtml = formatUserStatsHtml(user, stats);

        if (messageId) {
          await editTelegramMessage(chatId, messageId, statsHtml, {
            reply_markup: getStatsInlineKeyboard(appUrl),
          });
        } else {
          await sendTelegramMessage(chatId, statsHtml, {
            reply_markup: getStatsInlineKeyboard(appUrl),
          });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.4 Hard Words
      if (data === "hard_words") {
        const records = await getHardWordsData(user.id);
        const formatted = formatHardWordsHtml(records);

        if (messageId) {
          await editTelegramMessage(chatId, messageId, formatted.text, {
            reply_markup: getHardWordsInlineKeyboard(appUrl, formatted.hasWords),
          });
        } else {
          await sendTelegramMessage(chatId, formatted.text, {
            reply_markup: getHardWordsInlineKeyboard(appUrl, formatted.hasWords),
          });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.5 Hard Words Practice Quiz
      if (data === "hard:practice") {
        const session = await createQuizSession(user.id, chatId, "hard");
        if (!session) {
          await answerTelegramCallbackQuery(cq.id, "Qiyin so'zlar topilmadi.");
          return NextResponse.json({ ok: true });
        }

        const qMsg = renderQuestionMessage(session, 0);
        if (messageId) {
          await editTelegramMessage(chatId, messageId, qMsg.text, {
            reply_markup: qMsg.keyboard,
          });
        } else {
          await sendTelegramMessage(chatId, qMsg.text, { reply_markup: qMsg.keyboard });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.6 Daily Review Start
      if (data === "review:start") {
        const count = await getDailyReviewCount(user.id);
        const prompt = formatDailyReviewPrompt(count);

        if (messageId) {
          await editTelegramMessage(chatId, messageId, prompt.text, {
            reply_markup: getReviewPromptKeyboard(prompt.hasDue),
          });
        } else {
          await sendTelegramMessage(chatId, prompt.text, {
            reply_markup: getReviewPromptKeyboard(prompt.hasDue),
          });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.7 Daily Review Quiz Execution
      if (data === "review:do_quiz") {
        const session = await createQuizSession(user.id, chatId, "review");
        if (!session) {
          await answerTelegramCallbackQuery(cq.id, "Takrorlash so'zlari topilmadi.");
          return NextResponse.json({ ok: true });
        }

        const qMsg = renderQuestionMessage(session, 0);
        if (messageId) {
          await editTelegramMessage(chatId, messageId, qMsg.text, {
            reply_markup: qMsg.keyboard,
          });
        } else {
          await sendTelegramMessage(chatId, qMsg.text, { reply_markup: qMsg.keyboard });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.8 Start Quiz
      if (data === "quiz:start" || data === "start_quiz") {
        const session = await createQuizSession(user.id, chatId, "standard");
        if (!session) {
          await answerTelegramCallbackQuery(cq.id, "Bazada so'zlar topilmadi.");
          return NextResponse.json({ ok: true });
        }

        const qMsg = renderQuestionMessage(session, 0);
        if (messageId) {
          await editTelegramMessage(chatId, messageId, qMsg.text, {
            reply_markup: qMsg.keyboard,
          });
        } else {
          await sendTelegramMessage(chatId, qMsg.text, { reply_markup: qMsg.keyboard });
        }
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.9 Quiz Answer: qans:<sessionId>:<qIndex>:<optIdx>
      if (data.startsWith("qans:")) {
        const parts = data.split(":");
        const sessionId = parts[1];
        const qIndex = parseInt(parts[2], 10);
        const optIdx = parseInt(parts[3], 10);

        const result = await processQuizAnswer(sessionId, qIndex, optIdx, user);

        if (result.error) {
          await answerTelegramCallbackQuery(cq.id, result.error, true);
          return NextResponse.json({ ok: true });
        }

        if (result.alreadyAnswered) {
          await answerTelegramCallbackQuery(cq.id, "Bu savolga allaqachon javob bergansiz.");
          return NextResponse.json({ ok: true });
        }

        if (messageId && result.text) {
          await editTelegramMessage(chatId, messageId, result.text, {
            reply_markup: result.keyboard,
          });
        }

        await answerTelegramCallbackQuery(
          cq.id,
          result.isCorrect ? "To'g'ri! Barakalla!" : "Noto'g'ri!"
        );
        return NextResponse.json({ ok: true });
      }

      // 3.10 Next Quiz Question: qnext:<sessionId>
      if (data.startsWith("qnext:")) {
        const sessionId = data.replace("qnext:", "");
        const session = getQuizSession(sessionId);

        if (!session) {
          await answerTelegramCallbackQuery(cq.id, "Quiz sessiyasi eskirgan.", true);
          return NextResponse.json({ ok: true });
        }

        session.currentIndex += 1;
        session.isAnswered = false;

        const qMsg = renderQuestionMessage(session, session.currentIndex);
        if (messageId) {
          await editTelegramMessage(chatId, messageId, qMsg.text, {
            reply_markup: qMsg.keyboard,
          });
        }

        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.11 Finish Quiz: qdone:<sessionId>
      if (data.startsWith("qdone:")) {
        const sessionId = data.replace("qdone:", "");
        const session = getQuizSession(sessionId);

        if (!session) {
          await answerTelegramCallbackQuery(cq.id, "Quiz sessiyasi eskirgan.", true);
          return NextResponse.json({ ok: true });
        }

        const summary = renderQuizSummary(session, user, appUrl);
        if (messageId) {
          await editTelegramMessage(chatId, messageId, summary.text, {
            reply_markup: summary.keyboard,
          });
        }

        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.12 Save Word to Personal Deck: save:<cardId>
      if (data.startsWith("save:")) {
        const cardId = parseInt(data.replace("save:", ""), 10);
        const card = await prisma.card.findUnique({ where: { id: cardId } });

        if (card) {
          // Find or create user's personal Telegram deck
          let deck = await prisma.deck.findFirst({
            where: { userId: user.id, title: "Telegram Lug'atim" },
          });

          if (!deck) {
            deck = await prisma.deck.create({
              data: {
                userId: user.id,
                title: "Telegram Lug'atim",
                description: "Telegram bot orqali saqlangan akademik so'zlar",
                level: "C1",
                isPublic: false,
              },
            });
          }

          // Ensure StudyProgress exists
          const existingProg = await prisma.studyProgress.findFirst({
            where: { userId: user.id, cardId: card.id },
          });

          if (!existingProg) {
            await prisma.studyProgress.create({
              data: {
                userId: user.id,
                cardId: card.id,
                boxLevel: 0,
                nextReviewAt: new Date(),
                correctStreak: 0,
                wrongCount: 0,
              },
            });
          }

          await answerTelegramCallbackQuery(
            cq.id,
            `✅ "${card.termEn}" shaxsiy lug'atingizga saqlandi!`,
            true
          );

          // Update inline keyboard to show saved status
          if (messageId) {
            await editTelegramMessage(
              chatId,
              messageId,
              cq.message?.text || "",
              {
                reply_markup: getWordLookupKeyboard(
                  card.id,
                  card.termEn,
                  appUrl,
                  true
                ),
              }
            );
          }

          return NextResponse.json({ ok: true });
        }
      }

      // 3.13 Prompt for Sentence with Specific Word: check:word:<cardId>
      if (data.startsWith("check:word:")) {
        const cardId = parseInt(data.replace("check:word:", ""), 10);
        const card = await prisma.card.findUnique({ where: { id: cardId } });
        const term = card ? card.termEn : "";

        setUserPendingAction(from.id, "awaiting_sentence", { targetWord: term });

        const promptText =
          `✍️ <b>"${escapeHtml(term)}"</b> so'zi bilan gap tuzish:\n\n` +
          `Ushbu so'zni qatnashtirib biror inglizcha gap yozib yuboring.\n` +
          `AI uning grammatikasini, so'zning to'g'ri kontekstda ishlatilganini va IELTS Band darajasini tahlil qiladi.`;

        await sendTelegramMessage(chatId, promptText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Bekor qilish", callback_data: "main_menu" }],
            ],
          },
        });

        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.14 Prompt for Sentence in General: check:prompt
      if (data === "check:prompt") {
        setUserPendingAction(from.id, "awaiting_sentence");
        const promptText =
          `✍️ <b>IELTS Writing AI Gap Tekshiruvi</b>\n\n` +
          `Istalgan inglizcha gap yozib yuboring.\n` +
          `Sun'iy intellekt uning grammatikasi, so'z boyligi va IELTS Band ko'rsatkichini baholab beradi.`;

        await sendTelegramMessage(chatId, promptText, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "❌ Bekor qilish", callback_data: "main_menu" }],
            ],
          },
        });

        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      if (data === "noop") {
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      await answerTelegramCallbackQuery(cq.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("[Telegram Webhook] Exception occurred:", error);
    // Always return 200 OK so Telegram doesn't endlessly re-deliver corrupted updates
    return NextResponse.json({ ok: true, error: errorMsg });
  }
}
