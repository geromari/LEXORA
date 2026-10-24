import logging
from datetime import datetime, timezone
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import func, select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.models import StudyProgress, User, utc_now

logger = logging.getLogger("lexora.bot.scheduler")


async def send_due_reminders(bot: Bot):
    """
    Checks for all registered Telegram users who have SRS cards due for review
    and sends a motivational reminder with a 1-tap quiz button.
    """
    logger.info("Running daily Spaced Repetition reminder check...")
    now = utc_now()

    try:
        async with AsyncSessionLocal() as session:
            # Fetch users who have linked a Telegram ID
            stmt = select(User).where(User.telegram_id.isnot(None))
            result = await session.execute(stmt)
            users = result.scalars().all()

            sent_count = 0
            for user in users:
                if not user.telegram_id:
                    continue

                # Count due cards for this user
                due_stmt = select(func.count(StudyProgress.id)).where(
                    StudyProgress.user_id == user.id,
                    StudyProgress.next_review_at <= now,
                )
                due_count = (await session.execute(due_stmt)).scalar() or 0

                if due_count > 0:
                    text = (
                        f"🔔 <b>Salom, {user.username}!</b>\n\n"
                        f"Bugun sizda takrorlash uchun <b>{due_count} ta so'z</b> navbatda kutmoqda!\n"
                        f"🔥 Kunlik seriyangiz: <b>{user.streak_count} kun</b>.\n\n"
                        f"Ilmiy Spaced Repetition (SRS) xotira tizimi bo'yicha so'zlarni esdan chiqarmaslik uchun "
                        f"hoziroq 5 ta so'zdan iborat tezkor quizni ishlang:"
                    )

                    reminder_buttons = [
                        [
                            InlineKeyboardButton(
                                text="🧠 5 ta so'zli tezkor quiz",
                                callback_data="quiz:start"
                            )
                        ]
                    ]
                    from bot.keyboards import is_valid_telegram_url
                    if is_valid_telegram_url(settings.WEBAPP_URL):
                        reminder_buttons.append([
                            InlineKeyboardButton(
                                text="🌐 Webda mashq qilish",
                                url=settings.WEBAPP_URL
                            )
                        ])
                    keyboard = InlineKeyboardMarkup(inline_keyboard=reminder_buttons)

                    try:
                        await bot.send_message(
                            chat_id=user.telegram_id,
                            text=text,
                            reply_markup=keyboard
                        )
                        sent_count += 1
                    except Exception as err:
                        logger.warning(
                            f"Could not send reminder to tg_id {user.telegram_id}: {err}"
                        )

            logger.info(f"Daily reminders sent to {sent_count} users.")
    except Exception as e:
        logger.error(f"Error executing send_due_reminders: {e}", exc_info=True)


def setup_scheduler(bot: Bot) -> AsyncIOScheduler:
    """
    Initializes and starts the AsyncIOScheduler for daily Spaced Repetition notifications.
    Configured for 09:00 and 20:00 daily check-ins.
    """
    scheduler = AsyncIOScheduler()

    # Morning review reminder at 09:00
    scheduler.add_job(
        send_due_reminders,
        "cron",
        hour=9,
        minute=0,
        args=[bot],
        id="morning_srs_reminder",
        replace_existing=True,
    )

    # Evening review reminder at 20:00
    scheduler.add_job(
        send_due_reminders,
        "cron",
        hour=20,
        minute=0,
        args=[bot],
        id="evening_srs_reminder",
        replace_existing=True,
    )

    logger.info("APScheduler initialized for 09:00 and 20:00 daily review reminders.")
    return scheduler
