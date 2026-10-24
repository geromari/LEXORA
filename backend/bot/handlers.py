import logging
import random
from typing import Dict, List, Optional
from aiogram import Bot, F, Router
from aiogram.filters import Command, CommandObject, CommandStart
from aiogram.types import CallbackQuery, Message, PollAnswer
from sqlalchemy import func, or_, select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import create_access_token
from app.models.models import Card, Deck, StudyProgress, TelegramAuthSession, User, utc_now
from app.services.ai import FALLBACK_ACADEMIC_LEXICON
from app.services.srs import calculate_next_review
from bot.keyboards import (
    get_hard_words_keyboard,
    get_lookup_keyboard,
    get_main_reply_keyboard,
    get_quiz_feedback_keyboard,
    get_quiz_finished_keyboard,
    get_quiz_inline_keyboard,
    get_reminder_keyboard,
    get_stats_keyboard,
    get_welcome_keyboard,
)

logger = logging.getLogger("lexora.bot.handlers")
router = Router(name="lexora_bot_handlers")

# In-memory session tracking for active quizzes and polls
POLL_MAP: Dict[str, dict] = {}

# ACTIVE_QUIZZES: tg_user_id -> { db_user_id, cards, current_idx, score }
ACTIVE_QUIZZES: Dict[int, dict] = {}

# USER_SAVED_TERMS_CACHE: term_lower -> { term_en, meaning_uz, synonyms, example_en, level }
TERM_CACHE: Dict[str, dict] = {}

# USER_REMINDER_PREFS: tg_user_id -> bool
USER_REMINDER_PREFS: Dict[int, bool] = {}


# ==============================================================================
# Helper Functions
# ==============================================================================

