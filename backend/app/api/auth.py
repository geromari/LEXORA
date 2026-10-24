import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.models import Deck, StudyProgress, TelegramAuthSession, User, utc_now
from app.schemas.auth import (
    TelegramAuth,
    TelegramInitResponse,
    TelegramStatusResponse,
    TokenResponse,
    UserLogin,
    UserProfileResponse,
    UserRegister,
)

router = APIRouter(prefix="/auth", tags=["Authentication & User Profile"])


async def compute_user_stats(user: User, db: AsyncSession) -> Tuple[int, int, int]:
    """Calculates total decks, learned words, and due words for a user."""
    # 1. Total decks created by user
    deck_count_stmt = select(func.count(Deck.id)).where(Deck.user_id == user.id)
    total_decks = (await db.execute(deck_count_stmt)).scalar() or 0

    # 2. Total learned words (box_level >= 3)
    learned_stmt = select(func.count(StudyProgress.id)).where(
        StudyProgress.user_id == user.id,
        StudyProgress.box_level >= 3,
    )
    total_learned = (await db.execute(learned_stmt)).scalar() or 0

    # 3. Total words due for review right now
    now = utc_now()
    due_stmt = select(func.count(StudyProgress.id)).where(
        StudyProgress.user_id == user.id,
        StudyProgress.next_review_at <= now,
    )
    total_due = (await db.execute(due_stmt)).scalar() or 0

    return total_decks, total_learned, total_due


