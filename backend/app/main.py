from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.db import engine
from app.routes import health, links


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    # Close pooled DB connections on graceful shutdown (SIGTERM)
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title="URL Shortener", version=settings.app_version, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    Instrumentator().instrument(app).expose(app, include_in_schema=False)

    app.include_router(health.router)
    app.include_router(links.router)  # last: contains the /{code} catch-all
    return app


app = create_app()
