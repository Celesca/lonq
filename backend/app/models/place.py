from sqlalchemy import JSON, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    external_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    image_url: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(80), index=True)
    country: Mapped[str] = mapped_column(String(80), default="Thailand")
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    distance: Mapped[str] = mapped_column(String(40), default="")
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
