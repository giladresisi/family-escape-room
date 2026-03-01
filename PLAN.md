# Family Escape Room — Full Implementation Plan

## Overview

A mobile-first web app where a signed-in host creates a themed escape room match, shares a link via WhatsApp, and a group of players collaboratively solves a set of riddles organized into linear chambers. Riddles are either pre-built or AI-generated (via Claude) based on a theme. A live shared timer, real-time collaborative notes per riddle, and a lobby system round out the experience.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Firebase Auth (Google Sign-In) |
| Database / Real-time | Firestore (real-time listeners) |
| AI Generation | Anthropic Claude API (claude-haiku-4-5 for cost, claude-sonnet-4-6 for quality) |
| Deployment | Vercel |
| Link sharing | Native Web Share API (WhatsApp deep link fallback) |

---

## Data Models (Firestore)

### `matches/{matchId}`
```
{
  id: string,
  hostUid: string,
  hostName: string,
  theme: string,             // e.g. "Pirates", "Space Station", or custom text
  themeType: "predefined" | "custom",
  status: "lobby" | "active" | "completed",
  createdAt: Timestamp,
  startedAt: Timestamp | null,
  completedAt: Timestamp | null,
  currentChamberIndex: number,   // 0-based, shared for all players
  totalChambers: number,
}
```

### `matches/{matchId}/players/{playerId}`
```
{
  id: string,               // random UUID generated on join
  nickname: string,
  joinedAt: Timestamp,
  isHost: boolean,
}
```

### `matches/{matchId}/chambers/{chamberId}`
```
{
  index: number,            // 0-based order
  title: string,            // e.g. "The Dungeon", "The Library"
  description: string,      // flavour text / narrative intro
  isUnlocked: boolean,      // true when previous chamber is fully solved
}
```

### `matches/{matchId}/riddles/{riddleId}`
```
{
  id: string,
  chamberIndex: number,     // which chamber this riddle belongs to
  order: number,            // display order within chamber
  question: string,         // the riddle text
  hint: string | null,      // optional hint (AI-generated)
  answer: string,           // normalized lowercase trimmed correct answer
  status: "locked" | "open" | "solved",
  solvedAt: Timestamp | null,
  solvedBy: string | null,  // player nickname
  solutionReveal: string,   // explanation shown after solving
}
```

### `matches/{matchId}/notes/{riddleId}`
```
{
  riddleId: string,
  content: string,          // shared collaborative text (last-write-wins)
  lastEditedBy: string,     // player nickname
  lastEditedAt: Timestamp,
}
```

---

## Predefined Themes & Riddle Sets (3 themes, ~8 riddles each, 2 chambers each)

### Theme 1 — "The Haunted Mansion"
- Chamber 1 "The Foyer" (4 riddles): atmospheric riddles solvable independently with general knowledge
- Chamber 2 "The Secret Study" (4 riddles): answers depend on clues embedded in Chamber 1 solution reveals

### Theme 2 — "Lost in Space"
- Chamber 1 "The Cargo Bay" (4 riddles): science/space knowledge riddles
- Chamber 2 "The Control Room" (4 riddles): use codes discovered from Chamber 1 solutions to decode answers

### Theme 3 — "Pirate's Cove"
- Chamber 1 "The Beach" (4 riddles): map reading, nautical riddles
- Chamber 2 "The Captain's Quarters" (4 riddles): treasure coordinates derived from Chamber 1 answers

Each predefined theme ships with a fully authored riddle set (questions, answers, hints, solution reveals) stored as seed data / constants in the codebase.

---

## AI Generation (Claude API)

When the host selects "Generate new riddles" (for a predefined theme) or enters a custom theme, the app calls the Claude API with a structured prompt:

**Prompt template:**
```
You are a game designer creating a family-friendly escape room.
Theme: {theme}
Number of chambers: 2
Riddles per chamber: 4
Family audience (ages 8–60).

Requirements:
- Chamber 1 riddles must be solvable with general knowledge alone.
- Chamber 2 riddles must be designed so that their answers cannot be determined
  without information embedded in the Chamber 1 solution reveals.
  Do NOT state this dependency explicitly in the riddle text.
- Each riddle must have: question, answer (single word or short phrase),
  hint, solutionReveal (1-2 sentences explaining the answer and any info
  needed for future riddles), chamberTitle, chamberDescription.

Respond with a valid JSON object matching this schema:
{
  "chambers": [
    {
      "index": 0,
      "title": string,
      "description": string,
      "riddles": [
        {
          "order": number,
          "question": string,
          "answer": string,
          "hint": string,
          "solutionReveal": string
        }
      ]
    }
  ]
}
```

