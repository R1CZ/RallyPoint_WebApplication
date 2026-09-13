# RallyPoint — The Pickleball Operating System

A full product experience for pickleball clubs, players and organizers: verified people, verified
communities, intelligent matchmaking and intelligent club management.

> This repository ships the **complete client** (landing, verified onboarding, player OS, club OS)
> plus the **deterministic core engine** (`src/lib/engine.ts`). The engine is written to run
> server-side in production — the client never makes security-critical decisions on its own.

---

## What's inside

| Area | Where | Notes |
|---|---|---|
| Landing / marketing | `src/pages/Landing.tsx` | Live court, ticker, feature bento, dual onboarding paths, trust pipeline |
| Registration + KYC flow | `src/pages/Onboarding.tsx` | Name sanity, password policy, code verification w/ rate limit, doc→OCR→face→liveness→name-policy pipeline |
| Player OS | `src/pages/PlayerApp.tsx`, `PlayerExtras.tsx` | Dashboard, discovery w/ explained match scores, Play Now / Fair Match Engine, Play Style DNA, events + smart waitlist, rankings, achievements, messages, notifications, profile |
| Club creation wizard | `src/pages/ClubWizard.tsx` | 6 steps: identity → location → courts → rules → verification → review |
| Club admin OS | `src/pages/ClubAdmin.tsx` | Health Score, court-utilization heatmap, retention radar, member RBAC, event/waitlist ops, fraud queue + audit log |
| Core engine | `src/lib/engine.ts` | Pure, typed, unit-testable logic (see below) |
| Seed data | `src/lib/data.ts` | Clubs, players, events, notifications, audit logs, risk queue |
| Design system | `src/components/ui.tsx` | Custom SVG icons, buttons, cards, modals, tabs, gauges, radar, heatmaps, toasts, reveal/counter primitives |

## Core engine (`src/lib/engine.ts`)

Deterministic and dependency-free — everything the platform *claims* is computed, not faked:

- `nameSanity()` — rejects keyboard rows, digit/symbol names, vowel-less strings, placeholders
- `nameMatchRatio()` + `classifyNameMatch()` — token-based fuzzy match (middle names, accents,
  hyphens) against a configurable `NAME_MATCH_THRESHOLD` → `VERIFIED | NEEDS_REVIEW | REJECTED`
- `passwordStrength()`, `validEmail()`, `validPhone()`
- `analyzePhoto()` — canvas luminance/detail pre-screen (local only; authoritative face-match is
  provider-side by design)
- `clubMatchScore()` — weighted, **explained** player→club compatibility
- `fairMatch()` — competitive balance beyond rating parity (form, style DNA, reliability, schedule)
- `skillBalance()` — foursome spread check with organizer override
- `clubHealth()` — aggregate health score + actionable recommendations
- `utilizationInsight()` — court-grid analysis → scheduling suggestions
- `eloDelta()` — transparent rating math (K=24)
- `riskLevel()` — weighted fraud signals → LOW / MEDIUM / REVIEW REQUIRED / HIGH (never auto-punitive)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  Landing │ Onboarding │ Player App │ Club Wizard │ Club Admin│
│                      │  API Client (src/lib/api.ts)         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Express + TypeScript)               │
│  server/index.ts                                             │
│  ├─ Auth middleware (JWT)                                    │
│  ├─ Rate limiting (express-rate-limit)                       │
│  ├─ Routes: auth, users, clubs, events, matches, verification│
│  └─ Validation (zod)                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SQLite Database (better-sqlite3)                │
│  server/data/rallypoint.db                                   │
│  Tables: users, user_profiles, identity_verifications,       │
│          clubs, club_memberships, events, event_registrations,│
│          event_chats, event_brackets, matches, match_players,│
│          notifications, audit_logs                           │
└─────────────────────────────────────────────────────────────┘
```

### Production target (future)

For production deployment, replace SQLite with PostgreSQL and add:
- Redis for sessions, rate limits, waitlist timers
- Object storage (S3) with signed URLs for document uploads
- KYC provider integration (Onfido, Jumio, etc.)
- Email/SMS providers (SendGrid, Twilio)
- Payment processor (Stripe)

**Security principles implemented in the UX contract:** all validation repeated server-side;
authorization enforced per endpoint (never frontend-only); IDs never displayed publicly; only
verification result + provider reference + timestamp retained; audit logs exclude secrets and raw
identity data; password reset never reveals account existence; rate limiting on registration,
resends and messaging.

## Running locally

### Full-stack (frontend + backend)

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start both frontend and backend
npm run dev
```

This starts:
- Frontend on `http://localhost:5173` (Vite dev server)
- Backend on `http://localhost:3001` (Express API)

### Frontend only

```bash
npm run dev:frontend
```

### Backend only

```bash
npm run dev:backend
```

### Production build

```bash
npm run build      # production build → dist/
npm run typecheck  # strict TS check
```

## Backend API

The backend provides a RESTful API at `/api/v1/`:

- **Auth**: `/auth/register`, `/auth/login`, `/auth/verify-email`, `/auth/verify-phone`, `/auth/me`
- **Users**: `/users/:id`, `/users/profile`, `/users/:id/clubs`, `/users/:id/notifications`
- **Clubs**: `/clubs`, `/clubs/:id`, `/clubs/:id/join`, `/clubs/:id/members`
- **Events**: `/events`, `/events/:id`, `/events/:id/register`, `/events/:id/chat`, `/events/:id/paid/:userId`, `/events/:id/bracket`, `/events/:id/close-chat`
- **Matches**: `/matches/history/:userId`, `/matches`
- **Verification**: `/verification/start`, `/verification/complete`, `/verification/status`

All endpoints except `/auth/register`, `/auth/login`, `/clubs`, `/clubs/:id`, `/events`, `/events/:id` require authentication via JWT token in the `Authorization: Bearer <token>` header.

## Environment (production deployment)

See `.env.example`. Secrets via a secrets manager — never committed.

```
DATABASE_URL=            # PostgreSQL
REDIS_URL=               # cache / rate limits / timers
JWT_SIGNING_KEY=         # rotate; short-lived access + rotating refresh
KYC_PROVIDER_API_KEY=    # identity verification provider
KYC_NAME_MATCH_THRESHOLD # default 0.72 — policy decision, server-side
STORAGE_BUCKET=          # isolated private bucket, signed URLs only
MAP_PROVIDER=            # google | mapbox | osm (abstracted)
WEATHER_API_KEY=         # optional, outdoor event risk
PAYMENT_PROVIDER=        # abstraction; raw card data never touches our servers
```

## Testing guidance

Engine functions are pure → unit-test directly: name matching (middle names, accents,
"Dragon Slayer 999" must fail), Elo deltas, event capacity/waitlist ordering, RBAC matrices,
risk-level boundaries. Integration tests cover registration→verification→club→event→result flows;
security tests cover unauthorized endpoint access, privilege escalation, upload validation and
rate-limit enforcement.
