from datetime import datetime, timedelta, timezone
from typing import Dict, Tuple
from app.models.models import StudyProgress, utc_now

# Spaced Repetition (SM-2 Simplified / Leitner) Intervals in hours
SRS_INTERVALS_HOURS: Dict[int, int] = {
    0: 0,     # Due immediately
    1: 24,    # 1 day
    2: 72,    # 3 days
    3: 168,   # 7 days (1 week)
    4: 336,   # 14 days (2 weeks)
    5: 720,   # 30 days (1 month)
}


def calculate_next_review(
    current_box: int,
    current_streak: int,
    current_wrong: int,
    correct: bool
) -> Tuple[int, datetime, int, int, int]:
    """
    Calculates updated SRS stats:
    Returns (new_box_level, next_review_at, new_streak, new_wrong_count, interval_hours)
    """
    now = utc_now()

    if correct:
        new_box = min(5, current_box + 1)
        new_streak = current_streak + 1
        new_wrong = current_wrong
        interval_hours = SRS_INTERVALS_HOURS.get(new_box, 720)
        # If box 0 was answered correctly, move to box 1 (24h)
        if new_box == 0:
            new_box = 1
            interval_hours = SRS_INTERVALS_HOURS[1]
        next_review = now + timedelta(hours=interval_hours)
    else:
        # If user failed, reset back to Box 0 for immediate reinforcement
        new_box = 0
        new_streak = 0
        new_wrong = current_wrong + 1
        interval_hours = 0
        next_review = now  # Due immediately

    return new_box, next_review, new_streak, new_wrong, interval_hours
