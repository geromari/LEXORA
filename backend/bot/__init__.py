"""
Lexora AI Telegram Bot Module
Integrated directly with FastAPI backend models, database, and SRS services.
"""

from bot.main import create_bot_and_dispatcher, start_bot

__all__ = ["create_bot_and_dispatcher", "start_bot"]
