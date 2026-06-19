from fastapi import APIRouter

from app.db.session import DbSession
from app.schemas.user import PreferencesIn
from app.services.users import get_or_create_user

router = APIRouter(tags=["preferences"])


@router.get("/preferences")
def get_preferences(user_id: str, db: DbSession) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    return {
        "selected_cities": user.selected_cities or [],
        "travel_personality": user.travel_personality,
        "preferred_tags": user.preferred_tags or [],
    }


@router.put("/preferences")
def update_preferences(user_id: str, payload: PreferencesIn, db: DbSession) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    if payload.selected_cities is not None:
        user.selected_cities = payload.selected_cities
    if payload.travel_personality is not None:
        user.travel_personality = payload.travel_personality
    if payload.preferred_tags is not None:
        user.preferred_tags = payload.preferred_tags
    db.commit()
    return {
        "selected_cities": user.selected_cities or [],
        "travel_personality": user.travel_personality,
        "preferred_tags": user.preferred_tags or [],
    }
