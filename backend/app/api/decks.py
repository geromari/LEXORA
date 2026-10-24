from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_optional
from app.core.database import get_db
from app.models.models import Card, Deck, StudyProgress, User, utc_now
from app.schemas.deck import (
    CardWithProgressResponse,
    DeckCreate,
    DeckDetailResponse,
    DeckListItemResponse,
    StudyProgressResponse,
)

router = APIRouter(tags=["Decks"])


def calculate_deck_stats_from_map(
    deck: Deck,
    progress_map: Dict[int, StudyProgress],
    now,
):
    total_cards = len(deck.cards)
    if total_cards == 0:
        return 0, 0.0, 0, 0

    total_box_points = 0
    due_count = 0
    learned_count = 0

    for card in deck.cards:
        prog = progress_map.get(card.id)
        if prog:
            total_box_points += prog.box_level
            if prog.box_level >= 3:
                learned_count += 1
            card_dt = prog.next_review_at.replace(tzinfo=None) if prog.next_review_at.tzinfo else prog.next_review_at
            now_dt = now.replace(tzinfo=None) if now.tzinfo else now
            if card_dt <= now_dt:
                due_count += 1
        else:
            # Not reviewed yet by this user -> due (Box 0)
            due_count += 1

    mastery_percentage = round((total_box_points / (total_cards * 5.0)) * 100.0, 1)
    return total_cards, mastery_percentage, due_count, learned_count


