from datetime import datetime, timezone, date
from typing import List, Optional
from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    username: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    telegram_id: Mapped[Optional[int]] = mapped_column(BigInteger, unique=True, index=True, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    streak_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    decks: Mapped[List["Deck"]] = relationship(
        "Deck",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    progress_records: Mapped[List["StudyProgress"]] = relationship(
        "StudyProgress",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Deck(Base):
    __tablename__ = "decks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default="")
    level: Mapped[str] = mapped_column(String(50), default="C1", nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="decks")
    cards: Mapped[List["Card"]] = relationship(
        "Card",
        back_populates="deck",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    deck_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("decks.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    term_en: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    meaning_uz: Mapped[str] = mapped_column(Text, nullable=False)
    synonyms: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    example_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    deck: Mapped["Deck"] = relationship("Deck", back_populates="cards")
    progress_list: Mapped[List["StudyProgress"]] = relationship(
        "StudyProgress",
        back_populates="card",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class StudyProgress(Base):
    __tablename__ = "study_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    card_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("cards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    box_level: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False, index=True)
    correct_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    wrong_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="progress_records")
    card: Mapped["Card"] = relationship("Card", back_populates="progress_list")

    __table_args__ = (
        UniqueConstraint("user_id", "card_id", name="uq_user_card_progress"),
    )


class TelegramAuthSession(Base):
    __tablename__ = "telegram_auth_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    session_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    telegram_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)
    jwt_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User")
