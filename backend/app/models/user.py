from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    line_user_id: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_coins: Mapped[int] = mapped_column(Integer, default=80)
    selected_cities: Mapped[list[str]] = mapped_column(JSON, default=list)
    travel_personality: Mapped[str | None] = mapped_column(String(80), nullable=True)
    preferred_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
