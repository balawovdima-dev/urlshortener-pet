import logging
import random
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.db import engine
from app.routes import health, links

# Probe and scrape traffic: excluded from metrics (it would dilute the error
# rate) and never hit by chaos.
INFRA_PATHS = ["/healthz", "/readyz", "/metrics"]

log = logging.getLogger("app")


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

    @app.middleware("http")
    async def chaos(request: Request, call_next):
        if (
            settings.chaos_error_rate > 0
            and request.url.path not in INFRA_PATHS
            and random.random() < settings.chaos_error_rate
        ):
            log.error("chaos: injected 500 for %s %s", request.method, request.url.path)
            return JSONResponse({"detail": "injected failure (CHAOS_ERROR_RATE)"}, status_code=500)
        return await call_next(request)

    # Added after chaos, so it wraps it and counts the injected 500s too.
    Instrumentator(excluded_handlers=INFRA_PATHS).instrument(app).expose(app, include_in_schema=False)

    app.include_router(health.router)
    app.include_router(links.router)  # last: contains the /{code} catch-all
    return app


app = create_app()
