from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.deck import CardWithProgressResponse, StudyProgressResponse


class ReviewRequest(BaseModel):
    card_id: int = Field(..., description="ID of the card being reviewed")
    correct: bool = Field(..., description="Whether the user recalled the card correctly")


class ReviewResponse(BaseModel):
    success: bool
    card_id: int
    box_level: int
    next_review_at: datetime
    correct_streak: int
    wrong_count: int
    interval_hours: int
    message: str


class DueCardsResponse(BaseModel):
    total_due: int
    total_hardest: int
    due_cards: List[CardWithProgressResponse]
    hardest_cards: List[CardWithProgressResponse]
