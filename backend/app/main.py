from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import health, places, preferences, rewards, routes, stats, swipes, users
from app.core.config import settings
from app.db.seed import seed_database


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.version)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(users.router)
    app.include_router(places.router)
    app.include_router(swipes.router)
    app.include_router(preferences.router)
    app.include_router(stats.router)
    app.include_router(rewards.router)
    app.include_router(routes.router)

    @app.on_event("startup")
    def on_startup() -> None:
        seed_database()

    return app


app = create_app()
