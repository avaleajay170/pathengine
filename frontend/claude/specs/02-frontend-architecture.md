# Frontend Architecture Specification

## Current Architecture

The existing codebase uses:
- TanStack Router (file-based routing, 9 routes + root)
- TanStack Query (QueryClient initialized in `router.tsx` but **no `useQuery`/`useMutation` calls exist** — all data is synchronous from `mock.ts`)
- React Context for state: `LearnerProfileProvider` (localStorage) and `AssistantProvider` (in-memory)
- Direct imports from `src/data/mock.ts` throughout routes and components
- Pure business logic in `src/lib/learning-path.ts`

## Critical Constraint

**DO NOT** replace TanStack Router, React, Tailwind, Radix, or the existing component architecture. The goal is the minimum architecture extension needed to support backend integration.

## Architecture Changes Required

### 1. API Client Layer

**Why**: Currently all data comes from synchronous mock imports. Backend integration requires async HTTP calls. A centralized API client prevents `fetch()` scattered across components.

**What to create**: `src/lib/api-client.ts`

A thin typed wrapper around `fetch` that:
- Uses a configurable base URL (environment variable)
- Handles JSON serialization/deserialization
- Attaches auth headers when available
- Provides typed request/response contracts
- Handles common error codes (401, 403, 404, 500)
- Returns typed error objects that components can inspect

```typescript
// Conceptual shape — not implementation
export const api = {
  get: <T>(path: string, options?: RequestOptions) => Promise<ApiResult<T>>,
  post: <T>(path: string, body: unknown, options?: RequestOptions) => Promise<ApiResult<T>>,
  put: <T>(path: string, body: unknown, options?: RequestOptions) => Promise<ApiResult<T>>,
  delete: <T>(path: string, options?: RequestOptions) => Promise<ApiResult<T>>,
};

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
type ApiError = { status: number; message: string; code?: string };
```

### 2. Repository / Data Access Layer

**Why**: Routes and components currently import directly from `mock.ts` (e.g., `import { courses, getCourse } from "@/data/mock"`). To transition to backend data without rewriting every import, introduce a repository layer that abstracts the data source.

**What to create**: `src/lib/repositories/` directory

Each repository module exports functions with the same return types as the current mock accessors, but wraps them in async interfaces that can switch between mock and API:

```typescript
// src/lib/repositories/courses.ts
import { type Course } from "@/data/mock";

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters), // calls API or falls back to mock
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourse(id),
  });
}
```

Repositories to create:
- `src/lib/repositories/courses.ts` — replaces direct `courses`, `getCourse()`, `getReviews()`, `findCourseInPaths()` imports
- `src/lib/repositories/paths.ts` — replaces `learningPaths`, `getPath()`, `generateLearningPath()` imports
- `src/lib/repositories/profile.ts` — extends `LearnerProfileProvider` with backend sync
- `src/lib/repositories/assistant.ts` — extends `AssistantProvider` with backend LLM calls
- `src/lib/repositories/feedback.ts` — new: submits feedback and receives updated paths

**Migration strategy**: Each repository should have a `USE_API` flag (or environment variable check) that determines whether to call the real API or fall back to the existing mock data. This allows incremental backend adoption without breaking the UI.

```typescript
const USE_API = Boolean(import.meta.env.VITE_API_BASE_URL);

async function fetchCourses(filters?: CourseFilters): Promise<Course[]> {
  if (!USE_API) {
    // Fall back to existing mock data
    return filterMockCourses(filters);
  }
  const result = await api.get<Course[]>("/courses", { params: filters });
  if (!result.ok) throw new ApiError(result.error);
  return result.data;
}
```

### 3. TanStack Query Integration

**Why**: `@tanstack/react-query` is already installed and `QueryClient` is already initialized in `router.tsx`, but zero `useQuery`/`useMutation` calls exist. This is the natural async data management layer.

**What to use**:
- `useQuery` for all read operations (courses, paths, profile, reviews)
- `useMutation` for all write operations (submit feedback, update profile, enroll, complete node, send assistant message)
- Query invalidation for cache freshness after mutations
- `suspense: false` (do not add React Suspense boundaries — use loading states in components)

**Query key conventions**:
```typescript
["courses"]                    // all courses
["courses", { filters }]       // filtered courses
["course", courseId]            // single course
["course", courseId, "reviews"] // course reviews
["paths"]                      // all paths
["path", pathId]               // single path (generated)
["profile"]                    // learner profile
["profile", "activity"]        // activity feed
["profile", "skill-history"]   // skill trend data
["assistant", "messages"]      // message history (if backend persists)
```

### 4. DTO Types and Adapters

**Why**: Backend API responses may not match the exact shape of the current mock data types (`Course`, `LearningPath`, `PathNodeItem`, etc.). Adapter functions prevent UI breakage when backend schemas differ.

