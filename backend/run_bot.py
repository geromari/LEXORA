#!/usr/bin/env python3
"""
Lexora Telegram Bot Standalone Runner
Run directly with:
    python run_bot.py
or:
    ./run_bot.py
"""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from bot.main import start_bot

if __name__ == "__main__":
    try:
        asyncio.run(start_bot())
    except (KeyboardInterrupt, SystemExit):
        pass
