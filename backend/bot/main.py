import asyncio
import logging
import sys
from typing import Optional, Tuple
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from app.core.config import settings
from bot.handlers import router as bot_router
from bot.scheduler import setup_scheduler

logger = logging.getLogger("lexora.bot")


def create_bot_and_dispatcher() -> Tuple[Optional[Bot], Optional[Dispatcher]]:
    """
    Creates and configures the Aiogram 3 Bot and Dispatcher instances.
    Returns (None, None) if TELEGRAM_BOT_TOKEN is not configured.
    """
    token = settings.TELEGRAM_BOT_TOKEN.strip() if settings.TELEGRAM_BOT_TOKEN else ""
    if not token or token in ["YOUR_TELEGRAM_BOT_TOKEN", "your-bot-token"]:
        logger.warning(
            "TELEGRAM_BOT_TOKEN is not configured or is placeholder. "
            "Telegram bot features will remain disabled until a valid token is provided in .env."
        )
        return None, None

    bot = Bot(
        token=token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher()
    dp.include_router(bot_router)

    return bot, dp


async def start_bot():
    """
    Runs the Telegram bot with long-polling and active APScheduler.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    bot, dp = create_bot_and_dispatcher()
    if not bot or not dp:
        logger.error(
            "Cannot start Telegram bot: TELEGRAM_BOT_TOKEN is missing. "
            "Please add TELEGRAM_BOT_TOKEN=123456:ABC-DEF to /backend/.env."
        )
        sys.exit(1)

    # 1. Start APScheduler for daily Spaced Repetition reminders
    scheduler = setup_scheduler(bot)
    scheduler.start()
    logger.info("Daily Spaced Repetition scheduler started.")

    # 2. Start Bot Polling
    try:
        logger.info("Dropping pending updates and starting Aiogram 3 bot polling...")
        await bot.delete_webhook(drop_pending_updates=True)
        bot_info = await bot.get_me()
        logger.info(f"✨ Lexora Telegram Bot successfully running as @{bot_info.username} (ID: {bot_info.id})")
        await dp.start_polling(bot)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot execution interrupted.")
    finally:
        logger.info("Shutting down bot scheduler and closing aiohttp session...")
        scheduler.shutdown(wait=False)
        await bot.session.close()
        logger.info("Lexora Telegram Bot closed cleanly.")


if __name__ == "__main__":
    asyncio.run(start_bot())
