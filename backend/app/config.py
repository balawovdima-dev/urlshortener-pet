from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All config comes from env vars (or a local .env file)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://shortener:shortener@localhost:5432/shortener"
    # Public origin used to build short links, e.g. https://sho.rt
    base_url: str = "http://localhost:8000"
    # JSON list, e.g. CORS_ORIGINS='["https://app.example.com"]'
    cors_origins: list[str] = ["http://localhost:3000"]
    code_length: int = 7
    # Injected at build/deploy time so /healthz shows what's running
    app_version: str = "dev"


settings = Settings()
