from pydantic import BaseModel


class SwipeIn(BaseModel):
    user_id: str
    place_id: int
    direction: str
