import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.models import Card, Deck, StudyProgress, User, utc_now
from app.services.srs import calculate_next_review
from bot.handlers import (
    get_or_create_user,
    POLL_MAP,
    ACTIVE_QUIZZES,
    TERM_CACHE,
)
from bot.keyboards import (
    get_hard_words_keyboard,
    get_lookup_keyboard,
    get_main_reply_keyboard,
    get_quiz_finished_keyboard,
    get_reminder_keyboard,
    get_stats_keyboard,
    get_welcome_keyboard,
)
from bot.scheduler import send_due_reminders


@pytest.mark.asyncio
async def test_bot_get_or_create_user():
    """Test Telegram user auto-registration and retrieval in database."""
    async with AsyncSessionLocal() as session:
        fake_tg_user = MagicMock()
        fake_tg_user.id = 9988776655
        fake_tg_user.username = "test_bot_user"
        fake_tg_user.first_name = "BotTester"

        user = await get_or_create_user(fake_tg_user, session)
        assert user is not None
        assert user.telegram_id == 9988776655
        assert user.streak_count >= 1

        # Second call returns existing user
        user2 = await get_or_create_user(fake_tg_user, session)
        assert user2.id == user.id


@pytest.mark.asyncio
async def test_bot_keyboards_generation():
    """Test all keyboard generators create valid inline and reply markups."""
    # 0. Main reply keyboard
    rkb = get_main_reply_keyboard("https://lexora.uz")
    assert len(rkb.keyboard) >= 3
    assert any("Kunlik takrorlash" in btn.text for row in rkb.keyboard for btn in row)
    assert any("Profil" in btn.text for row in rkb.keyboard for btn in row)

    # 1. Welcome keyboard
    kb1 = get_welcome_keyboard("http://localhost:3000")
    assert len(kb1.inline_keyboard) >= 3

    kb1_https = get_welcome_keyboard("https://lexora.uz")
    assert len(kb1_https.inline_keyboard) >= 4

    # 2. Lookup keyboard
    kb2 = get_lookup_keyboard("scrutinize", "http://localhost:3000")
    assert any("save:scrutinize" in btn.callback_data for row in kb2.inline_keyboard for btn in row if btn.callback_data)

    # 3. Stats keyboard
    kb3 = get_stats_keyboard("http://localhost:3000")
    assert any(btn.callback_data == "quiz:start" for row in kb3.inline_keyboard for btn in row if btn.callback_data)

    # 4. Finished keyboard
    kb4 = get_quiz_finished_keyboard("http://localhost:3000")
    assert len(kb4.inline_keyboard) >= 2

    # 5. Reminder keyboard
    kb5 = get_reminder_keyboard(True)
    assert any("o'chirish" in btn.text.lower() for row in kb5.inline_keyboard for btn in row)


@pytest.mark.asyncio
async def test_bot_srs_quiz_mechanics():
    """Test Spaced Repetition calculation for quiz poll answers."""
    # Correct answer advances box level and delays review
    box, next_rev, streak, wrong, hours = calculate_next_review(
        current_box=0, current_streak=0, current_wrong=0, correct=True
    )
    assert box == 1
    assert streak == 1
    assert hours == 24
    assert next_rev > utc_now()

    # Wrong answer resets to Box 0 for immediate reinforcement
    box2, next_rev2, streak2, wrong2, hours2 = calculate_next_review(
        current_box=3, current_streak=4, current_wrong=1, correct=False
    )
    assert box2 == 0
    assert streak2 == 0
    assert wrong2 == 2
    assert hours2 == 0


@pytest.mark.asyncio
async def test_scheduler_due_reminders_mock():
    """Test scheduler scans and executes without exceptions."""
    mock_bot = AsyncMock()
    await send_due_reminders(mock_bot)
    # Ensure no unhandled exception occurred
    assert True


@pytest.mark.asyncio
async def test_bot_interactive_quiz_flow():
    """Test 5-word 4-inline-option quiz session and DB progress update."""
    from bot.handlers import start_interactive_quiz, handle_quiz_option_selected, ACTIVE_QUIZZES

    import random
    fake_user = MagicMock()
    fake_user.id = random.randint(100000000, 999999999)
    fake_user.username = f"quiz_tester_{fake_user.id}"
    fake_user.first_name = "Quizzer"

    mock_msg = MagicMock()
    mock_msg.answer = AsyncMock()

    # 1. Start quiz
    await start_interactive_quiz(fake_user, mock_msg)
    assert fake_user.id in ACTIVE_QUIZZES
    quiz_session = ACTIVE_QUIZZES[fake_user.id]
    assert len(quiz_session["cards"]) == 5
    for c in quiz_session["cards"]:
        assert len(c["options"]) == 4

    # 2. Answer question 0 with correct option
    correct_idx = quiz_session["cards"][0]["correct_idx"]
    mock_cb = MagicMock()
    mock_cb.from_user = fake_user
    mock_cb.data = f"qopt:0:{correct_idx}"
    mock_cb.message.edit_text = AsyncMock()
    mock_cb.answer = AsyncMock()

    await handle_quiz_option_selected(mock_cb)
    mock_cb.message.edit_text.assert_called_once()
    assert "To'g'ri javob" in mock_cb.message.edit_text.call_args[0][0]
    assert quiz_session["score"] == 1

    # 3. Verify StudyProgress in DB
    db_user_id = quiz_session["db_user_id"]
    card_id = quiz_session["cards"][0]["card"].id
    async with AsyncSessionLocal() as session:
        stmt = select(StudyProgress).where(
            StudyProgress.user_id == db_user_id,
            StudyProgress.card_id == card_id
        )
        prog = (await session.execute(stmt)).scalar_one_or_none()
        assert prog is not None
        assert prog.box_level >= 1
        assert prog.correct_streak >= 1


@pytest.mark.asyncio
async def test_bot_hard_words_handler():
    """Test hard words rendering for user with wrong records."""
    from bot.handlers import show_hard_words

    fake_user = MagicMock()
    fake_user.id = 5544332211
    fake_user.username = "hard_words_tester"
    fake_user.first_name = "Tester"

    send_fn = AsyncMock()
    await show_hard_words(fake_user, send_fn)
    send_fn.assert_called_once()
    assert "Qiyin so'zlarim" in send_fn.call_args[0][0] or "qiyin deb belgilangan so'zlar yo'q" in send_fn.call_args[0][0]
