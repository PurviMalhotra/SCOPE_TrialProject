# SCOPE Event Management Portal

Faculty event request dashboard backed by **PostgreSQL**. The dashboard table refreshes every 5 seconds from the API.

If port **5500** is stuck, stop the old process before starting the backend:

```bash
lsof -ti:5500 | xargs kill -9
cd backend && npm run dev
```

## Quick start (recommended)

### 1. Start database and backend (Docker)

```bash
cd /Users/kopalkanodia/Desktop/Scope_trialproject
docker compose up -d postgres redis minio
```

Wait ~10 seconds for PostgreSQL to initialize (schema + seed data).

```bash
cp backend/.env.example backend/.env
docker compose up -d backend
```

### 2. Start frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5170** and click **Continue with Google**.

For local testing without Google, use **Continue as Demo Faculty** (only shown when `ENABLE_DEV_AUTH=true`).

## Local development (Mac Homebrew PostgreSQL)

1. Ensure Postgres is running: `brew services start postgresql@18`
2. Edit `backend/.env` — set `DB_USER` to your Mac username (often not `postgres`) and `DB_PASSWORD` empty if you use peer auth.
3. Initialize DB: `cd backend && bash database/scripts/init_db.sh`
4. Backend: `npm install && npm run dev`
5. Frontend: `cd ../frontend && npm install && npm run dev`

## Local development (Docker for Postgres only)

1. `docker compose up -d postgres` (requires Docker Desktop)
2. Backend: `cd backend && cp .env.example .env && npm install && npm run dev`
3. Frontend: `cd frontend && cp .env.example .env && npm install && npm run dev`

## What was fixed

- Added **PostgreSQL** to Docker Compose with automatic schema + seed on first run
- Connected `eventRequestRepository` to the database view `v_my_event_requests` (live table data)
- Added **dev login** so the app works without Google OAuth
- Dashboard **polls the API every 5s** so new DB rows appear automatically
- Stores full form payloads in `form_data` JSONB for view/edit

## Google OAuth setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add **Authorized redirect URI** (must match exactly, no trailing slash):

   `http://localhost:5500/api/auth/google/callback`
4. Add **Authorized JavaScript origin**: `http://localhost:5170`
5. Copy Client ID and Client Secret into `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5500/api/auth/google/callback
FRONTEND_URL=http://localhost:5170
```

6. Restart backend and frontend. Sign in with **Continue with Google**.

**If you see `Error 400: redirect_uri_mismatch`:** the URI in Google Console does not exactly match `GOOGLE_CALLBACK_URL` in `backend/.env`. Use `localhost` (not `127.0.0.1`), port `5500`, and no trailing slash.

Google accounts are matched by email to existing seed users, or a new faculty user is created automatically.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server health |
| `POST /api/auth/dev-login` | Dev sign-in `{ "email": "rahul.sharma@vit.ac.in" }` |
| `GET /api/event-requests` | List requests (Bearer token) |

## Seed users

| Email | Role |
|-------|------|
| rahul.sharma@vit.ac.in | faculty |
| priya.verma@vit.ac.in | faculty |
| scope.admin@vit.ac.in | scope_admin |
