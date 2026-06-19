from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Reward(Base):
    __tablename__ = "rewards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    image: Mapped[str] = mapped_column(Text)
    coin_cost: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(40))
    discount_code: Mapped[str] = mapped_column(String(40))
    valid_until: Mapped[str] = mapped_column(String(40))
    location: Mapped[str] = mapped_column(String(120))


class RedeemedReward(Base):
    __tablename__ = "redeemed_rewards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    reward_id: Mapped[int] = mapped_column(ForeignKey("rewards.id", ondelete="CASCADE"))
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reward: Mapped[Reward] = relationship()
