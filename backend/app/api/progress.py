from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_optional
from app.core.database import get_db
from app.models.models import Card, Deck, StudyProgress, User, utc_now
from app.schemas.deck import CardWithProgressResponse, StudyProgressResponse
from app.schemas.progress import DueCardsResponse, ReviewRequest, ReviewResponse
from app.services.srs import calculate_next_review

router = APIRouter(tags=["Spaced Repetition & Reviews"])


@router.post("/progress/review", response_model=ReviewResponse)
async def submit_card_review(
    payload: ReviewRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a user flashcard recall result (correct/wrong) and recalculates
    the SM-2 box level and next review timestamp for the specific user.
    """
    # 1. Fetch card
    stmt = select(Card).where(Card.id == payload.card_id)
    result = await db.execute(stmt)
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with id {payload.card_id} topilmadi.",
        )

    user_id = current_user.id if current_user else None

    # 2. Get or create progress for this user
    if user_id:
        prog_stmt = select(StudyProgress).where(
            StudyProgress.card_id == card.id,
            StudyProgress.user_id == user_id,
        )
    else:
        prog_stmt = select(StudyProgress).where(
            StudyProgress.card_id == card.id,
            StudyProgress.user_id.is_(None),
        )

    prog_result = await db.execute(prog_stmt)
    progress = prog_result.scalar_one_or_none()

    now = utc_now()
    if not progress:
        progress = StudyProgress(
            user_id=user_id,
            card_id=card.id,
            box_level=0,
            next_review_at=now,
            correct_streak=0,
            wrong_count=0,
        )
        db.add(progress)
        await db.flush()

    # 3. Calculate new SRS metrics
    new_box, next_review, new_streak, new_wrong, interval_hours = calculate_next_review(
        current_box=progress.box_level,
        current_streak=progress.correct_streak,
        current_wrong=progress.wrong_count,
        correct=payload.correct,
    )

    progress.box_level = new_box
    progress.next_review_at = next_review
    progress.correct_streak = new_streak
    progress.wrong_count = new_wrong

    # 4. If authenticated user, update daily streak
    if current_user:
        today = now.date()
        if current_user.last_active_date != today:
            if current_user.last_active_date and (today - current_user.last_active_date).days == 1:
                current_user.streak_count += 1
            elif not current_user.last_active_date or (today - current_user.last_active_date).days > 1:
                current_user.streak_count = 1
            current_user.last_active_date = today

    await db.commit()
    await db.refresh(progress)

    # Uzbek user-friendly status message
    if payload.correct:
        if interval_hours >= 24:
            days = interval_hours // 24
            message = f"Barakalla! So'z {new_box}-qutiga ko'tarildi. Keyingi takrorlash {days} kundan keyin."
        else:
            message = f"To'g'ri javob! So'z {new_box}-qutiga ko'tarildi."
    else:
        message = "Xato javob. So'z qaytadan mustahkamlash uchun 0-qutiga qaytarildi."

    return ReviewResponse(
        success=True,
        card_id=card.id,
        box_level=progress.box_level,
        next_review_at=progress.next_review_at,
        correct_streak=progress.correct_streak,
        wrong_count=progress.wrong_count,
        interval_hours=interval_hours,
        message=message,
    )


@router.get("/review/due", response_model=DueCardsResponse)
async def get_due_and_hardest_cards(
    limit: int = 50,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns cards scheduled for review today (next_review_at <= now)
    and the hardest cards (sorted by wrong_count descending) isolated for current_user.
    """
    now = utc_now()
    user_id = current_user.id if current_user else None

    # 1. Fetch accessible decks
    if current_user:
        accessible_deck_stmt = select(Deck.id).where(
            or_(Deck.is_public == True, Deck.user_id == current_user.id)
        )
    else:
        accessible_deck_stmt = select(Deck.id).where(Deck.is_public == True)

    deck_ids = (await db.execute(accessible_deck_stmt)).scalars().all()
    if not deck_ids:
        return DueCardsResponse(
            total_due=0,
            total_hardest=0,
            due_cards=[],
            hardest_cards=[],
        )

    # 2. Fetch user's progress records
    if user_id:
        prog_stmt = (
            select(StudyProgress)
            .join(Card, StudyProgress.card_id == Card.id)
            .where(
                StudyProgress.user_id == user_id,
                Card.deck_id.in_(deck_ids),
            )
        )
    else:
        prog_stmt = (
            select(StudyProgress)
            .join(Card, StudyProgress.card_id == Card.id)
            .where(
                StudyProgress.user_id.is_(None),
                Card.deck_id.in_(deck_ids),
            )
        )

    prog_result = await db.execute(prog_stmt)
    all_progress = prog_result.scalars().all()
    progress_map: Dict[int, StudyProgress] = {p.card_id: p for p in all_progress}

    # 3. Fetch all cards in accessible decks
    card_stmt = (
        select(Card)
        .where(Card.deck_id.in_(deck_ids))
        .order_by(Card.id.asc())
    )
    cards_result = await db.execute(card_stmt)
    accessible_cards = cards_result.scalars().all()

    # 4. Filter due cards
    due_items: List[CardWithProgressResponse] = []
    hardest_items: List[CardWithProgressResponse] = []

    for card in accessible_cards:
        prog = progress_map.get(card.id)
        card_resp = CardWithProgressResponse(
            id=card.id,
            deck_id=card.deck_id,
            term_en=card.term_en,
            meaning_uz=card.meaning_uz,
            synonyms=card.synonyms,
            example_en=card.example_en,
            progress=StudyProgressResponse(
                id=prog.id,
                card_id=prog.card_id,
                box_level=prog.box_level,
                next_review_at=prog.next_review_at,
                correct_streak=prog.correct_streak,
                wrong_count=prog.wrong_count,
            ) if prog else None,
        )

        if prog:
            card_dt = prog.next_review_at.replace(tzinfo=None) if prog.next_review_at.tzinfo else prog.next_review_at
            now_dt = now.replace(tzinfo=None) if now.tzinfo else now
            if card_dt <= now_dt:
                due_items.append(card_resp)

            if prog.wrong_count > 0:
                hardest_items.append(card_resp)
        else:
            # Card not reviewed yet -> Due for review
            due_items.append(card_resp)

    # Sort hardest by wrong_count descending
    hardest_items.sort(
        key=lambda c: c.progress.wrong_count if c.progress else 0,
        reverse=True,
    )

    return DueCardsResponse(
        total_due=len(due_items),
        total_hardest=len(hardest_items),
        due_cards=due_items[:limit],
        hardest_cards=hardest_items[:limit],
    )
