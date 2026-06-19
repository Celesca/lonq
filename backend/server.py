from __future__ import annotations

import os
import random
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./long.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    pass


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


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("user_id", "place_id", name="uq_user_place_swipe"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"))
    direction: Mapped[str] = mapped_column(String(12))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    place: Mapped[Place] = relationship()


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


class PlaceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    name: str
    latitude: float
    longitude: float
    image_url: str
    description: str
    city: str
    country: str
    rating: float
    distance: str
    tags: list[str]


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


class UserOut(BaseModel):
    id: str
    display_name: str | None = None
    picture_url: str | None = None
    total_coins: int


class UserCreate(BaseModel):
    user_id: str
    display_name: str | None = None
    picture_url: str | None = None


class SwipeIn(BaseModel):
    user_id: str
    place_id: int
    direction: str


class PreferencesIn(BaseModel):
    selected_cities: list[str] | None = None
    travel_personality: str | None = None
    preferred_tags: list[str] | None = None


class RouteIn(BaseModel):
    user_id: str
    personality: str = "balanced"
    duration: str = "1 วัน ไม่ค้างคืน"
    city: str = "all"


PLACES = [
    ("cm_1", "วัดอุโมงค์", 18.783636, 98.953588, "https://www.pattayafans.de/chiangmai/bilder/wat-umong-4.jpg", "วัดป่าที่สงบเงียบ มีอุโมงค์โบราณ สวนร่มรื่น และบรรยากาศเหมาะกับการพักใจจากเมือง", "Chiang Mai", 4.6, "~3.2 กม.", ["วัฒนธรรม", "ธรรมชาติ", "อากาศดี"]),
    ("cm_2", "อ่างแก้ว", 18.8020, 98.9446, "https://img.wongnai.com/p/400x0/2018/10/20/05895251d10049ffb2af523f5ac289f9.jpg", "อ่างเก็บน้ำในมหาวิทยาลัยเชียงใหม่ มีทางเดิน วิวภูเขา และสนามหญ้าสำหรับปิกนิกยามเย็น", "Chiang Mai", 4.7, "~3.4 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("cm_3", "หอคำหลวง", 18.752879, 98.922341, "https://img.freepik.com/free-photo/ho-kham-luang-northern-thai-style-building-thailand_100801-487.jpg?size=626&ext=jpg", "สถาปัตยกรรมล้านนาอันงดงามท่ามกลางสวนใหญ่ เหมาะกับการเดินช้า ๆ และถ่ายภาพ", "Chiang Mai", 4.7, "~10.7 กม.", ["วัฒนธรรม", "ธรรมชาติ"]),
    ("cm_4", "วัดโลกโมฬี", 18.7962, 98.9826, "https://ik.imagekit.io/tvlk/blog/2020/07/shutterstock_1219520572.jpg?tr=dpr-2,w-675", "วัดเก่าแก่ใกล้คูเมือง มีเจดีย์อิฐและรายละเอียดล้านนาที่งดงามแต่ไม่พลุกพล่าน", "Chiang Mai", 4.8, "~1.5 กม.", ["วัฒนธรรม"]),
    ("cm_5", "บ้านข้างวัด", 18.7892, 98.9538, "https://tluxe-aws.hmgcdn.com/public/article/2017/atl_20230621172059_166.jpg", "ชุมชนศิลปิน คาเฟ่ และเวิร์กช็อปงานคราฟต์ในบรรยากาศอบอุ่นแบบเชียงใหม่", "Chiang Mai", 4.5, "~4 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("cm_6", "แม่กำปอง", 18.8655, 99.3510, "https://royalvacationdmc.com/wp-content/uploads/2023/11/Mae-kampong.jpg", "หมู่บ้านบนภูเขาที่มีโฮมสเตย์ กาแฟ ลำธาร และอากาศเย็น เหมาะกับทริปชาร์จพลัง", "Chiang Mai", 4.7, "~50 กม.", ["ธรรมชาติ", "อากาศดี", "วัฒนธรรม"]),
    ("bkk_1", "วัดอรุณราชวราราม", 13.7437, 100.4888, "https://lp-cms-production.s3.amazonaws.com/public/2021-06/shutterstockRF_517093306.jpg", "วัดริมเจ้าพระยาที่โดดเด่นด้วยพระปรางค์ประดับกระเบื้อง งดงามมากช่วงเย็น", "Bangkok", 4.8, "~5 กม.", ["วัฒนธรรม", "แลนด์มาร์ก"]),
    ("bkk_2", "ตลาดน้อย", 13.7333, 100.5139, "https://d1ef7ke0x2i9g8.cloudfront.net/hong-kong/_1200x630_fit_center-center_82_none/20230111-Talat-Noi-PIC02.png?mtime=1724145861", "ย่านสร้างสรรค์เก่าแก่ มีสตรีทอาร์ต คาเฟ่ โกดังเก่า และเสน่ห์จีน-ไทยริมแม่น้ำ", "Bangkok", 4.6, "~3 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("bkk_3", "บางกะเจ้า", 13.6850, 100.5550, "https://www.thelostpassport.com/wp-content/uploads/2016/06/Bangkok-treehouse-Bang-Krachao.jpg", "พื้นที่สีเขียวขนาดใหญ่ใกล้กรุงเทพฯ ปั่นจักรยานผ่านสวน ตลาดน้ำ และทางเดินไม้", "Bangkok", 4.7, "~12 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("bkk_4", "มิวเซียมสยาม", 13.7441, 100.4936, "https://www.museumsiam.org/upload/cover/20190227_1551256248.jpg", "พิพิธภัณฑ์ร่วมสมัยที่เล่าเรื่องความเป็นไทยผ่านนิทรรศการอินเตอร์แอกทีฟ", "Bangkok", 4.5, "~4 กม.", ["วัฒนธรรม", "ในร่ม"]),
    ("bkk_5", "สวนเบญจกิติ", 13.7304, 100.5601, "https://static.bangkokpost.com/media/content/20220203/c1_2258143_700.jpg", "สวนใจกลางเมืองที่มีบึงใหญ่ สกายวอล์ก และเส้นทางวิ่งเดินท่ามกลางวิวเมือง", "Bangkok", 4.7, "~6 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("bkk_6", "คลองโอ่งอ่าง", 13.7468, 100.5022, "https://www.bangkokriver.com/wp-content/uploads/2021/02/Ong-Ang-Walking-Street.jpg", "ทางเดินริมคลองที่มีสตรีทอาร์ต อาหาร และบรรยากาศเมืองเก่าหลังปรับปรุง", "Bangkok", 4.3, "~3.5 กม.", ["ตลาด", "วัฒนธรรม", "อาหาร"]),
    ("ph_1", "ย่านเมืองเก่าภูเก็ต", 7.8840, 98.3873, "https://a.cdn-hotels.com/gdcs/production93/d1258/89b39278-d604-4d43-b6db-df330fccdbf6.jpg", "อาคารชิโนโปรตุกีสสีสด คาเฟ่ ร้านท้องถิ่น และสตรีทอาร์ตที่เหมาะกับการเดินสำรวจ", "Phuket", 4.7, "~1 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("ph_2", "แหลมพรหมเทพ", 7.7614, 98.3050, "https://www.phuket.net/wp-content/uploads/2018/10/promthep-cape-sunset-phuket.jpg", "จุดชมพระอาทิตย์ตกชื่อดังของภูเก็ต มองเห็นทะเลอันดามันและแนวหน้าผาสวยงาม", "Phuket", 4.6, "~18 กม.", ["ธรรมชาติ", "แลนด์มาร์ก"]),
    ("ph_3", "หาดยะนุ้ย", 7.7662, 98.3066, "https://www.hotelscombined.com/rimg/dimg/4b/53/1694f32e-city-23911-17c15eecf7c.jpg", "หาดเล็กน้ำใสใกล้แหลมพรหมเทพ เหมาะกับพายคายัค ดำน้ำตื้น และพักริมทะเล", "Phuket", 4.5, "~17 กม.", ["ธรรมชาติ", "ทะเล"]),
    ("ph_4", "พระใหญ่ภูเก็ต", 7.8276, 98.3128, "https://www.agoda.com/wp-content/uploads/2024/03/Big-Buddha-Phuket-Thailand.jpg", "พระพุทธรูปขนาดใหญ่บนเขานาคเกิด พร้อมวิวเมืองและชายฝั่งแบบพาโนรามา", "Phuket", 4.6, "~12 กม.", ["วัฒนธรรม", "แลนด์มาร์ก"]),
    ("ph_5", "หาดในหาน", 7.7792, 98.3069, "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/nai-harn-beach.jpg?w=1200&h=-1&s=1", "หาดโค้งสวย น้ำใส บรรยากาศสงบกว่าหาดหลัก เหมาะกับว่ายน้ำและนอนอ่านหนังสือ", "Phuket", 4.7, "~16 กม.", ["ธรรมชาติ", "ทะเล"]),
    ("ph_6", "ตลาดชิลล์วา", 7.9031, 98.3802, "https://www.phuket101.net/wp-content/uploads/20181029_202553.jpg", "ตลาดกลางคืนสไตล์คอนเทนเนอร์ มีอาหาร เสื้อผ้า งานคราฟต์ และดนตรีสด", "Phuket", 4.4, "~4 กม.", ["ตลาด", "อาหาร"]),
]

REWARDS = [
    ("ส่วนลดกาแฟท้องถิ่น", "ลด 20% ที่คาเฟ่พาร์ตเนอร์ในเชียงใหม่ กรุงเทพฯ และภูเก็ต", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80", 60, "food", "LONGCAFE20", "31 Dec 2026", "Partner cafes"),
    ("โปสการ์ด LONG", "แลกโปสการ์ดลายเมืองไทยสำหรับส่งให้เพื่อนร่วมทริป", "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=900&q=80", 40, "souvenir", "LONGPOST", "31 Dec 2026", "LONG pop-up"),
    ("Mini walking tour", "รับส่วนลดทัวร์เดินย่านสร้างสรรค์กับไกด์ท้องถิ่น", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80", 120, "experience", "LONGWALK", "31 Dec 2026", "Bangkok / Chiang Mai / Phuket"),
]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Db = Annotated[Session, Depends(get_db)]


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


def get_or_create_user(db: Session, user_id: str, display_name: str | None = None, picture_url: str | None = None) -> User:
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


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Place.id).limit(1)) is None:
            for external_id, name, lat, long, image, description, city, rating, distance, tags in PLACES:
                db.add(Place(external_id=external_id, name=name, latitude=lat, longitude=long, image_url=image, description=description, city=city, rating=rating, distance=distance, tags=tags))
        if db.scalar(select(Reward.id).limit(1)) is None:
            for name, description, image, cost, category, code, valid_until, location in REWARDS:
                db.add(Reward(name=name, description=description, image=image, coin_cost=cost, category=category, discount_code=code, valid_until=valid_until, location=location))
        db.commit()


app = FastAPI(title="LONG API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    seed_database()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "long-api", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/users", response_model=UserOut)
def create_or_get_user(payload: UserCreate, db: Db) -> UserOut:
    user = get_or_create_user(db, payload.user_id, payload.display_name, payload.picture_url)
    return UserOut(id=user.line_user_id, display_name=user.display_name, picture_url=user.picture_url, total_coins=user.total_coins)


@app.get("/places")
def get_places(db: Db, cities: Annotated[list[str] | None, Query()] = None) -> dict[str, object]:
    query = select(Place)
    if cities and "all" not in cities:
        query = query.where(Place.city.in_(cities))
    places = list(db.scalars(query.order_by(Place.city, Place.rating.desc())))
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}


@app.get("/cities")
def get_cities(db: Db) -> dict[str, object]:
    places = list(db.scalars(select(Place)))
    cities: dict[str, int] = {}
    for place in places:
        cities[place.city] = cities.get(place.city, 0) + 1
    return {"cities": [{"name": name, "place_count": count} for name, count in sorted(cities.items())]}


@app.get("/tinder")
def get_tinder_places(user_id: str, db: Db, cities: Annotated[list[str] | None, Query()] = None) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    swiped_ids = set(db.scalars(select(Swipe.place_id).where(Swipe.user_id == user.id)))
    query = select(Place)
    if cities and "all" not in cities:
        query = query.where(Place.city.in_(cities))
    places = [place for place in db.scalars(query) if place.id not in swiped_ids]
    random.shuffle(places)
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}


@app.post("/swipes")
def create_swipe(payload: SwipeIn, db: Db) -> dict[str, object]:
    if payload.direction not in {"left", "right"}:
        raise HTTPException(status_code=400, detail="direction must be left or right")
    user = get_or_create_user(db, payload.user_id)
    place = db.get(Place, payload.place_id)
    if place is None:
        raise HTTPException(status_code=404, detail="place not found")
    swipe = db.scalar(select(Swipe).where(Swipe.user_id == user.id, Swipe.place_id == place.id))
    if swipe is None:
        swipe = Swipe(user_id=user.id, place_id=place.id, direction=payload.direction)
        db.add(swipe)
    else:
        swipe.direction = payload.direction
    if payload.direction == "right":
        user.total_coins += 5
    db.commit()
    return {"success": True, "coins": user.total_coins}


@app.get("/liked")
def get_liked_places(user_id: str, db: Db) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    swipes = db.scalars(select(Swipe).where(Swipe.user_id == user.id, Swipe.direction == "right").order_by(Swipe.created_at.desc()))
    places = [swipe.place for swipe in swipes]
    return {"places": [to_travel_place(place) for place in places], "total": len(places)}


@app.delete("/liked/{place_id}")
def remove_liked_place(place_id: int, user_id: str, db: Db) -> dict[str, bool]:
    user = get_or_create_user(db, user_id)
    swipe = db.scalar(select(Swipe).where(Swipe.user_id == user.id, Swipe.place_id == place_id))
    if swipe:
        db.delete(swipe)
        db.commit()
    return {"success": True}


@app.delete("/progress")
def reset_progress(user_id: str, db: Db) -> dict[str, bool]:
    user = get_or_create_user(db, user_id)
    for swipe in db.scalars(select(Swipe).where(Swipe.user_id == user.id)):
        db.delete(swipe)
    db.commit()
    return {"success": True}


@app.get("/preferences")
def get_preferences(user_id: str, db: Db) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    return {
        "selected_cities": user.selected_cities or [],
        "travel_personality": user.travel_personality,
        "preferred_tags": user.preferred_tags or [],
    }


@app.put("/preferences")
def update_preferences(user_id: str, payload: PreferencesIn, db: Db) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    if payload.selected_cities is not None:
        user.selected_cities = payload.selected_cities
    if payload.travel_personality is not None:
        user.travel_personality = payload.travel_personality
    if payload.preferred_tags is not None:
        user.preferred_tags = payload.preferred_tags
    db.commit()
    return {"selected_cities": user.selected_cities or [], "travel_personality": user.travel_personality, "preferred_tags": user.preferred_tags or []}


@app.get("/stats")
def get_stats(user_id: str, db: Db) -> dict[str, int]:
    user = get_or_create_user(db, user_id)
    swipes = list(db.scalars(select(Swipe).where(Swipe.user_id == user.id)))
    return {
        "total_swipes": len(swipes),
        "liked_places": len([s for s in swipes if s.direction == "right"]),
        "disliked_places": len([s for s in swipes if s.direction == "left"]),
        "total_coins": user.total_coins,
        "journeys_completed": 0,
        "photos_uploaded": 0,
    }


@app.get("/rewards")
def get_rewards(db: Db) -> dict[str, object]:
    rewards = list(db.scalars(select(Reward).order_by(Reward.coin_cost)))
    return {
        "rewards": [
            {
                "id": reward.id,
                "name": reward.name,
                "description": reward.description,
                "image": reward.image,
                "coinCost": reward.coin_cost,
                "category": reward.category,
                "discountCode": reward.discount_code,
                "validUntil": reward.valid_until,
                "location": reward.location,
            }
            for reward in rewards
        ],
        "total": len(rewards),
    }


@app.post("/rewards/{reward_id}/redeem")
def redeem_reward(reward_id: int, user_id: str, db: Db) -> dict[str, object]:
    user = get_or_create_user(db, user_id)
    reward = db.get(Reward, reward_id)
    if reward is None:
        raise HTTPException(status_code=404, detail="reward not found")
    if user.total_coins < reward.coin_cost:
        return {"success": False, "message": "Not enough coins"}
    user.total_coins -= reward.coin_cost
    db.add(RedeemedReward(user_id=user.id, reward_id=reward.id))
    db.commit()
    return {"success": True, "message": f"Redeemed. Code: {reward.discount_code}", "coins": user.total_coins}


def distance_score(place: Place, other: Place) -> float:
    return abs(place.latitude - other.latitude) + abs(place.longitude - other.longitude)


@app.post("/route")
def create_route(payload: RouteIn, db: Db) -> dict[str, object]:
    user = get_or_create_user(db, payload.user_id)
    liked_swipes = list(db.scalars(select(Swipe).where(Swipe.user_id == user.id, Swipe.direction == "right")))
    places = [swipe.place for swipe in liked_swipes]
    if payload.city != "all":
        places = [place for place in places if place.city == payload.city]
    if not places:
        query = select(Place)
        if payload.city != "all":
            query = query.where(Place.city == payload.city)
        places = list(db.scalars(query.order_by(Place.rating.desc()).limit(5)))

    if "slow" in payload.personality.lower() or "introvert" in payload.personality.lower():
        places.sort(key=lambda p: ("ธรรมชาติ" not in (p.tags or []), -p.rating))
    elif "food" in payload.personality.lower():
        places.sort(key=lambda p: ("อาหาร" not in (p.tags or []) and "ตลาด" not in (p.tags or []), -p.rating))
    else:
        places.sort(key=lambda p: p.rating, reverse=True)

    max_places = 3 if "1" in payload.duration else 6
    route = places[:max_places]
    if len(route) > 2:
        ordered = [route.pop(0)]
        while route:
            current = ordered[-1]
            next_place = min(route, key=lambda place: distance_score(current, place))
            route.remove(next_place)
            ordered.append(next_place)
        route = ordered
    return {"places": [to_travel_place(place) for place in route], "total": len(route)}