@router.get("/decks", response_model=List[DeckListItemResponse])
async def list_decks(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    List all accessible decks (public system decks + user's own decks)
    with card counts, user-isolated SRS mastery percentage, and due counts.
    """
    if current_user:
        stmt = (
            select(Deck)
            .where(or_(Deck.is_public == True, Deck.user_id == current_user.id))
            .options(selectinload(Deck.cards))
            .order_by(Deck.created_at.desc())
        )
    else:
        stmt = (
            select(Deck)
            .where(Deck.is_public == True)
            .options(selectinload(Deck.cards))
            .order_by(Deck.created_at.desc())
        )

    result = await db.execute(stmt)
    decks = result.scalars().all()

    # Fetch user's progress records
    card_ids = [card.id for deck in decks for card in deck.cards]
    progress_map: Dict[int, StudyProgress] = {}

    if card_ids:
        if current_user:
            prog_stmt = select(StudyProgress).where(
                StudyProgress.card_id.in_(card_ids),
                StudyProgress.user_id == current_user.id,
            )
        else:
            prog_stmt = select(StudyProgress).where(
                StudyProgress.card_id.in_(card_ids),
                StudyProgress.user_id.is_(None),
            )
        prog_result = await db.execute(prog_stmt)
        for p in prog_result.scalars().all():
            progress_map[p.card_id] = p

    now = utc_now()
    response: List[DeckListItemResponse] = []

    for deck in decks:
        card_count, mastery, due_count, learned_count = calculate_deck_stats_from_map(
            deck, progress_map, now
        )
        is_owner = bool(current_user and deck.user_id == current_user.id)
        response.append(
            DeckListItemResponse(
                id=deck.id,
                user_id=deck.user_id,
                is_owner=is_owner,
                title=deck.title,
                description=deck.description or "",
                level=deck.level,
                is_public=deck.is_public,
                created_at=deck.created_at,
                card_count=card_count,
                mastery_percentage=mastery,
                due_count=due_count,
                learned_count=learned_count,
            )
        )

    return response


@router.post("/decks", response_model=DeckDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_deck(
    payload: DeckCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new deck with an array of cards. Assigns ownership to current_user
    and initializes SRS progress for the user.
    """
    user_id = current_user.id if current_user else None

    new_deck = Deck(
        user_id=user_id,
        title=payload.title,
        description=payload.description or "",
        level=payload.level,
        is_public=payload.is_public,
        created_at=utc_now(),
    )
    db.add(new_deck)
    await db.flush()

    now = utc_now()
    created_cards: List[Card] = []
    card_responses: List[CardWithProgressResponse] = []

    for item in payload.cards:
        card = Card(
            deck_id=new_deck.id,
            term_en=item.term_en.strip(),
            meaning_uz=item.meaning_uz.strip(),
            synonyms=item.synonyms.strip() if item.synonyms else None,
            example_en=item.example_en.strip() if item.example_en else None,
        )
        db.add(card)
        await db.flush()

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

        card_responses.append(
            CardWithProgressResponse(
                id=card.id,
                deck_id=card.deck_id,
                term_en=card.term_en,
                meaning_uz=card.meaning_uz,
                synonyms=card.synonyms,
                example_en=card.example_en,
                progress=StudyProgressResponse(
                    id=progress.id,
                    card_id=progress.card_id,
                    box_level=progress.box_level,
                    next_review_at=progress.next_review_at,
                    correct_streak=progress.correct_streak,
                    wrong_count=progress.wrong_count,
                ),
            )
        )

    await db.commit()
    await db.refresh(new_deck)

    return DeckDetailResponse(
        id=new_deck.id,
        user_id=new_deck.user_id,
        is_owner=True,
        title=new_deck.title,
        description=new_deck.description or "",
        level=new_deck.level,
        is_public=new_deck.is_public,
        created_at=new_deck.created_at,
        card_count=len(card_responses),
        mastery_percentage=0.0,
        due_count=len(card_responses),
        learned_count=0,
        cards=card_responses,
    )


@router.get("/decks/{deck_id}", response_model=DeckDetailResponse)
async def get_deck(
    deck_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """
    Get deck details and its cards with current user's isolated SRS progress.
    """
    stmt = (
        select(Deck)
        .where(Deck.id == deck_id)
        .options(selectinload(Deck.cards))
    )
    result = await db.execute(stmt)
    deck = result.scalar_one_or_none()

    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck with id {deck_id} topilmadi.",
        )

    # Permission check for private decks
    if not deck.is_public:
        if not current_user or deck.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ushbu to'plam shaxsiy bo'lib, faqat uning egasi ko'rishi mumkin.",
            )

    # Fetch progress for this user
    card_ids = [c.id for c in deck.cards]
    progress_map: Dict[int, StudyProgress] = {}

    if card_ids:
        if current_user:
            prog_stmt = select(StudyProgress).where(
                StudyProgress.card_id.in_(card_ids),
                StudyProgress.user_id == current_user.id,
            )
        else:
            prog_stmt = select(StudyProgress).where(
                StudyProgress.card_id.in_(card_ids),
                StudyProgress.user_id.is_(None),
            )
        prog_result = await db.execute(prog_stmt)
        for p in prog_result.scalars().all():
            progress_map[p.card_id] = p

    now = utc_now()
    card_count, mastery, due_count, learned_count = calculate_deck_stats_from_map(
        deck, progress_map, now
    )

    card_responses: List[CardWithProgressResponse] = []
    for c in deck.cards:
        prog = progress_map.get(c.id)
        card_responses.append(
            CardWithProgressResponse(
                id=c.id,
                deck_id=c.deck_id,
                term_en=c.term_en,
                meaning_uz=c.meaning_uz,
                synonyms=c.synonyms,
                example_en=c.example_en,
                progress=StudyProgressResponse(
                    id=prog.id,
                    card_id=prog.card_id,
                    box_level=prog.box_level,
                    next_review_at=prog.next_review_at,
                    correct_streak=prog.correct_streak,
                    wrong_count=prog.wrong_count,
                ) if prog else None,
            )
        )

    is_owner = bool(current_user and deck.user_id == current_user.id)

    return DeckDetailResponse(
        id=deck.id,
        user_id=deck.user_id,
        is_owner=is_owner,
        title=deck.title,
        description=deck.description or "",
        level=deck.level,
        is_public=deck.is_public,
        created_at=deck.created_at,
        card_count=card_count,
        mastery_percentage=mastery,
        due_count=due_count,
        learned_count=learned_count,
        cards=card_responses,
    )