Generation happens server-side in a Next.js Route Handler (`/api/generate-riddles`) to keep the API key secret.

---

## Application Routes

```
/                          → Landing page (sign in to create, or enter match code)
/create                    → (auth required) Theme selection + riddle preview/generate
/match/[matchId]/lobby     → Lobby: host sees joined players, share link, Start button
/match/[matchId]/game      → Main game view (players + host)
/match/[matchId]/join      → Nickname entry page (no auth required)
/match/[matchId]/victory   → Victory screen with total time
```

---

## Page-by-Page Specification

### `/` — Landing Page
- Hero section with app name and tagline
- Two CTAs:
  - **"Create a Match"** → triggers Google Sign-In if not signed in, then redirects to `/create`
  - **"Join a Match"** → text input for match code/link, then redirects to `/match/[id]/join`
- Mobile-optimised, minimal chrome

---

### `/create` — Match Creation (host only, auth required)

**Step 1 — Theme Selection:**
- Grid of 3 predefined theme cards (image/icon, title, short description)
- "+ Custom Theme" card that shows a text input for the theme idea
- Each predefined theme card has two sub-options:
  - Use pre-built riddles
  - Generate new riddles with AI (shows loading spinner during generation)

**Step 2 — Riddle Preview:**
- Accordion list of chambers and riddles (read-only preview)
- Answers are hidden but host can reveal them via toggle
- "Looks good — Create Match" button
- "Regenerate" button (only for AI-generated sets)

On creation: write the match doc + chambers + riddles to Firestore, then redirect to `/match/[matchId]/lobby`.

---

### `/match/[matchId]/join` — Nickname Entry (no auth)

- Shows theme name and host name
- "This match hasn't started yet" message (if status === "lobby")
- "This match is already in progress — you can't join now" (if status === "active" or "completed")
- Nickname text input + "Join" button
- On join: write a player doc to Firestore, store `playerId` in `localStorage`, redirect to `/match/[matchId]/game`

---

### `/match/[matchId]/lobby` — Pre-game Lobby

**Host view:**
- Match title / theme
- Shareable link with "Copy" and "Share via WhatsApp" buttons
  - WhatsApp link: `https://wa.me/?text=Join our escape room! {url}`
- Real-time list of joined players (Firestore listener on `players` sub-collection)
- "Start Game" button (enabled when ≥ 1 player has joined)
- Timer not yet running

**Player view (if they somehow land here):**
- "Waiting for the host to start the game…" with player list

On Start: update match `status` to `"active"`, set `startedAt` to `serverTimestamp()`, set chamber 0 as unlocked.

---

### `/match/[matchId]/game` — Main Game View

#### Global Header (always visible)
- App name + theme
- Live timer: counts up from 0, derived from `startedAt`. All players see the same time via client-side calculation (`Date.now() - startedAt.toMillis()`).
- Player count badge

#### Chamber Display
- Current chamber title and description shown prominently
- Progress indicator: "Chamber 1 of 2"
- When all riddles in current chamber are solved: animated "Chamber Complete!" banner → next chamber unlocks with a brief transition

#### Riddle Cards (within active chamber)
Each riddle card contains:
- Riddle number and question text
- Status badge: Open / Solved
- If solved: solution reveal text + "Solved by {nickname}" label
- **Answer submission form** (only if status === "open"):
  - Text input: "Enter your answer…"
  - Submit button
  - On submit: normalize input (lowercase, trim), compare to `riddle.answer`
  - If correct: update riddle `status` to `"solved"`, set `solvedAt` and `solvedBy`, check chamber completion
  - If incorrect: shake animation + "Not quite, try again" message (no penalty)
- **Shared Notes section** (always visible):
  - Label: "Group Notes"
  - Textarea with real-time sync (Firestore listener on `notes/{riddleId}`)
  - Debounced writes (500ms after last keystroke) to avoid write storms
  - Shows "Last edited by {nickname}" below the textarea

