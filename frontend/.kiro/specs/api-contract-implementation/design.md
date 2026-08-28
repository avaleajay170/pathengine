# Design Document

## Overview

Three targeted fixes to align the frontend hooks with `claude/specs/03-api-contract.md`. No new dependencies. All changes follow the existing pattern: check `isApiEnabled`, call `api.*`, fall back to mock on `status === 0` or when API is disabled.

## Architecture

No structural changes. The existing layers remain:

```
components / routes
    ↓
hooks (use-enroll, use-generate-path, use-transcript)
    ↓
api-client (fetch wrapper + token)
    ↓
Backend  /  mock data (offline fallback)
```

## Changes

### 1. `src/hooks/use-enroll.ts` — fix endpoint

Current: `POST /api/v1/profile/enroll`  
Target:  `POST /api/v1/courses/:id/enroll`

The mutation argument changes from `courseId: string` to the same `courseId: string` but the URL is constructed with it as a path segment. The response type adds `courseId` to the returned object.

```ts
// before
api.post("/api/v1/profile/enroll", { courseId })

// after
api.post<{ enrolled: true; courseId: string }>(
  `/api/v1/courses/${encodeURIComponent(courseId)}/enroll`
)
```

### 2. `src/hooks/use-generate-path.ts` — fix request body

Current mutation argument: `{ profile: LearnerProfile }`  
Target mutation argument: `{ profileId: string; profile: LearnerProfile }`

The `profile` field is kept so offline fallback can call `generateLearningPath(profile)` without a separate fetch. Only `profileId` is sent to the API.

```ts
// before
api.post("/api/v1/paths/generate", { profile: request.profile })

// after
api.post<LearningPath>("/api/v1/paths/generate", { profileId: request.profileId })
```

### 3. `src/hooks/use-transcript.ts` — new file

Two exports:

**`useUploadTranscript()`** — mutation
- Builds a `FormData` with `file` field
- `POST /api/v1/profile/transcript` (multipart handled by `api-client` — it detects `FormData` and omits `Content-Type` so the browser sets it with the correct boundary)
- Returns `TranscriptUploadResponse`
- Offline: returns `{ uploadId: "mock-upload", status: "processing" }`

**`useTranscriptStatus(uploadId)`** — query
- `GET /api/v1/profile/transcript/:uploadId`
- `enabled`: only when `uploadId` is defined
- `refetchInterval`: `(query) => query.state.data?.status === "processing" ? 2000 : false`
- Returns `TranscriptStatusResponse`
- Offline: returns `{ uploadId, status: "completed", parsedCourses: [], parsedSkills: [] }`

## Correctness Properties

### P1 — Enroll endpoint path
For any non-empty `courseId`, the URL passed to `api.post` must be `/api/v1/courses/${courseId}/enroll` and must not contain `/profile/`.

**Validates: Requirement 1.1**

### P2 — Enroll offline no-op
When `isApiEnabled` is `false`, `enrollCourse` must resolve to `{ enrolled: true, courseId }` without calling any `api.*` method.

**Validates: Requirement 1.3, 5.1**

### P3 — Generate-path body shape
When `isApiEnabled` is `true`, the body sent to `/api/v1/paths/generate` must be `{ profileId }` and must not include a `profile` key.

**Validates: Requirement 2.1**

### P4 — Transcript polling stops
`refetchInterval` must return `false` when `status` is `"completed"` or `"failed"`, and `2000` when `status` is `"processing"`.

**Validates: Requirement 4.4, 4.5**

## Testing Strategy

- Unit tests using `vitest` — mock `api-client` module to assert correct URLs and request bodies without real network calls.
- Property-based tests using `fast-check` for P1 (arbitrary courseId strings) and P4 (all three status values).
