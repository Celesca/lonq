from app.models.place import Place
from app.schemas.place import TravelPlaceOut


def to_travel_place(place: Place) -> TravelPlaceOut:
    return TravelPlaceOut(
        id=place.external_id,
        backendId=place.id,
        name=place.name,
        lat=place.latitude,
        long=place.longitude,
        image=place.image_url,
        description=place.description,
        city=place.city,
        country=place.country,
        rating=place.rating,
        distance=place.distance,
        tags=place.tags or [],
    )


def distance_score(place: Place, other: Place) -> float:
    return abs(place.latitude - other.latitude) + abs(place.longitude - other.longitude)
