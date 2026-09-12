# DayDuel Backend

Minimal API for DayDuel mobile app. Designed for optional sync - the mobile app works offline-first with local streak/score.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

Server runs on `http://localhost:3000` (override with `PORT` env var).

## API Endpoints

### Health Check

```
GET /health
```

Returns: `{ status: "ok", timestamp: "...", version: "0.1.0" }`

### Authentication

All auth endpoints return a session ID for use with sync.

```
POST /auth/guest          # Create guest session (no credentials)
POST /auth/apple          # Apple Sign-In (stub - not implemented)
POST /auth/google         # Google Sign-In (stub - not implemented)  
DELETE /auth/session      # End session (requires X-Session-Id header)
```

**Guest session example:**

```bash
curl -X POST http://localhost:3000/auth/guest
# → { "sessionId": "...", "type": "guest", "message": "..." }
```

### Score/Streak Sync

Requires `X-Session-Id` header from auth.

```
GET /sync                 # Get current synced data
POST /sync                # Upload local data
```

**Sync example:**

```bash
# Get current data
curl http://localhost:3000/sync -H "X-Session-Id: YOUR_SESSION_ID"

# Upload score/streak
curl -X POST http://localhost:3000/sync \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: YOUR_SESSION_ID" \
  -d '{"score": 1500, "streak": 7, "lastPlayedAt": 1699999999999}'
```

## Architecture

- **Framework:** [Hono](https://hono.dev) - lightweight, fast, works on Vercel/Fly/Cloudflare
- **Storage:** In-memory for MVP (data lost on restart)
- **Auth:** Session-based with header token

## Production TODOs

- [ ] Replace in-memory store with SQLite or Postgres
- [ ] Implement Apple Sign-In verification (`/auth/apple`)
- [ ] Implement Google Sign-In verification (`/auth/google`)
- [ ] Add rate limiting
- [ ] Add request validation (zod)
- [ ] Add proper error handling middleware
- [ ] Configure deployment (Vercel/Fly)

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

### Fly.io

```bash
fly launch
fly deploy
```

## Tech Stack

- Node.js 20+
- TypeScript
- Hono (HTTP framework)
- tsx (development runtime)
