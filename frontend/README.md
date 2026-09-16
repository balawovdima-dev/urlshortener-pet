# URL Shortener — Frontend

Next.js (App Router, TypeScript, Tailwind CSS) frontend for the URL shortener API.

## Requirements

- Node.js 20+
- The backend API must be running (by default at `http://localhost:8000`). The frontend
  calls it directly from the browser, and the backend allows CORS from `http://localhost:3000`.

## Environment variables

| Variable              | Default                 | Description              |
| --------------------- | ----------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the backend. |

Copy the example file and adjust if needed:

```bash
cp .env.example .env.local
```

> `NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle at **build time**.
> Changing the value later requires rebuilding (`npm run build`).

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Features

- `/` — shorten a URL (optional custom alias), copy the result, recent links stored in `localStorage`
- `/stats/[code]` — short URL, target URL, click count and creation date, with a refresh button

## Project structure

```
src/
  app/                  routes (home, stats/[code])
  components/           UI components
  lib/config.ts         API base URL
  lib/api.ts            typed API client + ApiError
  lib/validation.ts     client-side URL / alias validation
  lib/recent-links.ts   localStorage helpers
```