async def get_or_create_user(message_user, session) -> User:
    """Finds or registers a User model instance for a Telegram user."""
    stmt = select(User).where(User.telegram_id == message_user.id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    today = utc_now().date()
    if user:
        if user.last_active_date != today:
            if user.last_active_date and (today - user.last_active_date).days == 1:
                user.streak_count += 1
            elif not user.last_active_date or (today - user.last_active_date).days > 1:
                user.streak_count = 1
            user.last_active_date = today
            await session.commit()
        return user

    base_username = message_user.username or message_user.first_name or f"tg_{message_user.id}"
    uname_check = await session.execute(select(User).where(User.username == base_username))
    if uname_check.scalar_one_or_none():
        base_username = f"{base_username}_{message_user.id % 1000}"

    user = User(
        username=base_username,
        telegram_id=message_user.id,
        streak_count=1,
        last_active_date=today,
        created_at=utc_now(),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def send_or_edit_quiz_question(tg_user_id: int, message_or_callback):
    """Sends or edits the current question in an active 5-word quiz session."""
    session_data = ACTIVE_QUIZZES.get(tg_user_id)
    if not session_data:
        return

    cards = session_data["cards"]
    current_idx = session_data["current_idx"]

    if current_idx >= len(cards):
        # Completed
        score = session_data["score"]
        db_user_id = session_data["db_user_id"]

        streak = 1
        async with AsyncSessionLocal() as session:
            u = await session.get(User, db_user_id)
            if u:
                streak = u.streak_count

        finished_text = (
            f"🎉 <b>Ajoyib, Quiz yakunlandi!</b>\n\n"
            f"📊 Natijangiz: <b>{score} / {len(cards)}</b> to'g'ri!\n"
            f"🔥 Kunlik seriyangiz: <b>{streak} kun</b>.\n\n"
            f"Barcha javoblaringiz Spaced Repetition (SRS) xotira tizimiga saqlandi. "
            f"So'zlar unutilmasligi uchun tizim ularni o'z vaqtida qayta taqdim etadi."
        )

        keyboard = get_quiz_finished_keyboard(settings.WEBAPP_URL)
        if isinstance(message_or_callback, CallbackQuery):
            await message_or_callback.message.edit_text(finished_text, reply_markup=keyboard)
        else:
            await message_or_callback.answer(finished_text, reply_markup=keyboard)

        ACTIVE_QUIZZES.pop(tg_user_id, None)
        return

    card_item = cards[current_idx]
    card = card_item["card"]
    options = card_item["options"]

    question_text = (
        f"🧠 <b>Tezkor Quiz [{current_idx + 1}/{len(cards)}]</b>\n\n"
        f"🇬🇧 <b>{card.term_en}</b> so'zining to'g'ri ma'nosi qaysi?\n\n"
        f"<i>Quyidagi 4 variantdan birini tanlang:</i>"
    )

    keyboard = get_quiz_inline_keyboard(question_id=current_idx, options=options)

    if isinstance(message_or_callback, CallbackQuery):
        await message_or_callback.message.edit_text(question_text, reply_markup=keyboard)
    else:
        await message_or_callback.answer(question_text, reply_markup=keyboard)


# ==============================================================================
# 1. Onboarding & Account Sync (/start with deep-link)
# ==============================================================================

@router.message(CommandStart())
async def handle_start(message: Message, command: CommandObject):
    """
    Handles /start command, including deep-link 1-click auth and syncing:
    /start auth_<session_token>
    /start link_<user_id>
    """
    async with AsyncSessionLocal() as session:
        # 1. Deep-link auth session: /start auth_<session_token>
        if command.args and command.args.startswith("auth_"):
            session_token = command.args.replace("auth_", "").strip()
            sess_stmt = select(TelegramAuthSession).where(
                TelegramAuthSession.session_token == session_token
            )
            res = await session.execute(sess_stmt)
            auth_session = res.scalar_one_or_none()

            if auth_session and auth_session.status == "pending":
                user = None
                # If linking an existing web user
                if auth_session.user_id:
                    user = await session.get(User, auth_session.user_id)
                    if user:
                        user.telegram_id = message.from_user.id
                        if message.from_user.username and not user.username:
                            user.username = message.from_user.username
                        user.last_active_date = utc_now().date()

                # Otherwise find or create by telegram_id
                if not user:
                    user = await get_or_create_user(message.from_user, session)

                jwt_token = create_access_token(data={"sub": str(user.id), "username": user.username})

                auth_session.status = "completed"
                auth_session.user_id = user.id
                auth_session.telegram_id = message.from_user.id
                auth_session.jwt_token = jwt_token
                await session.commit()

                reply_text = (
                    "🎉 <b>Akkauntingiz veb-platforma bilan muvaffaqiyatli ulandi! Saytga qaytishingiz mumkin.</b>\n\n"
                    f"Foydalanuvchi: <b>{user.username}</b>\n"
                    f"🔥 Kunlik seriyangiz: <b>{user.streak_count} kun</b>\n\n"
                    "Brauzeringizdagi sahifa avtomatik yangilanadi va to'liq ma'lumotlaringiz sinxronlashadi."
                )
                await message.answer(reply_text, reply_markup=get_welcome_keyboard(settings.WEBAPP_URL))
                return

        # 2. Backwards-compatible /start link_<user_id>
        if command.args and command.args.startswith("link_"):
            user_id_raw = command.args.replace("link_", "").strip()
            if user_id_raw.isdigit():
                target_user_id = int(user_id_raw)
                stmt = select(User).where(User.id == target_user_id)
                res = await session.execute(stmt)
                user = res.scalar_one_or_none()

                if user:
                    user.telegram_id = message.from_user.id
                    if message.from_user.username and not user.username:
                        user.username = message.from_user.username
                    user.last_active_date = utc_now().date()
                    await session.commit()

                    text = (
                        f"🎉 <b>Muvaffaqiyatli bog'landi!</b>\n\n"
                        f"Sizning Lexora profilingiz (<b>{user.username}</b>) ushbu Telegram akkaunti bilan "
                        f"muvaffaqiyatli sinxronlashtirildi!\n\n"
                        f"Endi siz Telegram orqali ham to'plamlaringizni takrorlashingiz, "
                        f"kunlik eslatmalar olishingiz va yangi so'zlarni saqlashingiz mumkin."
                    )
                    await message.answer(text, reply_markup=get_welcome_keyboard(settings.WEBAPP_URL))
                    return

        # 3. Standard Registration or Login
        user = await get_or_create_user(message.from_user, session)
        name = message.from_user.first_name or user.username

        welcome_text = (
            f"✨ <b>Assalomu alaykum, {name}!</b>\n\n"
            f"<b>Lexora</b> — Spaced Repetition (SRS) va AI asosidagi akademik "
            f"IELTS & CEFR so'z yodlash botiga xush kelibsiz!\n\n"
            f"🔥 <b>Kunlik seriyangiz:</b> {user.streak_count} kun\n\n"
            f"<b>Asosiy bo'limlar:</b>\n"
            f"• 🎯 <b>Tezkor Quiz</b>: 5 ta so'zdan iborat interaktiv mashg'ulot.\n"
            f"• 🗓 <b>Kunlik takrorlash</b>: Unutilish arafasidagi so'zlarni qaytarish.\n"
            f"• 👤 <b>Profil</b>: Shaxsiy statistika, seriya va o'zlashtirilgan so'zlar.\n"
            f"• 📌 <b>Qiyin so'zlar</b>: Eng ko'p xato qilingan so'zlar ro'yxati.\n"
            f"• 💾 <b>Aqlli Lug'at</b>: Istalgan inglizcha so'z yuboring — tarjimasi va IELTS misoli bilan to'plamingizga saqlaydi.\n"
            f"• 💻 <b>Web Platforma</b>: Lexora veb-ilovasi bilan to'liq integratsiya."
        )

        # Set persistent styled bottom reply keyboard
        await message.answer(
            "⚡️ Quyidagi menyudan kerakli bo'limni tanlang:",
            reply_markup=get_main_reply_keyboard(settings.WEBAPP_URL),
        )
        await message.answer(
            welcome_text,
            reply_markup=get_welcome_keyboard(settings.WEBAPP_URL),
        )


@router.message(Command("help"))
async def handle_help_command(message: Message):
    """Provides bot usage guide and commands."""
    help_text = (
        "📖 <b>Lexora Bot Qo'llanmasi:</b>\n\n"
        "• <b>/start</b> — Botni ishga tushirish va asosiy menyu\n"
        "• <b>/quiz</b> yoki 🎯 <b>Tezkor Quiz</b> — 5 ta so'zdan iborat tezkor SRS takrorlash quizi\n"
        "• <b>/stats</b> yoki 👤 <b>Profil</b> — O'rganilgan so'zlar, aniqlik va seriyangiz statistikasi\n"
        "• <b>/hard_words</b> yoki 📌 <b>Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar ro'yxati\n"
        "• <b>/reminder</b> yoki 🔔 <b>Eslatmalar</b> — Kunlik takrorlash eslatmalari sozlamasi\n\n"
        "💡 <b>Aqlli Lug'at Qidiruvi:</b>\n"
        "Botga istalgan inglizcha so'zni yozib yuboring (masalan: <code>scrutinize</code>, <code>thrive</code> yoki <code>window dressing</code>). "
        "Bot uning o'zbekcha tarjimasi, IELTS kontekst misoli va sinonimlarini ko'rsatadi hamda shaxsiy to'plamingizga bir bosishda saqlab beradi!"
    )
    await message.answer(help_text, reply_markup=get_welcome_keyboard(settings.WEBAPP_URL))


@router.callback_query(F.data == "help")
async def handle_help_callback(callback: CallbackQuery):
    help_text = (
        "📖 <b>Lexora Bot Qo'llanmasi:</b>\n\n"
        "• <b>/quiz</b> yoki 🎯 <b>Tezkor Quiz</b> — 5 ta so'zdan iborat tezkor SRS takrorlash quizi\n"
        "• <b>/stats</b> yoki 👤 <b>Profil</b> — O'rganilgan so'zlar, aniqlik va seriyangiz statistikasi\n"
        "• <b>/hard_words</b> yoki 📌 <b>Qiyin so'zlar</b> — Eng ko'p xato qilingan so'zlar\n"
        "• <b>/reminder</b> yoki 🔔 <b>Eslatmalar</b> — Kunlik takrorlash eslatmalari sozlamasi\n\n"
        "💡 <b>Aqlli Lug'at:</b> Istalgan inglizcha so'z yuboring — tarjimasi va misolini ko'rsatib, to'plamingizga saqlaydi!"
    )
    await callback.message.edit_text(help_text, reply_markup=get_welcome_keyboard(settings.WEBAPP_URL))
    await callback.answer()


@router.callback_query(F.data == "main_menu")
async def handle_main_menu_callback(callback: CallbackQuery):
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(callback.from_user, session)
        name = callback.from_user.first_name or user.username

        welcome_text = (
            f"✨ <b>Asosiy Menyu</b>\n\n"
            f"Foydalanuvchi: <b>{name}</b>\n"
            f"🔥 Kunlik seriya: <b>{user.streak_count} kun</b>\n\n"
            f"Quyidagi bo'limlardan birini tanlang yoki to'g'ridan-to'g'ri inglizcha so'z yozib yuboring:"
        )
        await callback.message.edit_text(
            welcome_text,
            reply_markup=get_welcome_keyboard(settings.WEBAPP_URL)
        )
        await callback.answer()


# ==============================================================================
# 2. Statistics (/stats, callback my_stats, callback stats)
# ==============================================================================

@router.message(Command("stats"))
async def handle_stats_command(message: Message):
    await show_user_stats(message.from_user, message.answer)


@router.callback_query(F.data.in_(["stats", "my_stats"]))
async def handle_stats_callback(callback: CallbackQuery):
    await show_user_stats(callback.from_user, callback.message.edit_text)
    await callback.answer()


async def show_user_stats(from_user, send_fn):
    """Calculates and renders user progress statistics."""
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(from_user, session)
        now = utc_now()

        # 1. Total learned (box_level >= 3)
        learned_stmt = select(func.count(StudyProgress.id)).where(
            StudyProgress.user_id == user.id,
            StudyProgress.box_level >= 3,
        )
        total_learned = (await session.execute(learned_stmt)).scalar() or 0

        # 2. Total words currently due for review
        due_stmt = select(func.count(StudyProgress.id)).where(
            StudyProgress.user_id == user.id,
            StudyProgress.next_review_at <= now,
        )
        total_due = (await session.execute(due_stmt)).scalar() or 0

        # 3. Total cards in progress
        total_studying_stmt = select(func.count(StudyProgress.id)).where(
            StudyProgress.user_id == user.id
        )
        total_studying = (await session.execute(total_studying_stmt)).scalar() or 0

        # 4. Total decks owned
        decks_stmt = select(func.count(Deck.id)).where(Deck.user_id == user.id)
        total_decks = (await session.execute(decks_stmt)).scalar() or 0

        # 5. Accuracy approximation
        points_stmt = select(func.sum(StudyProgress.box_level)).where(
            StudyProgress.user_id == user.id
        )
        total_points = (await session.execute(points_stmt)).scalar() or 0
        accuracy = (
            min(100, round((total_points / max(1, total_studying * 5.0)) * 100))
            if total_studying > 0
            else 85
        )

        stats_text = (
            f"👤 <b>Mening Profilim & Statistikam: {user.username}</b>\n\n"
            f"🔥 <b>Kunlik seriya:</b> {user.streak_count} kun uzluksiz\n"
            f"🎓 <b>O'zlashtirilgan so'zlar:</b> {total_learned} ta\n"
            f"📚 <b>O'rganilayotgan so'zlar:</b> {total_studying} ta\n"
            f"🗓 <b>Bugungi takrorlash navbati:</b> {total_due} ta so'z\n"
            f"📁 <b>Shaxsiy to'plamlar:</b> {total_decks} ta\n"
            f"🎯 <b>O'rtacha aniqlik ko'rsatkichi:</b> {accuracy}%\n\n"
            f"<i>Spaced Repetition algoritmi har kuni so'zlarni optimal intervallarda takrorlashni ta'minlaydi.</i>"
        )

        await send_fn(stats_text, reply_markup=get_stats_keyboard(settings.WEBAPP_URL))


# ==============================================================================
# 3. Hard Words (/hard_words & callback hard_words)
# ==============================================================================

@router.message(Command("hard_words"))
async def handle_hard_words_command(message: Message):
    await show_hard_words(message.from_user, message.answer)


@router.callback_query(F.data == "hard_words")
async def handle_hard_words_callback(callback: CallbackQuery):
    await show_hard_words(callback.from_user, callback.message.edit_text)
    await callback.answer()


async def show_hard_words(from_user, send_fn):
    """Fetches user's cards with highest wrong_count or box_level=0."""
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(from_user, session)

        stmt = (
            select(StudyProgress, Card)
            .join(Card, StudyProgress.card_id == Card.id)
            .where(
                StudyProgress.user_id == user.id,
                or_(StudyProgress.wrong_count > 0, StudyProgress.box_level == 0)
            )
            .order_by(StudyProgress.wrong_count.desc(), StudyProgress.box_level.asc())
            .limit(8)
        )
        results = (await session.execute(stmt)).all()

        if not results:
            text = (
                "🎉 <b>Sizda hozircha qiyin deb belgilangan so'zlar yo'q!</b>\n\n"
                "Barcha so'zlarni yaxshi o'zlashtirmoqdasiz. "
                "Yangi so'zlarni sinash uchun tezkor quizni boshlang!"
            )
            await send_fn(text, reply_markup=get_hard_words_keyboard(settings.WEBAPP_URL))
            return

        lines = ["📌 <b>Qiyin so'zlarim (Eng ko'p xato qilinganlar):</b>\n"]
        for idx, (prog, card) in enumerate(results, 1):
            lines.append(
                f"{idx}. 🇬🇧 <b>{card.term_en}</b> — {card.meaning_uz}\n"
                f"   ❌ Xatolar soni: <b>{prog.wrong_count} marta</b> | 📦 SRS Qutisi: <b>{prog.box_level}-bosqich</b>"
            )

        lines.append(
            "\n💡 <i>Ushbu so'zlarni tezkor quiz orqali qayta takrorlab xotirangizni mustahkamlashingiz mumkin.</i>"
        )
        await send_fn("\n".join(lines), reply_markup=get_hard_words_keyboard(settings.WEBAPP_URL))


# ==============================================================================
# 4. Interactive Quiz in Bot (start_quiz, quiz:start, /quiz)
# ==============================================================================

@router.message(Command("quiz"))
async def handle_quiz_command(message: Message):
    await start_interactive_quiz(message.from_user, message)


@router.callback_query(F.data.in_(["start_quiz", "quiz:start"]))
async def handle_quiz_callback(callback: CallbackQuery):
    await start_interactive_quiz(callback.from_user, callback)
    await callback.answer()


async def start_interactive_quiz(from_user, message_or_callback):
    """Pulls 5 cards from the database and starts interactive 4-option inline quiz."""
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(from_user, session)
        now = utc_now()

        # 1. Prioritize due cards
        due_stmt = (
            select(Card)
            .join(StudyProgress, StudyProgress.card_id == Card.id)
            .where(
                StudyProgress.user_id == user.id,
                StudyProgress.next_review_at <= now,
            )
            .order_by(StudyProgress.next_review_at.asc())
            .limit(5)
        )
        selected_cards = list((await session.execute(due_stmt)).scalars().all())

        # 2. If fewer than 5, pull hardest cards or random cards from DB
        if len(selected_cards) < 5:
            needed = 5 - len(selected_cards)
            existing_ids = [c.id for c in selected_cards]
            fallback_stmt = (
                select(Card)
                .where(~Card.id.in_(existing_ids) if existing_ids else True)
                .order_by(func.random())
                .limit(needed)
            )
            sample_cards = list((await session.execute(fallback_stmt)).scalars().all())
            selected_cards.extend(sample_cards)

        if not selected_cards:
            notice = "Hozircha mashq qilish uchun so'zlar mavjud emas."
            if isinstance(message_or_callback, CallbackQuery):
                await message_or_callback.message.edit_text(notice)
            else:
                await message_or_callback.answer(notice)
            return

        # 3. Distractor pool from existing card meanings
        all_meanings_stmt = select(Card.meaning_uz).where(Card.meaning_uz.isnot(None)).limit(50)
        all_meanings = [m for m in (await session.execute(all_meanings_stmt)).scalars().all() if m]

        cards_data = []
        for card in selected_cards:
            correct_meaning = card.meaning_uz.strip()
            distractors = [m.strip() for m in all_meanings if m.strip() != correct_meaning]
            if len(distractors) < 3:
                distractors.extend([
                    "rivojlantirmoq, gullab-yashnamoq",
                    "sinchiklab tekshirmoq, taftish qilmoq",
                    "kamaytirmoq, susaytirmoq",
                    "aniq ifodalamoq, bayon etmoq"
                ])
            picked = random.sample(distractors, 3)
            options = [correct_meaning] + picked
            random.shuffle(options)
            correct_idx = options.index(correct_meaning)

            # Sanitize option length for inline buttons
            sanitized_options = [opt[:45] + ("..." if len(opt) > 45 else "") for opt in options]

            cards_data.append({
                "card": card,
                "options": sanitized_options,
                "correct_meaning": correct_meaning,
                "correct_idx": correct_idx,
            })

        # Register active session
        ACTIVE_QUIZZES[from_user.id] = {
            "db_user_id": user.id,
            "cards": cards_data,
            "current_idx": 0,
            "score": 0,
        }

        # Send first question
        await send_or_edit_quiz_question(from_user.id, message_or_callback)


@router.callback_query(F.data.startswith("qopt:"))
async def handle_quiz_option_selected(callback: CallbackQuery):
    """
    Handles user tapping one of the 4 inline options.
    Updates StudyProgress (box_level, wrong_count, next_review_at) in the shared DB.
    """
    parts = callback.data.split(":")
    if len(parts) != 3:
        await callback.answer()
        return

    q_idx = int(parts[1])
    opt_idx = int(parts[2])

    session_data = ACTIVE_QUIZZES.get(callback.from_user.id)
    if not session_data or q_idx != session_data["current_idx"]:
        await callback.answer("Bu savolga allaqachon javob berilgan.", show_alert=False)
        return

    cards = session_data["cards"]
    if q_idx >= len(cards):
        await callback.answer()
        return

    card_item = cards[q_idx]
    card = card_item["card"]
    correct_idx = card_item["correct_idx"]
    is_correct = (opt_idx == correct_idx)

    db_user_id = session_data["db_user_id"]

    # 1. Update StudyProgress & SRS stats in Database
    async with AsyncSessionLocal() as session:
        prog_stmt = select(StudyProgress).where(
            StudyProgress.user_id == db_user_id,
            StudyProgress.card_id == card.id,
        )
        prog = (await session.execute(prog_stmt)).scalar_one_or_none()

        current_box = prog.box_level if prog else 0
        current_streak = prog.correct_streak if prog else 0
        current_wrong = prog.wrong_count if prog else 0

        new_box, next_review, new_streak, new_wrong, _ = calculate_next_review(
            current_box, current_streak, current_wrong, is_correct
        )

        if prog:
            prog.box_level = new_box
            prog.next_review_at = next_review
            prog.correct_streak = new_streak
            prog.wrong_count = new_wrong
        else:
            prog = StudyProgress(
                user_id=db_user_id,
                card_id=card.id,
                box_level=new_box,
                next_review_at=next_review,
                correct_streak=new_streak,
                wrong_count=new_wrong,
            )
            session.add(prog)

        user = await session.get(User, db_user_id)
        if user:
            today = utc_now().date()
            if user.last_active_date != today:
                if user.last_active_date and (today - user.last_active_date).days == 1:
                    user.streak_count += 1
                elif not user.last_active_date or (today - user.last_active_date).days > 1:
                    user.streak_count = 1
                user.last_active_date = today

        await session.commit()

    if is_correct:
        session_data["score"] += 1
        status_header = "✅ <b>To'g'ri javob!</b>"
    else:
        status_header = f"❌ <b>Noto'g'ri!</b>\nTo'g'ri javob: <b>{card_item['correct_meaning']}</b>"

    feedback_text = (
        f"{status_header}\n\n"
        f"🇬🇧 <b>{card.term_en}</b> — {card_item['correct_meaning']}\n"
        f"📝 <b>IELTS Misol:</b> <i>\"{card.example_en or card.term_en}\"</i>\n"
        f"🔄 <b>Sinonimlar:</b> {card.synonyms or '—'}\n\n"
        f"<i>Spaced Repetition xotira ko'rsatkichi yangilandi: Box {new_box}.</i>"
    )

    is_last = (q_idx >= len(cards) - 1)
    await callback.message.edit_text(
        feedback_text,
        reply_markup=get_quiz_feedback_keyboard(is_last=is_last, webapp_url=settings.WEBAPP_URL)
    )
    await callback.answer("Javob qabul qilindi!")


@router.callback_query(F.data == "quiz:next")
async def handle_quiz_next(callback: CallbackQuery):
    """Advances to next question in active quiz session."""
    session_data = ACTIVE_QUIZZES.get(callback.from_user.id)
    if not session_data:
        await callback.answer("Quiz sessiyasi yakunlangan. Qaytadan boshlashingiz mumkin.", show_alert=True)
        return

    session_data["current_idx"] += 1
    await send_or_edit_quiz_question(callback.from_user.id, callback)
    await callback.answer()


# ==============================================================================
# 5. Persistent Bottom Reply Keyboard Button Actions
# ==============================================================================

@router.message(F.text.in_([
    "👤 Profil", "👤 Profilim", "Profil", "Profilim"
]))
async def handle_profile_button(message: Message):
    await show_user_stats(message.from_user, message.answer)


@router.message(F.text.in_([
    "🗓 Kunlik takrorlash", "Kunlik takrorlash", "Takrorlash"
]))
async def handle_daily_review_button(message: Message):
    await start_interactive_quiz(message.from_user, message)


@router.message(F.text.in_([
    "🎯 Tezkor Quiz (5 ta so'z)", "🎯 Tezkor Quiz", "Tezkor Quiz"
]))
async def handle_quiz_button(message: Message):
    await start_interactive_quiz(message.from_user, message)


@router.message(F.text.in_([
    "📌 Qiyin so'zlarim", "📌 Qiyin so'zlar", "Qiyin so'zlarim"
]))
async def handle_hard_words_button(message: Message):
    await show_hard_words(message.from_user, message.answer)


@router.message(F.text.in_([
    "🔔 Eslatmalar", "Eslatmalar"
]))
async def handle_reminder_button(message: Message):
    await handle_reminder_command(message)


@router.message(F.text.in_([
    "📖 Bot qo'llanmasi", "📖 Qo'llanma", "Qo'llanma"
]))
async def handle_help_button(message: Message):
    await handle_help_command(message)


@router.message(F.text.in_([
    "💻 Lexora Web Platformasi ↗️",
    "💻 Lexora Web Platformasi",
    "💻 Web Platforma ↗️",
    "Web Platforma",
]))
async def handle_web_platform_button(message: Message):
    web_url = settings.WEBAPP_URL
    text = (
        "💻 <b>Lexora Web Platformasi</b>\n\n"
        "Lexora to'liq funksional veb-ilovasi orqali kengaytirilgan mashqlar, "
        "interaktiv SRS fleshkartalar va IELTS tahlillaridan foydalanishingiz mumkin.\n\n"
        f"🔗 Manzil: <b>{web_url}</b>\n\n"
        "<i>Saytga kirgach 'Telegram orqali 1-click kirish' tugmasi yordamida to'g'ridan-to'g'ri tizimga ulanasiz.</i>"
    )
    await message.answer(text, reply_markup=get_welcome_keyboard(web_url))


# ==============================================================================
# 6. Instant Dictionary Lookup (Search DB / AI + 1-Tap Save)
# ==============================================================================

@router.message(F.text, ~F.text.startswith("/"))
async def handle_word_lookup(message: Message):
    """
    Instant dictionary lookup: when user sends an English term,
    searches DB or AI/fallback lexicon with 'Lug'atimga qo'shish' button.
    """
    term_raw = message.text.strip()
    if not term_raw or len(term_raw) > 80:
        return

    term_clean = term_raw.lower()

    # 1. Search database first
    async with AsyncSessionLocal() as session:
        stmt = select(Card).where(func.lower(Card.term_en) == term_clean)
        card = (await session.execute(stmt)).scalars().first()

        if card:
            entry = {
                "term_en": card.term_en,
                "meaning_uz": card.meaning_uz,
                "synonyms": card.synonyms or "—",
                "example_en": card.example_en or "Contextual sentence available in Lexora Web.",
                "level": "C1 / IELTS",
            }
        elif term_clean in FALLBACK_ACADEMIC_LEXICON:
            data = FALLBACK_ACADEMIC_LEXICON[term_clean]
            entry = {
                "term_en": term_clean,
                "meaning_uz": data["meaning_uz"],
                "synonyms": data.get("synonyms", "—"),
                "example_en": data.get("example_en", "Contextual usage."),
                "level": "C1 Academic",
            }
        else:
            # Fallback smart dictionary entry
            entry = {
                "term_en": term_raw.capitalize(),
                "meaning_uz": f"Inglizcha akademik ibora/so'z: '{term_raw}'",
                "synonyms": "academic vocabulary",
                "example_en": f"Academic contexts frequently utilize '{term_raw}' in formal discourse.",
                "level": "IELTS / CEFR",
            }

    TERM_CACHE[term_clean] = entry

    response_text = (
        f"📖 <b>{entry['term_en']}</b>  [<code>{entry['level']}</code>]\n\n"
        f"🇺🇿 <b>Ma'nosi:</b> {entry['meaning_uz']}\n"
        f"🔄 <b>Sinonimlar:</b> {entry['synonyms']}\n\n"
        f"📝 <b>IELTS Kontekst Misoli:</b>\n"
        f"<i>\"{entry['example_en']}\"</i>\n\n"
        f"Quyidagi tugma orqali so'zni shaxsiy to'plamingizga saqlab qo'yishingiz mumkin:"
    )

    await message.answer(
        response_text,
        reply_markup=get_lookup_keyboard(entry["term_en"], settings.WEBAPP_URL)
    )


@router.callback_query(F.data.startswith("save:"))
async def handle_save_word_callback(callback: CallbackQuery):
    """Saves looked-up word into user's personal deck and creates SRS progress."""
    term_key = callback.data.replace("save:", "").strip().lower()
    entry = TERM_CACHE.get(term_key)

    if not entry:
        await callback.answer("So'z ma'lumotlari yangilandi. Iltimos, qaytadan yozib ko'ring.", show_alert=True)
        return

    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(callback.from_user, session)

        # 1. Find or create user's personal deck: "Telegram Lug'atim"
        deck_stmt = select(Deck).where(
            Deck.user_id == user.id,
            Deck.title == "Telegram Lug'atim"
        )
        deck = (await session.execute(deck_stmt)).scalar_one_or_none()

        if not deck:
            deck = Deck(
                user_id=user.id,
                title="Telegram Lug'atim",
                description="Telegram bot orqali saqlangan akademik so'zlar",
                level=entry["level"],
                is_public=False,
                created_at=utc_now(),
            )
            session.add(deck)
            await session.flush()

        # 2. Check if card exists
        card_stmt = select(Card).where(
            Card.deck_id == deck.id,
            func.lower(Card.term_en) == entry["term_en"].lower()
        )
        card = (await session.execute(card_stmt)).scalar_one_or_none()

        if not card:
            card = Card(
                deck_id=deck.id,
                term_en=entry["term_en"],
                meaning_uz=entry["meaning_uz"],
                synonyms=entry["synonyms"],
                example_en=entry["example_en"],
            )
            session.add(card)
            await session.flush()

        # 3. Initialize SRS StudyProgress for user
        prog_stmt = select(StudyProgress).where(
            StudyProgress.user_id == user.id,
            StudyProgress.card_id == card.id
        )
        prog = (await session.execute(prog_stmt)).scalar_one_or_none()

        if not prog:
            prog = StudyProgress(
                user_id=user.id,
                card_id=card.id,
                box_level=0,
                next_review_at=utc_now(),
                correct_streak=0,
                wrong_count=0,
            )
            session.add(prog)

        await session.commit()

    await callback.answer(
        f"✅ '{entry['term_en']}' shaxsiy to'plamingizga muvaffaqiyatli saqlandi!",
        show_alert=True
    )


# ==============================================================================
# 7. Reminder Settings Handler (/reminder & callbacks)
# ==============================================================================

@router.message(Command("reminder"))
async def handle_reminder_command(message: Message):
    is_active = USER_REMINDER_PREFS.get(message.from_user.id, True)
    text = (
        "🔔 <b>Kunlik Spaced Repetition Eslatmalari</b>\n\n"
        f"Holat: {'✅ <b>Faol</b> (Har kuni 09:00 va 20:00 da)' if is_active else '❌ <b>O\'chirilgan</b>'}\n\n"
        "Eslatma faol bo'lganda, bot sizda takrorlash navbatida so'zlar borligida eslatib turadi."
    )
    await message.answer(text, reply_markup=get_reminder_keyboard(is_active))


@router.callback_query(F.data == "reminder:toggle")
async def handle_reminder_settings_callback(callback: CallbackQuery):
    is_active = USER_REMINDER_PREFS.get(callback.from_user.id, True)
    text = (
        "🔔 <b>Kunlik Spaced Repetition Eslatmalari</b>\n\n"
        f"Holat: {'✅ <b>Faol</b> (Har kuni 09:00 va 20:00 da)' if is_active else '❌ <b>O\'chirilgan</b>'}\n\n"
        "Eslatmani quyidagi tugma orqali yoqishingiz yoki to'xtatishingiz mumkin:"
    )
    await callback.message.edit_text(text, reply_markup=get_reminder_keyboard(is_active))
    await callback.answer()


@router.callback_query(F.data == "reminder:toggle_action")
async def handle_reminder_toggle_action(callback: CallbackQuery):
    current = USER_REMINDER_PREFS.get(callback.from_user.id, True)
    new_status = not current
    USER_REMINDER_PREFS[callback.from_user.id] = new_status

    status_str = "✅ Yoqildi" if new_status else "🔕 O'chirildi"
    await callback.answer(f"Eslatmalar {status_str}!", show_alert=False)

    text = (
        "🔔 <b>Kunlik Spaced Repetition Eslatmalari</b>\n\n"
        f"Holat: {'✅ <b>Faol</b> (Har kuni 09:00 va 20:00 da)' if new_status else '❌ <b>O\'chirilgan</b>'}\n\n"
        "Eslatmani quyidagi tugma orqali yoqishingiz yoki to'xtatishingiz mumkin:"
    )
    await callback.message.edit_text(text, reply_markup=get_reminder_keyboard(new_status))
