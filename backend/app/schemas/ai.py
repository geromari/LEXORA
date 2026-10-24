from typing import List, Optional
from pydantic import BaseModel, Field


class ExtractVocabRequest(BaseModel):
    text: str = Field(..., min_length=15, description="Raw English text or IELTS Reading passage")
    level: Optional[str] = Field("C1", description="Target CEFR level (B2, C1, C2, IELTS)")
    count: Optional[int] = Field(15, ge=5, le=30, description="Desired number of vocabulary items (10-20)")


class ExtractedCardItem(BaseModel):
    term_en: str
    meaning_uz: str
    synonyms: Optional[str] = None
    example_en: Optional[str] = None
    level: Optional[str] = "C1"


class ExtractVocabResponse(BaseModel):
    success: bool
    total_extracted: int
    cards: List[ExtractedCardItem]
    source_info: str


class CheckSentenceRequest(BaseModel):
    target_term: str = Field(..., description="Target vocabulary word or idiom to evaluate")
    sentence: str = Field(..., min_length=5, description="Learner's sentence utilizing the target term")
    deck_title: Optional[str] = Field(None, description="Optional deck title for context")


class CheckSentenceResponse(BaseModel):
    success: bool
    score: int = Field(..., ge=1, le=10, description="IELTS Lexical & Grammatical score out of 10")
    grammar_correct: bool
    natural_usage: bool
    feedback_uz: str = Field(..., description="Constructive feedback and tips in natural Uzbek")
    improved_sentence: str = Field(..., description="Enhanced Band 8.5+ C1 version of the sentence")
    original_sentence: str
    target_term: str
