from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_or_create_user(
    db: Session,
    user_id: str,
    display_name: str | None = None,
    picture_url: str | None = None,
) -> User:
    user = db.scalar(select(User).where(User.line_user_id == user_id))
    if user:
        if display_name is not None:
            user.display_name = display_name
        if picture_url is not None:
            user.picture_url = picture_url
        db.commit()
        db.refresh(user)
        return user

    user = User(line_user_id=user_id, display_name=display_name, picture_url=picture_url)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
