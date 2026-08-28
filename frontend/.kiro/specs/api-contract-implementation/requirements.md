# Requirements Document

## Introduction

This feature closes the remaining gaps between the frontend's React Query hooks and the API contract defined in `claude/specs/03-api-contract.md`. Three areas need attention: correcting the enroll endpoint URL, fixing the generate-path request body, and adding a new transcript upload/status hook. All hooks must continue to work offline (when `VITE_API_BASE_URL` is unset) by falling back to mock data or no-ops, matching the pattern already established in the codebase.

## Glossary

- **API_Client**: The `api` object exported from `src/lib/api-client.ts` — a typed fetch wrapper that adds the `Authorization` header and serializes JSON bodies.
- **isApiEnabled**: Boolean flag (`true` when `VITE_API_BASE_URL` is set) exported from `src/lib/api-client.ts`.
- **Enroll_Hook**: The `useEnroll` mutation hook in `src/hooks/use-enroll.ts`.
- **GeneratePath_Hook**: The `useGeneratePath` mutation hook in `src/hooks/use-generate-path.ts`.
- **Transcript_Hook**: The hooks `useUploadTranscript` and `useTranscriptStatus` to be created in `src/hooks/use-transcript.ts`.
- **TranscriptUploadResponse**: The type `{ uploadId: string; status: "processing" }` defined in `src/lib/types/api.ts`.
- **TranscriptStatusResponse**: The type with `uploadId`, `status`, `parsedCourses`, `parsedSkills`, and `error` fields defined in `src/lib/types/api.ts`.
- **ProfileId**: The server-assigned string identifier for a learner profile, available from `ProfileResponse.id`.
- **Offline_Mode**: The state when `isApiEnabled` is `false`; all hooks must handle this without throwing errors.

## Requirements

### Requirement 1: Fix Enroll Endpoint

**User Story:** As a learner, I want enrolling in a course to call the correct backend endpoint, so that my enrollment is recorded server-side.

#### Acceptance Criteria

1. WHEN a learner enrolls in a course with ID `courseId`, THE Enroll_Hook SHALL call `POST /api/v1/courses/:id/enroll` where `:id` is the `courseId`.
2. WHEN the enrollment request succeeds, THE Enroll_Hook SHALL return `{ enrolled: true; courseId: string }` matching the spec.
3. WHEN `isApiEnabled` is `false`, THE Enroll_Hook SHALL return a mock `{ enrolled: true; courseId: string }` without making any network request.
4. WHEN the enrollment request fails with a non-zero HTTP status, THE Enroll_Hook SHALL throw the `ApiError` so the calling component can handle it.

---

### Requirement 2: Fix Generate-Path Request Body

**User Story:** As a learner, I want path generation to send the minimal required data to the backend, so that the API contract is respected and the request is not unnecessarily large.

#### Acceptance Criteria

1. WHEN `useGeneratePath` is called with a `profileId`, THE GeneratePath_Hook SHALL send `POST /api/v1/paths/generate` with request body `{ profileId: string }`.
2. WHEN `isApiEnabled` is `false`, THE GeneratePath_Hook SHALL fall back to the client-side `generateLearningPath(profile)` function and return its result without making any network request.
3. WHEN the API call fails with `status === 0` (network unreachable), THE GeneratePath_Hook SHALL fall back to the client-side `generateLearningPath(profile)` function instead of throwing.
4. WHEN the API call fails with any other non-zero status, THE GeneratePath_Hook SHALL throw the `ApiError` so the calling component can handle it.
5. THE GeneratePath_Hook SHALL accept `{ profileId: string; profile: LearnerProfile }` as its mutation argument so that the offline fallback can use the full profile without a separate fetch.

---

### Requirement 3: Transcript Upload Hook

**User Story:** As a learner, I want to upload my academic transcript so that the system can parse my prior coursework and pre-populate my profile.

#### Acceptance Criteria

1. THE Transcript_Hook SHALL export a `useUploadTranscript()` mutation hook from `src/hooks/use-transcript.ts`.
2. WHEN `useUploadTranscript` is called with a `File`, THE Transcript_Hook SHALL send `POST /api/v1/profile/transcript` as `multipart/form-data` with the file in a field named `file`.
3. WHEN the upload succeeds, THE Transcript_Hook SHALL return a `TranscriptUploadResponse` (`{ uploadId: string; status: "processing" }`).
4. WHEN `isApiEnabled` is `false`, THE Transcript_Hook SHALL return a mock `TranscriptUploadResponse` without making any network request.
5. WHEN the upload request fails with a non-zero HTTP status, THE Transcript_Hook SHALL throw the `ApiError`.

---

### Requirement 4: Transcript Status Hook

**User Story:** As a learner, I want to see real-time processing status of my uploaded transcript, so that I know when results are ready to review.

#### Acceptance Criteria

1. THE Transcript_Hook SHALL export a `useTranscriptStatus(uploadId: string | undefined)` query hook from `src/hooks/use-transcript.ts`.
2. WHEN `uploadId` is `undefined`, THE Transcript_Hook SHALL NOT execute the status query.
3. WHEN `uploadId` is defined, THE Transcript_Hook SHALL poll `GET /api/v1/profile/transcript/:uploadId` every 2 seconds.
4. WHEN the status response has `status === "processing"`, THE Transcript_Hook SHALL continue polling every 2 seconds.
5. WHEN the status response has `status === "completed"` or `status === "failed"`, THE Transcript_Hook SHALL stop polling.
6. WHEN `isApiEnabled` is `false`, THE Transcript_Hook SHALL return a mock `TranscriptStatusResponse` with `status: "completed"` without making any network request.
7. WHEN the status request fails with a non-zero HTTP status, THE Transcript_Hook SHALL throw the `ApiError`.

---

### Requirement 5: Consistent Offline Fallback

**User Story:** As a developer running the frontend without a backend, I want all hooks to behave identically to the existing offline pattern, so that the prototype remains fully functional.

#### Acceptance Criteria

1. THE Enroll_Hook SHALL check `isApiEnabled` before making any network call and return mock data when `false`.
2. THE GeneratePath_Hook SHALL check `isApiEnabled` before making any network call and invoke `generateLearningPath` when `false`.
3. THE Transcript_Hook SHALL check `isApiEnabled` before making any network call and return mock data when `false`.
4. IF a hook checks `isApiEnabled` and it is `false`, THEN THE hook SHALL NOT call any method on `API_Client`.

---

### Requirement 6: Type Consistency

**User Story:** As a developer, I want all hooks to use the existing TypeScript types from `src/lib/types/api.ts`, so that type definitions remain in a single source of truth.

#### Acceptance Criteria

1. THE Enroll_Hook SHALL use inline type `{ enrolled: true; courseId: string }` for the enroll response (no new interface needed).
2. THE GeneratePath_Hook SHALL use the existing `LearningPath` type from `@/data/mock` as the return type.
3. THE Transcript_Hook SHALL use `TranscriptUploadResponse` and `TranscriptStatusResponse` from `@/lib/types/api` for all relevant return types.
4. THE Transcript_Hook SHALL NOT declare any new TypeScript interfaces that duplicate types already present in `src/lib/types/api.ts`.
