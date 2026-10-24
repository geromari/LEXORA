from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import (
    ExtractVocabRequest,
    ExtractVocabResponse,
    CheckSentenceRequest,
    CheckSentenceResponse,
)
from app.services.ai import extract_vocabulary_from_text, evaluate_sentence_usage

router = APIRouter(prefix="/ai", tags=["AI Integration"])


@router.post("/extract-vocab", response_model=ExtractVocabResponse)
async def extract_vocabulary(payload: ExtractVocabRequest):
    """
    Extracts 10-20 advanced academic words/idioms from a raw text passage
    with accurate Uzbek translations, synonyms, and context sentences.
    """
    if len(payload.text.strip()) < 15:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Matn juda qisqa. Kamida 15 ta belgidan iborat matn kiriting."
        )

    cards = await extract_vocabulary_from_text(
        text=payload.text,
        level=payload.level or "C1",
        count=payload.count or 15
    )

    return ExtractVocabResponse(
        success=True,
        total_extracted=len(cards),
        cards=cards,
        source_info=f"{len(cards)} ta akademik so'z muvaffaqiyatli ajratildi."
    )


@router.post("/check-sentence", response_model=CheckSentenceResponse)
async def check_sentence(payload: CheckSentenceRequest):
    """
    Evaluates learner's IELTS-style sentence using a target phrase.
    Returns score out of 10, Uzbek feedback, and improved C1-level version.
    """
    if len(payload.sentence.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gap juda qisqa. Kamida 5 ta belgidan iborat gap tuzing."
        )

    result = await evaluate_sentence_usage(
        target_term=payload.target_term.strip(),
        sentence=payload.sentence.strip(),
        deck_title=payload.deck_title
    )

    return result
