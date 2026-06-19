from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.place import Place
from app.models.swipe import Swipe
from app.models.user import User
from app.services.places import distance_score


def create_optimized_route(
    db: Session,
    user: User,
    personality: str,
    duration: str,
    city: str,
) -> list[Place]:
    liked_swipes = list(db.scalars(select(Swipe).where(Swipe.user_id == user.id, Swipe.direction == "right")))
    places = [swipe.place for swipe in liked_swipes]

    if city != "all":
        places = [place for place in places if place.city == city]

    if not places:
        query = select(Place)
        if city != "all":
            query = query.where(Place.city == city)
        places = list(db.scalars(query.order_by(Place.rating.desc()).limit(5)))

    normalized_personality = personality.lower()
    if "slow" in normalized_personality or "introvert" in normalized_personality:
        places.sort(key=lambda place: ("ธรรมชาติ" not in (place.tags or []), -place.rating))
    elif "food" in normalized_personality:
        places.sort(key=lambda place: ("อาหาร" not in (place.tags or []) and "ตลาด" not in (place.tags or []), -place.rating))
    else:
        places.sort(key=lambda place: place.rating, reverse=True)

    max_places = 3 if "1" in duration else 6
    route = places[:max_places]
    if len(route) > 2:
        ordered = [route.pop(0)]
        while route:
            current = ordered[-1]
            next_place = min(route, key=lambda place: distance_score(current, place))
            route.remove(next_place)
            ordered.append(next_place)
        route = ordered

    return route
