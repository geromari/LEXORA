from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, description="Foydalanuvchi nomi")
    email: Optional[str] = Field(None, description="Elektron pochta manzili (ixtiyoriy)")
    password: str = Field(..., min_length=6, max_length=100, description="Parol (kamida 6 ta belgi)")


class UserLogin(BaseModel):
    email_or_username: str = Field(..., description="Email yoki username")
    password: str = Field(..., min_length=1, description="Parol")


class TelegramAuth(BaseModel):
    telegram_id: int = Field(..., description="Telegram foydalanuvchi ID raqami")
    username: Optional[str] = Field(None, description="Telegram @username")
    first_name: Optional[str] = Field(None, description="Ism")
    last_name: Optional[str] = Field(None, description="Familiya")
    avatar_url: Optional[str] = Field(None, description="Telegram profil rasmi")


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    telegram_id: Optional[int] = None
    avatar_url: Optional[str] = None
    streak_count: int = 0
    last_active_date: Optional[date] = None
    created_at: datetime
    total_decks: int = 0
    total_learned_words: int = 0
    total_due_words: int = 0

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class TelegramInitResponse(BaseModel):
    session_token: str
    bot_url: str


class TelegramStatusResponse(BaseModel):
    status: str
    access_token: Optional[str] = None
    user: Optional[UserProfileResponse] = None
