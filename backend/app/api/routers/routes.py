from fastapi import APIRouter

from app.db.session import DbSession
from app.schemas.route import RouteIn
from app.services.places import to_travel_place
from app.services.routes import create_optimized_route
from app.services.users import get_or_create_user

router = APIRouter(tags=["routes"])


@router.post("/route")
def create_route(payload: RouteIn, db: DbSession) -> dict[str, object]:
    user = get_or_create_user(db, payload.user_id)
    route = create_optimized_route(db, user, payload.personality, payload.duration, payload.city)
    return {"places": [to_travel_place(place) for place in route], "total": len(route)}
