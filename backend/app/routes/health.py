from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_session

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def liveness() -> dict:
    """Process is up. Use for liveness probes — never touches the DB."""
    return {"status": "ok", "version": settings.app_version}


@router.get("/readyz")
async def readiness(session: AsyncSession = Depends(get_session)) -> dict:
    """Ready to serve traffic. Use for readiness probes / LB health checks."""
    try:
        await session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ready"}