#### Locked Chamber (next chamber, not yet unlocked)
- Shown as a grayed-out card: "Chamber 2 — The Secret Study 🔒 — Complete Chamber 1 to unlock"

---

### `/match/[matchId]/victory` — Victory Screen

- "You escaped! 🎉" heading
- Total time displayed prominently (formatted as HH:MM:SS)
- List of all solved riddles with their solutions
- "Play Again" button (creates a new match with same theme)
- Share button (share victory message to WhatsApp)

**Trigger:** When the last riddle of the last chamber is solved, update match `status` to `"completed"`, set `completedAt`. All clients listening to the match doc redirect to `/victory`.

---

## Real-time Strategy (Firestore Listeners)

| Data | Listener location | Update frequency |
|---|---|---|
| Match status (lobby→active→completed) | `/match/[matchId]/game` layout | Instant — triggers redirects |
| Player list | Lobby page | Instant |
| Riddle status (open/solved) | Game page | Instant |
| Notes content | Per-riddle notes section | Debounced write, instant read |
| Chamber unlock status | Game page | Instant |

All listeners are set up with `onSnapshot` and cleaned up on component unmount.

---

## Answer Validation Logic

```ts
function checkAnswer(submitted: string, correct: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return normalize(submitted) === normalize(correct);
}
```

Validation happens **client-side** for instant feedback, then the Firestore write is the source of truth. A Firestore Security Rule prevents directly writing `status: "solved"` unless the submitted answer matches — enforced via a Cloud Function or trusted client write with rule validation. (See Security section.)

---

## Firebase Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Matches: anyone can read, only auth users can create
    match /matches/{matchId} {
      allow read: if true;
      allow create: if request.auth != null;
      // Only host can update match status
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.hostUid;

      // Players sub-collection: anyone can create (join), anyone can read
      match /players/{playerId} {
        allow read: if true;
        allow create: if true;
        allow update, delete: if false;
      }

      // Riddles: anyone can read, no direct client writes to status
      // Status updates go through a server action
      match /riddles/{riddleId} {
        allow read: if true;
        allow write: if false; // only via server-side Next.js route
      }

      // Notes: anyone can read/write
      match /notes/{noteId} {
        allow read, write: if true;
      }

      // Chambers: anyone can read, only via server action for unlock
      match /chambers/{chamberId} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
}
```

Riddle solve and chamber unlock actions go through a Next.js **Server Action** or **Route Handler** (`/api/solve-riddle`) that validates the answer server-side and performs the Firestore writes using the Firebase Admin SDK.

---

## Server-Side Route Handlers

### `POST /api/generate-riddles`
- Auth: verifies Firebase ID token in Authorization header
- Body: `{ theme: string, themeType: "predefined" | "custom" }`
- Calls Claude API, parses JSON response, returns riddle set

### `POST /api/solve-riddle`
- Auth: public (validated by playerId in localStorage matching a player doc)
- Body: `{ matchId, riddleId, answer, playerNickname }`
- Validates answer server-side
- If correct: updates riddle status, checks if chamber is complete, unlocks next chamber if so, checks if match is complete

### `POST /api/start-match`
- Auth: verifies Firebase ID token (host only)
- Body: `{ matchId }`
- Sets `status: "active"`, `startedAt: serverTimestamp()`, unlocks chamber 0

---

## Component Tree

```
app/
├── layout.tsx                    # Root layout, FirebaseProvider, global font
├── page.tsx                      # Landing page
├── create/
│   └── page.tsx                  # Theme selection + riddle preview (auth-gated)
├── match/
│   └── [matchId]/
│       ├── layout.tsx            # Match layout: fetches match doc, provides context
│       ├── join/
│       │   └── page.tsx          # Nickname entry
│       ├── lobby/
│       │   └── page.tsx          # Lobby screen
│       ├── game/
│       │   ├── page.tsx          # Game orchestrator
│       │   ├── Timer.tsx         # Live count-up timer
│       │   ├── ChamberView.tsx   # Chamber + riddle list
│       │   ├── RiddleCard.tsx    # Single riddle card
│       │   ├── AnswerForm.tsx    # Answer input + submit
│       │   └── SharedNotes.tsx   # Collaborative textarea
│       └── victory/
│           └── page.tsx          # Victory screen
└── api/
    ├── generate-riddles/route.ts
    ├── solve-riddle/route.ts
    └── start-match/route.ts

