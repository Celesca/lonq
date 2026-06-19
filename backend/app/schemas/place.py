from pydantic import BaseModel


class TravelPlaceOut(BaseModel):
    id: str
    backendId: int
    name: str
    lat: float
    long: float
    image: str
    description: str
    city: str
    country: str
    rating: float
    distance: str
    tags: list[str]