def build_profile_response(
    user: User,
    total_decks: int = 0,
    total_learned: int = 0,
    total_due: int = 0,
) -> UserProfileResponse:
    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        telegram_id=user.telegram_id,
        avatar_url=user.avatar_url,
        streak_count=user.streak_count,
        last_active_date=user.last_active_date,
        created_at=user.created_at,
        total_decks=total_decks,
        total_learned_words=total_learned,
        total_due_words=total_due,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new user with username, email (optional), and password.
    Returns access token and initial profile.
    """
    # 1. Check if username is already taken
    stmt = select(User).where(func.lower(User.username) == payload.username.lower())
    existing_user = (await db.execute(stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ushbu foydalanuvchi nomi (username) allaqachon band qilingan.",
        )

    # 2. Check if email is already registered
    if payload.email:
        stmt = select(User).where(func.lower(User.email) == payload.email.lower())
        existing_email = (await db.execute(stmt)).scalar_one_or_none()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ushbu elektron pochta manzili bilan ro'yxatdan o'tilgan.",
            )

    # 3. Create user
    new_user = User(
        username=payload.username.strip(),
        email=payload.email.strip().lower() if payload.email else None,
        password_hash=hash_password(payload.password),
        streak_count=1,
        last_active_date=utc_now().date(),
        created_at=utc_now(),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 4. Generate JWT
    token = create_access_token(data={"sub": str(new_user.id), "username": new_user.username})
    profile = build_profile_response(new_user, 0, 0, 0)

    return TokenResponse(access_token=token, token_type="bearer", user=profile)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Login with username or email and password.
    """
    identifier = payload.email_or_username.strip().lower()

    # Search by username or email
    stmt = select(User).where(
        or_(
            func.lower(User.username) == identifier,
            func.lower(User.email) == identifier,
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri login yoki parol kiritildi. Qaytadan urinib ko'ring.",
        )

    # Update active streak if applicable
    today = utc_now().date()
    if user.last_active_date != today:
        if user.last_active_date and (today - user.last_active_date).days == 1:
            user.streak_count += 1
        elif not user.last_active_date or (today - user.last_active_date).days > 1:
            user.streak_count = 1
        user.last_active_date = today
        await db.commit()
        await db.refresh(user)

    # Compute stats
    decks, learned, due = await compute_user_stats(user, db)
    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    profile = build_profile_response(user, decks, learned, due)

    return TokenResponse(access_token=token, token_type="bearer", user=profile)


@router.post("/telegram", response_model=TokenResponse)
async def telegram_auth(payload: TelegramAuth, db: AsyncSession = Depends(get_db)):
    """
    Seamless Telegram Bot / Mini App authentication.
    Logs in existing user or creates a new account via Telegram ID.
    """
    stmt = select(User).where(User.telegram_id == payload.telegram_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    today = utc_now().date()
    if user:
        # Update details if changed
        if payload.username and user.username != payload.username:
            user.username = payload.username
        if payload.avatar_url:
            user.avatar_url = payload.avatar_url

        if user.last_active_date != today:
            if user.last_active_date and (today - user.last_active_date).days == 1:
                user.streak_count += 1
            elif not user.last_active_date or (today - user.last_active_date).days > 1:
                user.streak_count = 1
            user.last_active_date = today

        await db.commit()
        await db.refresh(user)
    else:
        # Create user from Telegram info
        base_username = payload.username or payload.first_name or f"tg_user_{payload.telegram_id}"
        # Ensure uniqueness
        uname_check = await db.execute(select(User).where(User.username == base_username))
        if uname_check.scalar_one_or_none():
            base_username = f"{base_username}_{payload.telegram_id % 1000}"

        user = User(
            username=base_username,
            telegram_id=payload.telegram_id,
            avatar_url=payload.avatar_url,
            streak_count=1,
            last_active_date=today,
            created_at=utc_now(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    decks, learned, due = await compute_user_stats(user, db)
    token = create_access_token(data={"sub": str(user.id), "username": user.username})
    profile = build_profile_response(user, decks, learned, due)

    return TokenResponse(access_token=token, token_type="bearer", user=profile)


@router.get("/me", response_model=UserProfileResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the current authenticated user profile with aggregated metrics.
    """
    decks, learned, due = await compute_user_stats(current_user, db)
    return build_profile_response(current_user, decks, learned, due)


@router.post("/telegram/init", response_model=TelegramInitResponse)
async def init_telegram_auth(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Initiates a deep-linked Telegram authentication/linking session.
    Returns session_token and direct bot start URL.
    """
    session_token = uuid.uuid4().hex
    auth_session = TelegramAuthSession(
        session_token=session_token,
        user_id=current_user.id if current_user else None,
        status="pending",
        created_at=utc_now(),
    )
    db.add(auth_session)
    await db.commit()

    bot_username = settings.TELEGRAM_BOT_USERNAME or "lexora_uzbot"
    bot_url = f"https://t.me/{bot_username}?start=auth_{session_token}"
    return TelegramInitResponse(session_token=session_token, bot_url=bot_url)


@router.get("/telegram/status/{session_token}", response_model=TelegramStatusResponse)
async def check_telegram_auth_status(
    session_token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Polled by the frontend while waiting for the user to tap Start in Telegram.
    Returns status: 'pending' or 'completed' with JWT and user profile.
    """
    stmt = select(TelegramAuthSession).where(TelegramAuthSession.session_token == session_token)
    res = await db.execute(stmt)
    auth_session = res.scalar_one_or_none()

    if not auth_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Autentifikatsiya sessiyasi topilmadi yoki eskirgan.",
        )

    if auth_session.status == "completed" and auth_session.jwt_token:
        # Load user
        user = None
        if auth_session.user_id:
            user = await db.get(User, auth_session.user_id)
        if not user and auth_session.telegram_id:
            u_stmt = select(User).where(User.telegram_id == auth_session.telegram_id)
            user = (await db.execute(u_stmt)).scalar_one_or_none()

        profile = None
        if user:
            decks, learned, due = await compute_user_stats(user, db)
            profile = build_profile_response(user, decks, learned, due)

        return TelegramStatusResponse(
            status="completed",
            access_token=auth_session.jwt_token,
            user=profile,
        )

    return TelegramStatusResponse(status="pending")
