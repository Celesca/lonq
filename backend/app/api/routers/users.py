from fastapi import APIRouter

from app.db.session import DbSession
from app.schemas.user import UserCreate, UserOut
from app.services.users import get_or_create_user

router = APIRouter(tags=["users"])


@router.post("/users", response_model=UserOut)
def create_or_get_user(payload: UserCreate, db: DbSession) -> UserOut:
    user = get_or_create_user(db, payload.user_id, payload.display_name, payload.picture_url)
    return UserOut(
        id=user.line_user_id,
        display_name=user.display_name,
        picture_url=user.picture_url,
        total_coins=user.total_coins,
    )
