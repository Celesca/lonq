from fastapi import APIRouter
from sqlalchemy import select

from app.db.session import DbSession
from app.models.swipe import Swipe
from app.services.users import get_or_create_user

router = APIRouter(tags=["stats"])


@router.get("/stats")
def get_stats(user_id: str, db: DbSession) -> dict[str, int]:
    user = get_or_create_user(db, user_id)
    swipes = list(db.scalars(select(Swipe).where(Swipe.user_id == user.id)))
    return {
        "total_swipes": len(swipes),
        "liked_places": len([swipe for swipe in swipes if swipe.direction == "right"]),
        "disliked_places": len([swipe for swipe in swipes if swipe.direction == "left"]),
        "total_coins": user.total_coins,
        "journeys_completed": 0,
        "photos_uploaded": 0,
    }
