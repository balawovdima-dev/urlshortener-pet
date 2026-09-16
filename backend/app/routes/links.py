from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from prometheus_client import Counter
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_session
from app.models import Link
from app.schemas import LinkCreate, LinkOut
from app.shortcode import generate_code

router = APIRouter()

LINKS_CREATED = Counter("shortener_links_created_total", "Short links created")
REDIRECTS = Counter("shortener_redirects_total", "Redirects served", ["result"])

# Aliases that would shadow other routes
RESERVED = {"api", "docs", "redoc", "healthz", "readyz", "metrics"}
MAX_CODE_ATTEMPTS = 5


def to_out(link: Link) -> LinkOut:
    return LinkOut(
        code=link.code,
        short_url=f"{settings.base_url.rstrip('/')}/{link.code}",
        target_url=link.target_url,
        clicks=link.clicks,
        created_at=link.created_at,
    )


async def try_insert(session: AsyncSession, link: Link) -> bool:
    session.add(link)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        return False
    return True


@router.post("/api/links", status_code=201, response_model=LinkOut, tags=["links"])
async def create_link(
    payload: LinkCreate, session: AsyncSession = Depends(get_session)
) -> LinkOut:
    target = str(payload.url)

    if payload.alias:
        if payload.alias.lower() in RESERVED:
            raise HTTPException(status_code=422, detail="Alias is reserved")
        link = Link(code=payload.alias, target_url=target)
        if not await try_insert(session, link):
            raise HTTPException(status_code=409, detail="Alias already taken")
    else:
        for _ in range(MAX_CODE_ATTEMPTS):
            link = Link(code=generate_code(settings.code_length), target_url=target)
            if await try_insert(session, link):
                break
        else:
            raise HTTPException(status_code=503, detail="Could not allocate a short code")

    await session.refresh(link)
    LINKS_CREATED.inc()
    return to_out(link)


@router.get("/api/links/{code}", response_model=LinkOut, tags=["links"])
async def get_link(code: str, session: AsyncSession = Depends(get_session)) -> LinkOut:
    link = await session.scalar(select(Link).where(Link.code == code))
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")
    return to_out(link)


# Catch-all — must be registered last
@router.get("/{code}", include_in_schema=False)
async def follow(code: str, session: AsyncSession = Depends(get_session)) -> RedirectResponse:
    target = await session.scalar(
        update(Link)
        .where(Link.code == code)
        .values(clicks=Link.clicks + 1)
        .returning(Link.target_url)
    )
    if target is None:
        REDIRECTS.labels(result="not_found").inc()
        raise HTTPException(status_code=404, detail="Link not found")
    await session.commit()
    REDIRECTS.labels(result="ok").inc()
    return RedirectResponse(target, status_code=307)
