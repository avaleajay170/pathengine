# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

Two independent projects, no build tooling at the root:

- `Frontend/` — TanStack Start (SSR React 19) app. **This is where all working functionality lives.** It is fully self-contained and runs on mock data.
- `backend/` — FastAPI service. Every router and service is a **stub returning placeholder data**; nothing is wired to the frontend yet.

The frontend makes **zero HTTP calls to the backend** (no `fetch`, no `createServerFn` data loading). When adding real API integration, that boundary does not exist yet — you are creating it.

Naming is inconsistent across the repo and this is expected: the git repo is `pathengine`, the README calls it "Path Finder AI", the frontend brand is **"Lumina"** (`__root.tsx` meta, `lumina-learner` localStorage key), and the FastAPI app title is **"Trajectory"**. Match whichever layer you are editing rather than unifying.

## Commands

All frontend commands run from `Frontend/`:

```sh
npm run dev          # vite dev server (SSR)
npm run build        # vite build -> .output/ (nitro, cloudflare target)
npm run lint         # eslint (prettier runs as an eslint rule)
npm run format       # prettier --write .
npm run typecheck    # tsc --noEmit
npm run test         # vitest run
```

Single test file / single test:

```sh
npx vitest run src/lib/learning-path.test.ts
npx vitest run -t "locks prerequisites"
```

Backend, from `backend/`:

```sh
pip install -r requirements.txt
uvicorn app.main:app --reload      # /health, /docs
python test_connection.py          # ad-hoc MongoDB Atlas ping, reads MONGODB_URI from .env
```

Both `bun.lock` and `package-lock.json` are committed. `bunfig.toml` sets a 24h `minimumReleaseAge` supply-chain guard with a short allowlist — **confirm with the user before adding any package to `minimumReleaseAgeExcludes`**.

## Frontend architecture

### Mock data is the single source of truth

`src/data/mock.ts` (~1040 lines) holds every domain type and every fixture: `Course`, `PathNodeItem`, `Milestone`, `LearningPath`, `LearnerProfile`, plus the course catalog, three path templates (`ml-engineer`, `data-analyst`, `fullstack`), reviews, activity, testimonials and skill trends. Types are imported from here throughout the app, so this file is both the schema and the database. Adding a domain concept means editing `mock.ts` first.

### Derived state, not stored state

The core data flow is a three-layer pipeline that spans several files:

1. **`src/lib/learner-profile.tsx`** — `LearnerProfileProvider` owns the one piece of real mutable state: a `LearnerProfile` persisted to `localStorage` under `lumina-learner` (versioned `{version, data}` envelope, merged over `emptyLearnerProfile` on load so new fields are backfilled). Mutations are narrow, intent-named actions (`enrollCourse`, `completeNode`, `addToPath`, `submitNodeFeedback`), not a generic setter.
2. **`src/lib/learning-path.ts`** — `generateLearningPath(profile)` recomputes the entire roadmap from the profile on every render. It picks a template by role, walks each node's `requires` through `findPrerequisiteCourse`, and **derives** node status (`locked` / `available` / `in-progress` / `completed`) from `completedCourses` / `enrolledCourses`. `profile.nodeStatuses` is only an override layer. Progress %, remaining hours, week count and ETA are all computed here from `hoursPerWeek`.
3. **Routes** call `generateLearningPath` directly and render. There is no cache or store between them.

Consequence: to change what the roadmap shows, change the profile or the derivation — **do not write status back into the path object**.

### Provider order matters

`src/routes/__root.tsx` nests `QueryClientProvider` → `LearnerProfileProvider` → `AssistantProvider`. `AssistantProvider` calls `useLearnerProfile()`, so it must stay inside. The root also mounts the always-present `<Navbar />`, `<ChatWidget />` and `<Toaster />`, and must keep `<Outlet />`.

### The AI assistant is keyword-matched mock text

`src/lib/assistant.tsx` fakes every "AI" moment: `mockReply()` matches substrings in the user's message and returns hand-written, learner-specific prose (with an optional `courseId` or `milestone` for inline rich cards), behind a 1100 ms `thinking` delay guarded by a `requestId` ref. `explain({title, reason, courseId})` is the shared entry point for every "Why this?" button in the app — it opens the panel, injects a synthetic user question and responds referencing the profile's `targetRole` / `timeframe` / completed count.

