import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import decks_router, progress_router, ai_router, auth_router
from app.core.config import settings
from app.core.database import Base, engine, AsyncSessionLocal
from app.core.seed import seed_initial_deck

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("lexora.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create tables if they do not exist
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized.")

    # 2. Seed database on startup if empty
    async with AsyncSessionLocal() as session:
        try:
            await seed_initial_deck(session)
        except Exception as e:
            logger.error(f"Error during initial database seed: {e}", exc_info=True)

    # 3. Optional Telegram Bot background runner (if TELEGRAM_BOT_TOKEN is set)
    bot_task = None
    bot_instance = None
    bot_scheduler = None
    token = settings.TELEGRAM_BOT_TOKEN.strip() if settings.TELEGRAM_BOT_TOKEN else ""

    if token and token not in ["YOUR_TELEGRAM_BOT_TOKEN", "your-bot-token"]:
        try:
            from bot.main import create_bot_and_dispatcher
            from bot.scheduler import setup_scheduler

            bot_instance, dp = create_bot_and_dispatcher()
            if bot_instance and dp:
                await bot_instance.delete_webhook(drop_pending_updates=False)
                bot_scheduler = setup_scheduler(bot_instance)
                bot_scheduler.start()
                logger.info("Telegram Bot scheduler active in FastAPI lifespan.")
                bot_task = asyncio.create_task(
                    dp.start_polling(bot_instance, handle_signals=False)
                )
                logger.info("✨ Telegram Bot background polling started alongside FastAPI.")
        except Exception as e:
            logger.error(f"Failed to initialize Telegram Bot in lifespan: {e}", exc_info=True)

    yield

    # 4. Shutdown
    if bot_scheduler:
        bot_scheduler.shutdown(wait=False)
    if bot_instance:
        if bot_task:
            bot_task.cancel()
        await bot_instance.session.close()

    logger.info("Closing database engine...")
    await engine.dispose()
    logger.info("Database engine closed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Lexora — AI-Powered IELTS/CEFR Vocabulary Learning Platform Backend API",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(decks_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

# Also support /api/v1 prefix for versioned access
app.include_router(auth_router, prefix="/api/v1")
app.include_router(decks_router, prefix="/api/v1")
app.include_router(progress_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")




@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/api/docs",
        "version": "1.0.0",
        "message": "Lexora Backend API — IELTS/CEFR Vocabulary Platform"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
