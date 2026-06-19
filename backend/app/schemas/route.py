from pydantic import BaseModel


class RouteIn(BaseModel):
    user_id: str
    personality: str = "balanced"
    duration: str = "1 วัน ไม่ค้างคืน"
    city: str = "all"
