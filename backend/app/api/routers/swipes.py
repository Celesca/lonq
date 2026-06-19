from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.db.session import DbSession
from app.models.place import Place
from app.models.swipe import Swipe
from app.schemas.swipe import SwipeIn
from app.services.places import to_travel_place
from app.services.users import get_or_create_user

router = APIRouter(tags=["swipes"])


@router.post("/swipes")
def create_swipe(payload: SwipeIn, db: DbSession) -> dict[str, object]:
    if payload.direction not in {"left", "right"}:
        raise HTTPException(status_code=400, detail="direction must be left or right")

    user = get_or_create_user(db, payload.user_id)
    place = db.get(Place, payload.place_id)
    if place is None:
        raise HTTPException(status_code=404, detail="place not found")

    swipe = db.scalar(select(Swipe).where(Swipe.user_id == user.id, Swipe.place_id == place.id))
    if swipe is None:
        swipe = Swipe(user_id=user.id, place_id=place.id, direction=payload.direction)
        db.add(swipe)
    else:
        swipe.direction = payload.direction

    if payload.direction == "right":
        user.total_coins += 5

    db.commit()
    return {"success": True, "coins": user.total_coins}


@router.get("/liked")
def get_liked_places(user_id: str, db: DbSession) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    swipes = db.scalars(
        select(Swipe).where(Swipe.user_id == user.id, Swipe.direction == "right").order_by(Swipe.created_at.desc())
    )
    places = [swipe.place for swipe in swipes]
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}


@router.delete("/liked/{place_id}")
def remove_liked_place(place_id: int, user_id: str, db: DbSession) -> dict[str, bool]:
    user = get_or_create_user(db, user_id)
    swipe = db.scalar(select(Swipe).where(Swipe.user_id == user.id, Swipe.place_id == place_id))
    if swipe:
        db.delete(swipe)
        db.commit()
    return {"success": True}


@router.delete("/progress")
def reset_progress(user_id: str, db: DbSession) -> dict[str, bool]:
    user = get_or_create_user(db, user_id)
    for swipe in db.scalars(select(Swipe).where(Swipe.user_id == user.id)):
        db.delete(swipe)
    db.commit()
    return {"success": True}