**What to create**: `src/lib/types/api.ts`

Define backend DTO interfaces alongside adapter functions:

```typescript
// Backend sends this
export interface CourseDTO {
  id: string;
  title: string;
  // ... backend-specific fields
}

// Frontend expects this (existing type from mock.ts)
import { type Course } from "@/data/mock";

// Adapter
export function adaptCourse(dto: CourseDTO): Course {
  return {
    id: dto.id,
    title: dto.title,
    // ... map fields
  };
}
```

**Important**: Do NOT preemptively define all DTO types. Define them as the backend API is built. Start with the types that the frontend currently uses from `mock.ts` as the target shape, and adapt backend responses to match.

### 5. Environment Configuration

**What to add**: Environment variable for API base URL

```env
# .env.local (not committed)
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_API_BASE_URL=https://api.lumina.dev
```

The API client reads `import.meta.env.VITE_API_BASE_URL`. When unset, repositories fall back to mock data.

### 6. Error Boundary Enhancement

**Current state**: Root `__root.tsx` has `ErrorComponent` that catches rendering errors and provides "Try again" + "Go home" buttons.

**What to add**: The existing error boundary is sufficient for rendering errors. For API errors, handle them at the component level using TanStack Query's `isError`/`error` states rather than adding more error boundaries.

## What NOT to Change

1. **Do NOT add a global state manager** (Redux, Zustand, Jotai). The existing Context providers are sufficient.
2. **Do NOT replace localStorage persistence**. Keep it as the offline fallback. Add backend sync alongside it.
3. **Do NOT restructure the route files**. Keep the current flat file-based routing.
4. **Do NOT move component files** into feature folders. Keep the current flat `src/components/` structure.
5. **Do NOT add React Suspense boundaries**. Use TanStack Query loading states in components.
6. **Do NOT add a service worker or offline-first architecture**. This is not a PWA requirement.
7. **Do NOT introduce GraphQL**. REST is sufficient for this application's data needs.

## File Structure After Changes

```
src/
├── components/         # EXISTING — no structural changes
│   ├── Chat.tsx
│   ├── ChatWidget.tsx
│   ├── CourseCard.tsx
│   ├── Footer.tsx
│   ├── MilestoneTracker.tsx
│   ├── Navbar.tsx
│   ├── PathNode.tsx
│   ├── SkillChart.tsx
│   └── ui/             # 46 shadcn/ui primitives — untouched
├── data/
│   └── mock.ts          # EXISTING — kept as fallback data source
├── hooks/
│   ├── use-mobile.tsx   # EXISTING
│   ├── use-courses.ts   # NEW — TanStack Query hook for courses
│   ├── use-path.ts      # NEW — TanStack Query hook for learning paths
│   ├── use-feedback.ts  # NEW — TanStack Query mutation hook for feedback
│   └── use-activity.ts  # NEW — TanStack Query hook for activity feed
├── lib/
│   ├── api-client.ts    # NEW — typed fetch wrapper
│   ├── assistant.tsx    # EXISTING — extend with backend LLM integration
│   ├── error-capture.ts # EXISTING
│   ├── error-page.ts    # EXISTING
│   ├── learner-profile.tsx  # EXISTING — extend with backend sync
│   ├── learning-path.ts     # EXISTING — keep as client-side fallback
│   ├── learning-path.test.ts # EXISTING
│   ├── lovable-error-reporting.ts # EXISTING
│   ├── types/
│   │   └── api.ts       # NEW — backend DTO types and adapters (add as needed)
│   └── utils.ts         # EXISTING
├── routes/              # EXISTING — no structural changes, extend components within
└── styles.css           # EXISTING
```

## Migration Path

The transition from mock to backend should be **incremental and non-breaking**:

### Phase 1: Infrastructure (do first)
1. Create `api-client.ts`
2. Add `VITE_API_BASE_URL` env config
3. Create query hook files with mock fallback

### Phase 2: Read Operations (do second)
4. Replace direct mock imports in routes with query hooks
5. Add loading/error states to each route
6. Verify all routes still work with mock data (no API needed)

### Phase 3: Write Operations (do third)
7. Add mutation hooks for enrollment, completion, feedback
8. Connect `LearnerProfileProvider` to backend sync
9. Add optimistic updates where appropriate

### Phase 4: AI Integration (do last)
10. Connect `AssistantProvider` to backend LLM endpoint
11. Add streaming response support
12. Connect path generation to backend API
13. Connect adaptation/feedback to backend re-planning

## Provider Hierarchy (unchanged)

```
QueryClientProvider (existing)
  → LearnerProfileProvider (existing, extended with backend sync)
    → AssistantProvider (existing, extended with backend LLM)
      → Application Shell
```

No new providers are required.
