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

## Architecture notes (production target)

```
web (this app) ── HTTPS ──▶ /api/v1/{auth,users,verification,clubs,members,events,
                              matches,rankings,messaging,notifications,admin,moderation,analytics}
                              │ NestJS modules · DTO validation · authz middleware (RBAC per route)
                              ├─ PostgreSQL (normalized: users, identity_verifications, clubs,
                              │   club_memberships, club_roles, courts, events, event_registrations,
                              │   waitlists, matches, match_players, ratings, rankings, achievements,
                              │   availability, notifications, messages, reports, moderation_actions,
                              │   audit_logs, subscriptions, payments, documents_metadata, fraud_risk_events)
                              ├─ Redis (sessions, rate limits, waitlist timers)
                              ├─ Object storage (signed URLs, randomized names, MIME/size validation,
                              │   decompression guards; documents purged on retention policy)
                              └─ KYC provider (document authenticity, OCR, face-match, liveness)
```

**Security principles implemented in the UX contract:** all validation repeated server-side;
authorization enforced per endpoint (never frontend-only); IDs never displayed publicly; only
verification result + provider reference + timestamp retained; audit logs exclude secrets and raw
identity data; password reset never reveals account existence; rate limiting on registration,
resends and messaging.

## Running locally

```bash
npm install
npm run dev        # start dev server
npm run build      # production build → dist/
npm run typecheck  # strict TS check
```

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