Keep mock AI copy **specific and believable** (reference the learner's goal, measured gaps, hours/week, real course names). Generic placeholder text is a regression here — it is the product's main illusion.

### Routing

File-based TanStack Start routing in `src/routes/`. `src/routes/README.md` documents the conventions; read it before adding routes. Key points: `__root.tsx` is the *only* layout, dynamic segments use a bare `$` (`course.$id.tsx`), and `src/routeTree.gen.ts` is generated — never hand-edit. Do not introduce `src/pages/` or `app/layout.tsx` (Next.js/Remix conventions). Each route sets its own `head()` meta.

### Build config and SSR entries

`vite.config.ts` wraps `@lovable.dev/vite-tanstack-config`, which **already includes** tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (Cloudflare target), devtools, `@` alias, React dedupe and env injection. Adding any of those manually breaks the app with duplicate plugins.

- `src/server.ts` — SSR fetch wrapper. Exists because h3 swallows in-handler throws into a JSON 500 (`{"unhandled":true,"message":"HTTPError"}`) that `try/catch` never sees; it detects that body shape and renders a real HTML error page.
- `src/start.ts` — defining this file opts *out* of Start's automatic CSRF middleware, so it re-adds `createCsrfMiddleware` explicitly alongside an error middleware. Don't delete the CSRF middleware.

### Styling

Tailwind v4 with CSS-first config in `src/styles.css`. All colors are `oklch` custom properties — **never hardcode colors in components**; use the token utilities. Beyond the shadcn defaults there are semantic tokens worth knowing: `--color-ai` / `--color-ai-soft` are reserved for AI/assistant surfaces (violet, to visually separate AI moments from static content), plus `success`, `warning`, `primary-soft`, and `--shadow-soft` / `--shadow-lift`. shadcn/ui ("new-york", 46 components) lives in `src/components/ui/`; app components (`CourseCard`, `PathNode`, `SkillChart`, `MilestoneTracker`, `ChatWidget`, …) sit directly in `src/components/`.

### TypeScript strictness

`tsconfig.json` enables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`. This is why the code spreads conditionally (`...(courseId !== undefined && { courseId })`) instead of passing `undefined`, and guards array indexing. Follow those patterns — `npm run typecheck` will reject the looser form.

## Backend architecture

`app/main.py` mounts four routers under `/learner`, `/recommend`, `/roadmap`, `/feedback` plus `/health`, with CORS wide open (marked to tighten before submission). All handlers take/return bare `dict`; `app/models/__init__.py` is empty, so there are no Pydantic schemas yet.

`app/services/` encodes the intended pipeline, and each module's docstring states a **deliberate architectural constraint** — preserve these when implementing:

- `llm.py` — LLM is used **only** for NLU/goal extraction and natural-language explanations, *never* for ranking or planning.
- `skill_gap.py` — deterministic gap math only, no LLM calls. Implemented.
- `ranking.py` — weighted linear scoring over candidate features; `DEFAULT_WEIGHTS` are explicitly "tunable heuristics, not claims of optimality". Implemented.
- `retrieval.py` — hybrid dense (pgvector) + keyword + metadata-filter search. Stub.
- `planner.py` — orders ranked candidates by prerequisite DAG and fits a weekly hour budget; also handles `replan`. Stub.

### Two known inconsistencies in the backend

Resolve these with the user rather than guessing:

1. **Datastore is contradictory.** `requirements.txt` (motor/pymongo), `app/db.py` (`AsyncIOMotorClient`) and `app/config.py` (`mongodb_uri`) say MongoDB; `.env.example` (`DATABASE_URL=postgresql://…` Supabase) and `retrieval.py`'s pgvector docstring say Postgres. `.env.example` also does not define the `MONGODB_URI` / `MONGODB_DB_NAME` that `config.py` and `test_connection.py` actually read.
2. **`app/config.py` will fail on import.** It does `from pydantic import BaseSettings`, which raises under Pydantic v2 (2.13 is installed); the correct import is `from pydantic_settings import BaseSettings` — `pydantic-settings` is already a dependency. The bug is latent only because nothing in `main.py`'s import chain touches `config.py` or `db.py` yet, so the server still starts.

## Lovable sync constraint

`Frontend/AGENTS.md`: the frontend is connected to [Lovable](https://lovable.dev). **Never rewrite published git history** — no force pushing, rebasing, amending or squashing commits that are already pushed, as that rewrites history on Lovable's side and the user can lose project history. Commits pushed to the connected branch sync back into the Lovable editor, so keep `main` in a working state.
