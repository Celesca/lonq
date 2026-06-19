import random
from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.db.session import DbSession
from app.models.place import Place
from app.models.swipe import Swipe
from app.services.places import to_travel_place
from app.services.users import get_or_create_user

router = APIRouter(tags=["places"])


@router.get("/places")
def get_places(db: DbSession, cities: Annotated[list[str] | None, Query()] = None) -> dict[str, object]:
    query = select(Place)
    if cities and "all" not in cities:
        query = query.where(Place.city.in_(cities))
    places = list(db.scalars(query.order_by(Place.city, Place.rating.desc())))
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}


@router.get("/cities")
def get_cities(db: DbSession) -> dict[str, object]:
    places = list(db.scalars(select(Place)))
    cities: dict[str, int] = {}
    for place in places:
        cities[place.city] = cities.get(place.city, 0) + 1
    return {"cities": [{"name": name, "place_count": count} for name, count in sorted(cities.items())]}


@router.get("/tinder")
def get_tinder_places(
    user_id: str,
    db: DbSession,
    cities: Annotated[list[str] | None, Query()] = None,
) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    swiped_ids = set(db.scalars(select(Swipe.place_id).where(Swipe.user_id == user.id)))
    query = select(Place)
    if cities and "all" not in cities:
        query = query.where(Place.city.in_(cities))
    places = [place for place in db.scalars(query) if place.id not in swiped_ids]
    random.shuffle(places)
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}
