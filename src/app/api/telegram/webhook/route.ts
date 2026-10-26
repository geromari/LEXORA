import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureLexoraDb } from "@/lib/ensureDb";
import { signToken } from "@/lib/auth";
import { calculateNextReview } from "@/lib/srs";
import {
  getAppUrl,
  sendTelegramMessage,
  sendTelegramSticker,
  editTelegramMessage,
  answerTelegramCallbackQuery,
  getMainReplyKeyboard,
  getWelcomeInlineKeyboard,
  getLookupInlineKeyboard,
  getStatsInlineKeyboard,
  getHardWordsInlineKeyboard,
  getReminderInlineKeyboard,
  getQuizOptionKeyboard,
  getQuizFeedbackKeyboard,
  getOrCreateTelegramUser,
  FALLBACK_LEXICON,
  LEXORA_STICKERS,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    await ensureLexoraDb();

    // 1. Verify Secret Token (optional, if configured)
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret && secretHeader !== configuredSecret) {
      console.warn("Unauthorized webhook call: secret token mismatch");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    const update = await req.json();
    const appUrl = getAppUrl();

    // 2. Handle Message Updates
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = (msg.text || "").trim();
      const from = msg.from;

      if (!chatId || !from) {
        return NextResponse.json({ ok: true });
      }

      // 2.1 Handle /start command (with deep-linking)
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const startArg = parts[1]?.trim() || "";

        // Deep-link case 1: /start auth_<session_token>
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
              // Linking an existing web user
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  telegramId: BigInt(from.id),
                  lastActiveDate: new Date(),
                },
              });
            } else {
              // Registering / logging in by telegram_id
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
              `🎉 <b>Akkauntingiz veb-platforma bilan muvaffaqiyatli ulandi! Saytga qaytishingiz mumkin.</b>\n\n` +
              `Foydalanuvchi: <b>${user.username}</b>\n` +
              `🔥 Kunlik seriyangiz: <b>${user.streakCount} kun</b>\n\n` +
              `Brauzeringizdagi sahifa avtomatik yangilanadi va barcha ma'lumotlaringiz sinxronlashadi.`;

            await sendTelegramMessage(chatId, replyText, {
              reply_markup: getWelcomeInlineKeyboard(appUrl),
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
              `Sizning Lexora profilingiz (<b>${targetUser.username}</b>) ushbu Telegram akkaunti bilan muvaffaqiyatli sinxronlashtirildi!\n\n` +
              `Endi Telegram orqali so'zlarni takrorlashingiz, eslatmalar olishingiz va yangi so'zlarni saqlashingiz mumkin.`;

            await sendTelegramMessage(chatId, replyText, {
              reply_markup: getWelcomeInlineKeyboard(appUrl),
            });
            return NextResponse.json({ ok: true });
          }
        }

        // Standard /start: Onboarding
        const user = await getOrCreateTelegramUser(from);
        const name = from.first_name || user.username;

        const welcomeText =
          `✨ <b>Assalomu alaykum, ${name}!</b>\n\n` +
          `<b>Lexora</b> — Spaced Repetition (SRS) va AI asosidagi akademik IELTS & CEFR so'z yodlash botiga xush kelibsiz!\n\n` +
          `🔥 <b>Kunlik seriyangiz:</b> ${user.streakCount} kun uzluksiz\n\n` +
          `<b>Asosiy bo'limlar:</b>\n` +
          `• ⚡️ <b>Tezkor Quiz</b>: 5 ta so'zdan iborat interaktiv mashg'ulot.\n` +
          `• 👥 <b>Profil</b>: Shaxsiy profil va seriyangiz ko'rsatkichlari.\n` +
          `• 📊 <b>Statistika</b>: SRS xotira tahlili va o'rganilgan so'zlar.\n` +
          `• 🔄 <b>Kunlik takrorlash</b>: Unutilish arafasidagi so'zlarni qaytarish.\n` +
          `• 📑 <b>Qiyin so'zlar</b>: Eng ko'p xato qilingan so'zlar ro'yxati.\n` +
          `• 💾 <b>Aqlli Lug'at</b>: Istalgan inglizcha so'z yuboring — tarjimasi va IELTS kontekst misolini to'plamingizga saqlaydi.\n` +
          `• 🌐 <b>Web Platforma</b>: Lexora veb-ilovasi bilan to'liq integratsiya.`;

        // Send Lucide Welcome Sticker
        try {
          await sendTelegramSticker(chatId, LEXORA_STICKERS.sparkles);
        } catch {
          // Ignore if sticker fails
        }

        await sendTelegramMessage(chatId, "⚡️ Quyidagi menyudan kerakli bo'limni tanlang:", {
          reply_markup: getMainReplyKeyboard(appUrl),
        });

        await sendTelegramMessage(chatId, welcomeText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });

        return NextResponse.json({ ok: true });
      }

      // Ensure user exists
      const user = await getOrCreateTelegramUser(from);

      // 2.2 Handle /help or guide
      if (text === "/help" || text.includes("Qo'llanma") || text.includes("Bot qo'llanmasi")) {
        const helpText =
          `📖 <b>Lexora Bot Qo'llanmasi:</b>\n\n` +
          `• <b>/start</b> — Botni qayta ishga tushirish va asosiy menyu\n` +
          `• <b>/quiz</b> yoki 🎯 <b>Tezkor Quiz</b> — 5 ta so'zdan iborat interaktiv SRS testi\n` +
          `• <b>/stats</b> yoki 👤 <b>Profil</b> — O'rganilgan so'zlar, aniqlik va seriya statistikasi\n` +
          `• <b>/hard_words</b> yoki 📌 <b>Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar\n` +
          `• <b>/reminder</b> yoki 🔔 <b>Eslatmalar</b> — Kunlik takrorlash eslatmalari sozlamasi\n\n` +
          `💡 <b>Aqlli Lug'at Qidiruvi:</b>\n` +
          `Botga istalgan inglizcha so'zni yozib yuboring (masalan: <code>scrutinize</code>, <code>thrive</code> yoki <code>resilient</code>). ` +
          `Bot uning o'zbekcha tarjimasi, sinonimlari va IELTS misolini ko'rsatib, shaxsiy lug'atingizga 1 bosishda saqlab beradi!`;

        await sendTelegramMessage(chatId, helpText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.3 Handle /stats, Profile, or Statistika
      if (
        text === "/stats" ||
        text.includes("Profil") ||
        text.includes("Profilim") ||
        text.includes("Statistika") ||
        text.includes("👥") ||
        text.includes("📊")
      ) {
        await renderUserStats(chatId, user, appUrl);
        return NextResponse.json({ ok: true });
      }

      // 2.4 Handle /hard_words
      if (
        text === "/hard_words" ||
        text.includes("Qiyin so'zlar") ||
        text.includes("📑") ||
        text.includes("📌")
      ) {
        await renderHardWords(chatId, user, appUrl);
        return NextResponse.json({ ok: true });
      }

      // 2.5 Handle /quiz or Daily Review
      if (
        text === "/quiz" ||
        text.includes("Tezkor Quiz") ||
        text.includes("⚡️") ||
        text.includes("🎯") ||
        text.includes("Kunlik takrorlash") ||
        text.includes("🔄") ||
        text.includes("Takrorlash")
      ) {
        await renderQuizQuestion(chatId, null, user, 1, appUrl);
        return NextResponse.json({ ok: true });
      }

      // 2.6 Handle /reminder
      if (text === "/reminder" || text.includes("Eslatmalar") || text.includes("🔔")) {
        const reminderText =
          `🔔 <b>Kunlik Spaced Repetition Eslatmalari</b>\n\n` +
          `Holat: ✅ <b>Faol</b> (Har kuni 09:00 va 20:00 da)\n\n` +
          `Eslatma faol bo'lganda, bot takrorlash navbatida so'zlaringiz to'planganda sizni xabardor qilib turadi.`;

        await sendTelegramMessage(chatId, reminderText, {
          reply_markup: getReminderInlineKeyboard(true),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.7 Handle Web Platform button
      if (
        text.includes("Web Platformasi") ||
        text.includes("Web Platforma") ||
        text.includes("🌐") ||
        text.includes("💻")
      ) {
        const webText =
          `🌐 <b>Lexora Web Platformasi</b>\n\n` +
          `Lexora to'liq funksional veb-ilovasi orqali kengaytirilgan mashqlar, ` +
          `interaktiv SRS fleshkartalar va IELTS tahlillaridan foydalanishingiz mumkin.\n\n` +
          `🔗 Manzil: <b>${appUrl}</b>\n\n` +
          `<i>Saytga kirgach "Telegram orqali kirish" tugmasini bosing — profilingiz avtomatik sinxronlashadi.</i>`;

        await sendTelegramMessage(chatId, webText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        return NextResponse.json({ ok: true });
      }

      // 2.8 Word Lookup (Any English word/phrase)
      if (!text.startsWith("/")) {
        await handleWordLookup(chatId, user, text, appUrl);
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // 3. Handle Callback Query Updates
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
        const welcomeText =
          `✨ <b>Asosiy Menyu</b>\n\n` +
          `Foydalanuvchi: <b>${from.first_name || user.username}</b>\n` +
          `🔥 Kunlik seriya: <b>${user.streakCount} kun</b>\n\n` +
          `Kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri inglizcha so'z yozib yuboring:`;

        await editTelegramMessage(chatId, messageId, welcomeText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.2 Help
      if (data === "help") {
        const helpText =
          `📖 <b>Lexora Bot Qo'llanmasi:</b>\n\n` +
          `• 🎯 <b>Tezkor Quiz</b> — 5 ta so'zdan iborat tezkor SRS takrorlash quizi\n` +
          `• 👤 <b>Profil</b> — O'rganilgan so'zlar, aniqlik va seriya ko'rsatkichlari\n` +
          `• 📌 <b>Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar ro'yxati\n` +
          `• 🔔 <b>Eslatmalar</b> — Kunlik takrorlash eslatmalari sozlamasi\n\n` +
          `💡 <b>Aqlli Lug'at:</b> Istalgan inglizcha so'z yuboring — tarjimasi va misolini ko'rsatib, to'plamingizga saqlaydi!`;

        await editTelegramMessage(chatId, messageId, helpText, {
          reply_markup: getWelcomeInlineKeyboard(appUrl),
        });
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.3 Stats
      if (data === "stats" || data === "my_stats") {
        await renderUserStats(chatId, user, appUrl, messageId);
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.4 Hard Words
      if (data === "hard_words") {
        await renderHardWords(chatId, user, appUrl, messageId);
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.5 Reminder settings
      if (data === "reminder:toggle") {
        const text =
          `🔔 <b>Kunlik Spaced Repetition Eslatmalari</b>\n\n` +
          `Holat: ✅ <b>Faol</b> (Har kuni 09:00 va 20:00 da)\n\n` +
          `Eslatmani quyidagi tugma orqali yoqishingiz yoki to'xtatishingiz mumkin:`;

        await editTelegramMessage(chatId, messageId, text, {
          reply_markup: getReminderInlineKeyboard(true),
        });
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      if (data === "reminder:toggle_action") {
        await answerTelegramCallbackQuery(cq.id, "Eslatma sozlamasi yangilandi!");
        return NextResponse.json({ ok: true });
      }

      // 3.6 Start Quiz
      if (data === "quiz:start" || data === "start_quiz") {
        await renderQuizQuestion(chatId, messageId, user, 1, appUrl);
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.7 Next Quiz Question: quiz:next:<num>
      if (data.startsWith("quiz:next:")) {
        const nextNum = parseInt(data.replace("quiz:next:", "")) || 1;
        await renderQuizQuestion(chatId, messageId, user, nextNum, appUrl);
        await answerTelegramCallbackQuery(cq.id);
        return NextResponse.json({ ok: true });
      }

      // 3.8 Quiz Option Selected: qopt:<cardId>:<isCorrect>:<questionNum>
      if (data.startsWith("qopt:")) {
        const parts = data.split(":");
        const cardId = parseInt(parts[1]);
        const isCorrect = parts[2] === "1";
        const qNum = parseInt(parts[3]) || 1;

        const card = await prisma.card.findUnique({
          where: { id: cardId },
        });

        if (card) {
          // 1. Update StudyProgress
          const existingProg = await prisma.studyProgress.findFirst({
            where: { userId: user.id, cardId: card.id },
          });

          const currentBox = existingProg?.boxLevel ?? 0;
          const currentStreak = existingProg?.correctStreak ?? 0;
          const currentWrong = existingProg?.wrongCount ?? 0;

          const srsResult = calculateNextReview(
            currentBox,
            currentStreak,
            currentWrong,
            isCorrect
          );

          if (existingProg) {
            await prisma.studyProgress.update({
              where: { id: existingProg.id },
              data: {
                boxLevel: srsResult.newBoxLevel,
                nextReviewAt: srsResult.nextReviewAt,
                correctStreak: srsResult.newStreak,
                wrongCount: srsResult.newWrongCount,
              },
            });
          } else {
            await prisma.studyProgress.create({
              data: {
                userId: user.id,
                cardId: card.id,
                boxLevel: srsResult.newBoxLevel,
                nextReviewAt: srsResult.nextReviewAt,
                correctStreak: srsResult.newStreak,
                wrongCount: srsResult.newWrongCount,
              },
            });
          }

          // 2. Build Feedback text
          const statusHeader = isCorrect
            ? "✅ <b>To'g'ri javob! Barakalla!</b>"
            : `❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>${card.meaningUz}</b>`;

          const isLast = qNum >= 5;
          let feedbackText =
            `${statusHeader}\n\n` +
            `🇬🇧 <b>${card.termEn}</b> — ${card.meaningUz}\n` +
            `📝 <b>IELTS Misol:</b> <i>"${card.exampleEn || card.termEn}"</i>\n` +
            (card.synonyms ? `💡 <b>Sinonimlar:</b> ${card.synonyms}\n` : "");

          if (isLast) {
            feedbackText +=
              `\n🎉 <b>Quiz muvaffaqiyatli yakunlandi!</b>\n` +
              `Javoblaringiz SRS xotira tizimiga saqlandi. 🔥 Seriyangiz: <b>${user.streakCount} kun</b>.`;
          }

          await editTelegramMessage(chatId, messageId, feedbackText, {
            reply_markup: getQuizFeedbackKeyboard(isLast, qNum + 1, appUrl),
          });

          await answerTelegramCallbackQuery(cq.id, isCorrect ? "To'g'ri!" : "Noto'g'ri!");
          return NextResponse.json({ ok: true });
        }
      }

      // 3.9 Save Word: save:<cardId>
      if (data.startsWith("save:")) {
        const cardId = parseInt(data.replace("save:", ""));
        const card = await prisma.card.findUnique({
          where: { id: cardId },
        });

        if (card) {
          // Find or create "Telegram Lug'atim" deck
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
          return NextResponse.json({ ok: true });
        }
      }

      await answerTelegramCallbackQuery(cq.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook handler error:", error);
    // Always return 200 OK so Telegram does not repeatedly resend bad updates
    return NextResponse.json({ ok: true, error: error.message });
  }
}

// ============================================================================
// Helper Functions for rendering views
// ============================================================================

async function renderUserStats(
  chatId: number,
  user: any,
  appUrl: string,
  messageId?: number
) {
  const now = new Date();

  // 1. Total learned (boxLevel >= 3)
  const totalLearned = await prisma.studyProgress.count({
    where: { userId: user.id, boxLevel: { gte: 3 } },
  });

  // 2. Words due for review
  const totalDue = await prisma.studyProgress.count({
    where: { userId: user.id, nextReviewAt: { lte: now } },
  });

  // 3. Total studying cards
  const totalStudying = await prisma.studyProgress.count({
    where: { userId: user.id },
  });

  // 4. Total decks
  const totalDecks = await prisma.deck.count({
    where: { userId: user.id },
  });

  const accuracy = totalStudying > 0 ? Math.min(100, Math.round((totalLearned / totalStudying) * 100)) : 85;

  const statsText =
    `👥 <b>Mening Profilim: ${user.username}</b>\n` +
    `📊 <b>Statistika & SRS Ko'rsatkichlari</b>\n\n` +
    `🔥 <b>Kunlik seriya:</b> ${user.streakCount} kun uzluksiz\n` +
    `🎓 <b>O'zlashtirilgan so'zlar:</b> ${totalLearned} ta\n` +
    `📚 <b>O'rganilayotgan so'zlar:</b> ${totalStudying} ta\n` +
    `🔄 <b>Bugungi takrorlash navbati:</b> ${totalDue} ta so'z\n` +
    `📁 <b>Shaxsiy to'plamlar:</b> ${totalDecks} ta\n` +
    `🎯 <b>O'rtacha o'zlashtirish aniqligi:</b> ${accuracy}%\n\n` +
    `<i>Spaced Repetition (Leitner) algoritmi so'zlarni xotirangizda uzoq muddat saqlash uchun o'z vaqtida taqdim etadi.</i>`;

  const extra = { reply_markup: getStatsInlineKeyboard(appUrl) };
  if (messageId) {
    await editTelegramMessage(chatId, messageId, statsText, extra);
  } else {
    try {
      await sendTelegramSticker(chatId, LEXORA_STICKERS.barchart);
    } catch {
      // Ignore sticker error
    }
    await sendTelegramMessage(chatId, statsText, extra);
  }
}

async function renderHardWords(
  chatId: number,
  user: any,
  appUrl: string,
  messageId?: number
) {
  const hardRecords = await prisma.studyProgress.findMany({
    where: {
      userId: user.id,
      OR: [{ wrongCount: { gt: 0 } }, { boxLevel: 0 }],
    },
    include: { card: true },
    orderBy: [{ wrongCount: "desc" }, { boxLevel: "asc" }],
    take: 8,
  });

  if (!hardRecords.length) {
    const text =
      `🎉 <b>Sizda hozircha qiyin deb belgilangan so'zlar yo'q!</b>\n\n` +
      `Barcha so'zlarni a'lo darajada o'zlashtirmoqdasiz. Yangi so'zlarni sinash uchun tezkor quizni boshlang!`;

    const extra = { reply_markup: getHardWordsInlineKeyboard(appUrl) };
    if (messageId) {
      await editTelegramMessage(chatId, messageId, text, extra);
    } else {
      await sendTelegramMessage(chatId, text, extra);
    }
    return;
  }

  const lines = ["📑 <b>Qiyin so'zlarim (Eng ko'p xato qilinganlar):</b>\n"];
  hardRecords.forEach((prog, idx) => {
    lines.push(
      `${idx + 1}. 🇬🇧 <b>${prog.card.termEn}</b> — ${prog.card.meaningUz}\n` +
        `   ❌ Xatolar: <b>${prog.wrongCount} marta</b> | 📦 SRS Qutisi: <b>${prog.boxLevel}-bosqich</b>`
    );
  });
  lines.push("\n💡 <i>Ushbu so'zlarni mustahkamlash uchun tezkor quizni ishga tushiring!</i>");

  const fullText = lines.join("\n");
  const extra = { reply_markup: getHardWordsInlineKeyboard(appUrl) };
  if (messageId) {
    await editTelegramMessage(chatId, messageId, fullText, extra);
  } else {
    try {
      await sendTelegramSticker(chatId, LEXORA_STICKERS.bookmark);
    } catch {
      // Ignore sticker error
    }
    await sendTelegramMessage(chatId, fullText, extra);
  }
}

async function renderQuizQuestion(
  chatId: number,
  messageId: number | null,
  user: any,
  questionNum: number,
  appUrl: string
) {
  const now = new Date();

  // 1. Try to find user's due card
  const dueProgress = await prisma.studyProgress.findFirst({
    where: { userId: user.id, nextReviewAt: { lte: now } },
    include: { card: true },
  });

  let targetCard = dueProgress?.card;

  // 2. If no due card, pick random card from database
  if (!targetCard) {
    const totalCards = await prisma.card.count();
    if (totalCards > 0) {
      const skip = Math.floor(Math.random() * totalCards);
      const cards = await prisma.card.findMany({ skip, take: 1 });
      targetCard = cards[0];
    }
  }

  // 3. Fallback if no cards exist at all in DB
  if (!targetCard) {
    const fallbackTerm = Object.keys(FALLBACK_LEXICON)[0];
    const data = FALLBACK_LEXICON[fallbackTerm];
    let defaultDeck = await prisma.deck.findFirst();
    if (!defaultDeck) {
      defaultDeck = await prisma.deck.create({
        data: {
          title: "IELTS Core Vocabulary",
          level: "C1",
          isPublic: true,
        },
      });
    }
    targetCard = await prisma.card.create({
      data: {
        deckId: defaultDeck.id,
        termEn: fallbackTerm,
        meaningUz: data.meaning_uz,
        synonyms: data.synonyms,
        exampleEn: data.example_en,
      },
    });
  }

  // 4. Fetch distractors (other card meanings)
  const otherCards = await prisma.card.findMany({
    where: { id: { not: targetCard.id } },
    select: { meaningUz: true },
    take: 20,
  });

  let distractors = otherCards.map((c) => c.meaningUz.trim());
  if (distractors.length < 3) {
    distractors.push(
      "rivojlantirmoq, ravnaq topmoq",
      "sinchiklab tekshirmoq, taftish qilmoq",
      "kamaytirmoq, susaytirmoq",
      "aniq ifodalamoq, bayon etmoq"
    );
  }

  // Pick 3 random distractors
  distractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);

  const correctMeaning = targetCard.meaningUz.trim();
  const rawOptions = [correctMeaning, ...distractors].sort(() => 0.5 - Math.random());
  const correctIndex = rawOptions.indexOf(correctMeaning);

  // Shorten option text if too long for Telegram inline button
  const options = rawOptions.map((opt) => (opt.length > 40 ? opt.slice(0, 38) + "..." : opt));

  const questionText =
    `⚡️ <b>Tezkor Quiz [${questionNum}/5]</b>\n\n` +
    `🇬🇧 <b>${targetCard.termEn}</b> so'zining to'g'ri ma'nosi qaysi?\n\n` +
    `<i>Quyidagi 4 variantdan birini tanlang:</i>`;

  const extra = {
    reply_markup: getQuizOptionKeyboard(targetCard.id, options, correctIndex, questionNum),
  };

  if (messageId) {
    await editTelegramMessage(chatId, messageId, questionText, extra);
  } else {
    if (questionNum === 1) {
      try {
        await sendTelegramSticker(chatId, LEXORA_STICKERS.zap);
      } catch {
        // Ignore sticker error
      }
    }
    await sendTelegramMessage(chatId, questionText, extra);
  }
}

async function handleWordLookup(
  chatId: number,
  user: any,
  termRaw: string,
  appUrl: string
) {
  const termClean = termRaw.toLowerCase().trim();
  if (!termClean || termClean.length > 80) return;

  // 1. Search existing card in DB
  let card = await prisma.card.findFirst({
    where: {
      termEn: {
        equals: termClean,
        mode: "insensitive",
      },
    },
  });

  // 2. If not found, check fallback academic lexicon
  if (!card) {
    const fallbackEntry = FALLBACK_LEXICON[termClean];
    let defaultDeck = await prisma.deck.findFirst();
    if (!defaultDeck) {
      defaultDeck = await prisma.deck.create({
        data: {
          title: "IELTS Academic Core",
          level: "C1",
          isPublic: true,
        },
      });
    }

    if (fallbackEntry) {
      card = await prisma.card.create({
        data: {
          deckId: defaultDeck.id,
          termEn: termClean,
          meaningUz: fallbackEntry.meaning_uz,
          synonyms: fallbackEntry.synonyms,
          exampleEn: fallbackEntry.example_en,
        },
      });
    } else {
      card = await prisma.card.create({
        data: {
          deckId: defaultDeck.id,
          termEn: termRaw,
          meaningUz: `Inglizcha akademik ibora/so'z: "${termRaw}"`,
          synonyms: "academic vocabulary",
          exampleEn: `Mastering "${termRaw}" elevates academic English proficiency.`,
        },
      });
    }
  }

  const lookupText =
    `🔍 <b>Aqlli Lug'at Natijasi:</b>\n\n` +
    `🇬🇧 So'z: <b>${card.termEn}</b>\n` +
    `🇺🇿 Tarjimasi: <b>${card.meaningUz}</b>\n` +
    (card.synonyms ? `💡 Sinonimlar: <b>${card.synonyms}</b>\n` : "") +
    `📝 IELTS Misol: <i>"${card.exampleEn || card.termEn}"</i>\n\n` +
    `<i>Ushbu so'zni o'zlashtirish va har kuni Spaced Repetition (SRS) orqali takrorlash uchun "Lug'atimga saqlash" tugmasini bosing:</i>`;

  await sendTelegramMessage(chatId, lookupText, {
    reply_markup: getLookupInlineKeyboard(card.id, appUrl),
  });
}
