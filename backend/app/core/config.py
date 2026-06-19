from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "LONG API"
    version: str = "1.0.0"
    database_url: str = "sqlite:///./long.db"
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ]


def get_settings() -> Settings:
    database_url = os.getenv("DATABASE_URL", Settings().database_url)
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

    cors_origins = os.getenv("CORS_ORIGINS")
    return Settings(
        database_url=database_url,
        cors_origins=cors_origins.split(",") if cors_origins else Settings().cors_origins,
    )


settings = get_settings()
