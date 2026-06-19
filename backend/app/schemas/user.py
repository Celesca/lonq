from pydantic import BaseModel


class UserCreate(BaseModel):
    user_id: str
    display_name: str | None = None
    picture_url: str | None = None


class UserOut(BaseModel):
    id: str
    display_name: str | None = None
    picture_url: str | None = None
    total_coins: int


class PreferencesIn(BaseModel):
    selected_cities: list[str] | None = None
    travel_personality: str | None = None
    preferred_tags: list[str] | None = None
