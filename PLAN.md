# Family Escape Room - Implementation Plan

## Context

Build a multiplayer family escape room webapp from scratch. Groups solve riddles together in real-time, with riddle dependencies creating an "unlock chambers" mechanic. The match creator signs in with Google, shares a link via WhatsApp, and others join anonymously. A live timer tracks the team's progress.

**Tech stack**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4) + Supabase (Auth, PostgreSQL, Realtime) + Anthropic Claude API (AI riddle generation)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  Landing ─► Create (auth) ─► Lobby ─► Game ─► Finished  │
│  Join (anonymous) ─────────────┘                         │
│                                                          │
│  Real-time: Supabase Realtime (Postgres Changes)         │
│  Timer: Client-side interval from match.started_at       │
│  Notes: Debounced upsert (300ms)                         │
└──────────────────────────┬──────────────────────────────┘
                           │ API Routes
┌──────────────────────────┴──────────────────────────────┐
│                    Supabase Backend                       │
│  Auth: Google OAuth (creators only)                      │
│  DB: PostgreSQL with RLS                                 │
│  Realtime: Published tables (matches, match_riddles,     │
│            players, player_notes)                         │
│  AI: Anthropic Claude API for custom theme generation    │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables

- **`riddle_themes`** — Pre-built + AI-generated theme catalog
  - `id` UUID PK, `name` TEXT, `description` TEXT, `image_url` TEXT, `is_ai` BOOLEAN, `created_at`

- **`matches`** — Game instances
  - `id` UUID PK, `code` TEXT UNIQUE (6-char shareable code), `creator_id` UUID (refs auth.users), `theme_id` UUID FK, `status` ENUM('waiting','playing','finished'), `started_at`, `finished_at`, `created_at`

- **`players`** — Both authenticated creators and anonymous joiners
  - `id` UUID PK, `match_id` UUID FK, `user_id` UUID (NULL for anonymous), `display_name` TEXT, `is_creator` BOOLEAN, `joined_at`, UNIQUE(match_id, display_name)

- **`riddles`** — Template riddles per theme (reusable across matches)
  - `id` UUID PK, `theme_id` UUID FK, `title` TEXT, `body` TEXT, `hint` TEXT, `answer` TEXT, `sort_order` INT, `depends_on_id` UUID self-ref FK (NULL = visible from start), `flavor_text` TEXT, `is_final` BOOLEAN, `created_at`

- **`match_riddles`** — Instantiated riddles for a specific match
  - `id` UUID PK, `match_id` UUID FK, `riddle_id` UUID FK, `is_visible` BOOLEAN, `is_solved` BOOLEAN, `solved_by` UUID FK players, `solved_at`, UNIQUE(match_id, riddle_id)

- **`player_notes`** — Per-riddle per-player collaborative notes
  - `id` UUID PK, `match_riddle_id` UUID FK, `player_id` UUID FK, `content` TEXT, `updated_at`, UNIQUE(match_riddle_id, player_id)

### Riddle Dependency Tree (Haunted House Example)

```
[The Dusty Mirror] ──► [The Enchanted Library] ──► [The Cellar Riddle] ──► [The Final Door] ★
[The Grandfather Clock] ──► [The Secret Study]
```

★ = is_final (solving this ends the game)

### Pre-built Themes

1. **The Haunted House** — Explore a creepy mansion (mirror → library → cellar → exit)
2. **Space Station Omega** — Rogue AI on a space station (bridge → navigation, engine → comms → life support → escape pod)
3. **Mystery Mansion: The Missing Diamond** — 1920s detective whodunit (dining room → butler's pantry, drawing room → basement → gallery → accusation)

---

## Application Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Page | Public | Landing page with Create/Join CTAs |
| `/auth/login` | Page | Public | Google Sign-In page |
| `/auth/callback` | API | Public | OAuth callback handler |
| `/create` | Page | **Protected** | Theme picker + AI generation |
| `/join/[code]` | Page | Public | Enter display name to join |
| `/match/[matchId]` | Page | Public | Lobby → Game → Finished |
| `/api/themes` | API | Public | GET: list available themes |
| `/api/matches` | API | Auth | POST: create a new match |
| `/api/matches/[matchId]/join` | API | Public | POST: join a match |
| `/api/matches/[matchId]/start` | API | Auth | POST: start the game |
| `/api/matches/[matchId]/solve` | API | Public | POST: submit riddle answer |
| `/api/riddles/generate` | API | Auth | POST: AI-generate a theme |

---

## Key Implementation Details

### Auth Flow
- Google OAuth via Supabase Auth; middleware protects only `/create`
- `/join/[code]` and `/match/[matchId]` are public (anonymous players)
- Anonymous players identified by `playerId` stored in localStorage

### Match Creation Flow
1. Authenticated user picks a theme (or generates custom via AI)
2. `POST /api/matches` → generates 6-char code (nanoid), inserts match + creator as player + copies riddles into `match_riddles` (visible where `depends_on_id IS NULL`)
3. Redirects to `/match/[matchId]` in lobby state

### Join Flow
1. User clicks WhatsApp link → `/join/[code]`
2. Page shows theme name; user enters display name
3. `POST /api/matches/[matchId]/join` → returns 403 if match already started
4. Creates player row, redirects to `/match/[matchId]`

### Game Mechanics — Solve Route
1. Compare `answer.trim().toLowerCase()` to `riddle.answer.trim().toLowerCase()`
2. If correct: mark solved, unlock dependent riddles, check if final
3. All DB changes automatically broadcast via Supabase Realtime

### Real-Time Strategy
- Separate Supabase channels per match for: match status, players, riddles, notes
- Player notes debounced at 300ms before DB upsert
- Riddle details re-fetched when visibility changes (new riddles unlocked)

### WhatsApp Sharing
```
https://wa.me/?text=Join+my+Family+Escape+Room!+🔐+{joinUrl}
```

### Timer
- `useTimer(startedAt, finishedAt)` hook: ticks every second via `setInterval`
- Rendered sticky at top of match layout
- Shows final time on game completion screen

### AI Riddle Generation
- Uses Anthropic Claude API (claude-sonnet-4-20250514)
- Generates 6 riddles with dependency tree, hints, answers, flavor text
- Returns JSON parsed into theme + riddles → inserted into DB

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- Google OAuth configured in Supabase Auth settings
- Anthropic API key (for AI riddle generation)

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Run the SQL migrations in your Supabase SQL editor:
1. `supabase/migrations/00001_initial_schema.sql` — Creates all tables, RLS policies, and Realtime publication
2. `supabase/migrations/00002_seed_themes.sql` — Inserts 3 pre-built themes with 18 riddles

### Run Development Server

```bash
npm install
npm run dev
```

---

## Verification Checklist

1. **Auth**: Sign in with Google → redirected to `/create`; unauthenticated users hitting `/create` redirected to login
2. **Create match**: Pick theme → match created → redirected to lobby with shareable link
3. **Join**: Open join link in incognito → enter name → appear in lobby; try joining after start → rejected
4. **Real-time lobby**: Second browser shows new player instantly
5. **Start game**: Creator starts → both browsers transition to game board, timer starts
6. **Riddle solving**: Submit correct answer → riddle marked solved for all; dependent riddles appear
7. **Player notes**: Type in one browser → appears in other browser in real-time
8. **Win**: Solve final riddle → timer stops, finished screen shows total time
9. **WhatsApp**: Share button opens WhatsApp with correct join link
10. **AI generation**: Enter custom theme prompt → theme generated → playable match
