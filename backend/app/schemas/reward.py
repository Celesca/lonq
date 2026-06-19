from pydantic import BaseModel


class RewardOut(BaseModel):
    id: int
    name: str
    description: str
    image: str
    coinCost: int
    category: str
    discountCode: str
    validUntil: str
    location: str
