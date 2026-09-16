# URL Shortener — backend

FastAPI + SQLAlchemy + Alembic + PostgreSQL.

## API

| Method | Path                | Description                                   |
|--------|---------------------|-----------------------------------------------|
| POST   | `/api/links`        | `{"url": "...", "alias": "optional"}` → 201   |
| GET    | `/api/links/{code}` | Link info + click count                       |
| GET    | `/{code}`           | 307 redirect to target, increments clicks     |
| GET    | `/healthz`          | Liveness (no DB), returns `APP_VERSION`       |
| GET    | `/readyz`           | Readiness (checks DB), 503 when DB is down    |
| GET    | `/metrics`          | Prometheus metrics                            |
| GET    | `/docs`             | Swagger UI                                    |

## Run

Requires a running PostgreSQL.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # edit DATABASE_URL
alembic upgrade head

# dev
uvicorn app.main:app --reload

# prod-like (ASGI workers under gunicorn)
gunicorn app.main:app -k uvicorn_worker.UvicornWorker --bind 0.0.0.0:8000 --workers 2
```

The app is fully async (ASGI): async SQLAlchemy over psycopg 3, `async def` endpoints.

## Tests

Tests need a real Postgres at `DATABASE_URL`. They drop and recreate tables, so point them at a throwaway DB.

```bash
pytest
```

## Configuration (env vars)

| Var            | Default                                                             |
|----------------|---------------------------------------------------------------------|
| `DATABASE_URL` | `postgresql+psycopg://shortener:shortener@localhost:5432/shortener` |
| `BASE_URL`     | `http://localhost:8000` — public origin used in `short_url`         |
| `CORS_ORIGINS` | `["http://localhost:3000"]` (JSON list)                             |
| `CODE_LENGTH`  | `7`                                                                 |
| `APP_VERSION`  | `dev` — shown in `/healthz`                                         |

## Migrations

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
