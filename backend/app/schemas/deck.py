from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CardBase(BaseModel):
    term_en: str = Field(..., description="English term or idiom", min_length=1)
    meaning_uz: str = Field(..., description="Uzbek translation and contextual explanation", min_length=1)
    synonyms: Optional[str] = Field(None, description="Comma-separated synonyms or collocations")
    example_en: Optional[str] = Field(None, description="IELTS context example sentence in English")


class CardCreate(CardBase):
    pass


class StudyProgressResponse(BaseModel):
    id: int
    card_id: int
    box_level: int
    next_review_at: datetime
    correct_streak: int
    wrong_count: int

    model_config = ConfigDict(from_attributes=True)


class CardResponse(CardBase):
    id: int
    deck_id: int

    model_config = ConfigDict(from_attributes=True)


class CardWithProgressResponse(CardResponse):
    progress: Optional[StudyProgressResponse] = None

    model_config = ConfigDict(from_attributes=True)


class DeckBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field("", max_length=2000)
    level: str = Field("C1", max_length=50)
    is_public: bool = True


class DeckCreate(DeckBase):
    cards: List[CardCreate] = Field(default_factory=list)


class DeckListItemResponse(DeckBase):
    id: int
    user_id: Optional[int] = None
    is_owner: bool = False
    created_at: datetime
    card_count: int
    mastery_percentage: float
    due_count: int
    learned_count: int

    model_config = ConfigDict(from_attributes=True)


class DeckDetailResponse(DeckBase):
    id: int
    user_id: Optional[int] = None
    is_owner: bool = False
    created_at: datetime
    card_count: int
    mastery_percentage: float
    due_count: int = 0
    learned_count: int = 0
    cards: List[CardWithProgressResponse]

    model_config = ConfigDict(from_attributes=True)


DeckResponse = DeckDetailResponse


