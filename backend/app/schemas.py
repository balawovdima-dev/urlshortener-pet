from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class LinkCreate(BaseModel):
    url: HttpUrl
    alias: str | None = Field(
        default=None, min_length=3, max_length=32, pattern=r"^[A-Za-z0-9_-]+$"
    )


class LinkOut(BaseModel):
    code: str
    short_url: str
    target_url: str
    clicks: int
    created_at: datetime