lib/
├── firebase.ts                   # Firebase client init
├── firebase-admin.ts             # Firebase Admin SDK init
├── firestore.ts                  # Typed Firestore helpers
├── claude.ts                     # Anthropic client wrapper
└── riddles/
    ├── haunted-mansion.ts        # Pre-built riddle set
    ├── lost-in-space.ts
    └── pirates-cove.ts

hooks/
├── useMatch.ts                   # Real-time match doc listener
├── useRiddles.ts                 # Real-time riddles listener
├── usePlayers.ts                 # Real-time players listener
├── useNotes.ts                   # Real-time notes listener
└── useTimer.ts                   # Client-side timer derived from startedAt
```

---

## Environment Variables

```env
# Firebase (public — client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Anthropic
ANTHROPIC_API_KEY=
```

---

## UI / UX Design Principles

- **Mobile-first:** All layouts designed for 375px width first, responsive up
- **WhatsApp-friendly links:** Short, readable URLs; match ID is a 6-character uppercase code (e.g. `XK7P2R`) for easy manual entry too
- **Escape room atmosphere:** Dark theme with amber/gold accents, subtle stone-texture backgrounds, typewriter font for riddle text
- **Accessibility:** Sufficient color contrast on dark bg, large tap targets (≥ 44px), readable font sizes (≥ 16px on mobile)
- **Optimistic UI:** Answer submission shows immediate feedback before server confirms
- **Loading states:** Skeleton screens for initial data load; spinner for AI generation (with "Generating your escape room…" copy)

---

## Implementation Phases

### Phase 1 — Foundation
1. Initialize Next.js 14 project with Tailwind CSS
2. Set up Firebase project (Auth, Firestore) and Vercel project
3. Implement Firebase client + admin SDK wrappers
4. Implement Google Sign-In flow
5. Build Landing page `/`

### Phase 2 — Match Creation
6. Build `/create` page — theme selection UI
7. Add predefined riddle sets (3 themes × 8 riddles as static data)
8. Implement `/api/generate-riddles` route with Claude integration
9. Build riddle preview accordion
10. Implement match + chambers + riddles Firestore writes on creation

### Phase 3 — Lobby & Joining
11. Build `/match/[matchId]/lobby` with real-time player list
12. Build `/match/[matchId]/join` with nickname entry + redirect logic
13. Implement join rejection logic (status !== "lobby")
14. Implement `/api/start-match` route
15. WhatsApp share button with match link

### Phase 4 — Core Game
16. Build game layout with live timer (`useTimer` hook)
17. Build `ChamberView` + `RiddleCard` components
18. Implement `AnswerForm` with client-side optimistic feedback
19. Implement `/api/solve-riddle` route (answer validation + chamber unlock logic)
20. Implement `SharedNotes` with debounced Firestore writes + real-time reads

### Phase 5 — Victory & Polish
21. Build victory screen with time display
22. Implement match completion detection (redirect all clients)
23. Add animations (chamber unlock transition, confetti on victory)
24. Mobile polish pass (tap targets, font sizes, scroll behavior)
25. Dark theme + escape room atmosphere styling

### Phase 6 — Security & Deployment
26. Write and deploy Firestore Security Rules
27. Configure Vercel environment variables
28. Deploy to Vercel, connect custom domain if available
29. End-to-end test full flow on mobile

---

## Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| Firestore real-time listeners (not polling) | Instant updates for notes, riddle solves, and chamber unlocks are core to the co-op feel |
| Answer validation via server route | Prevents cheating by inspecting client-side JS; keeps answers off the client bundle |
| 6-char match code as ID | Human-readable for WhatsApp messages; also usable for manual entry on landing page |
| Last-write-wins for shared notes | Simpler than CRDT for family use case; occasional overwrite is acceptable |
| localStorage for player session | Avoids requiring auth for joining players; persists across page reloads within the session |
| Debounced notes writes (500ms) | Balances real-time feel with Firestore write cost / rate limits |
| claude-haiku for generation | Fast and cheap; suitable for structured JSON output; fallback to sonnet if haiku fails |
