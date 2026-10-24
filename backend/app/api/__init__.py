from app.api.decks import router as decks_router
from app.api.progress import router as progress_router
from app.api.ai import router as ai_router
from app.api.auth import router as auth_router

__all__ = ["decks_router", "progress_router", "ai_router", "auth_router"]

