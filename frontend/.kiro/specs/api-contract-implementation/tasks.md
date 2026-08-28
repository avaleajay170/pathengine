# Implementation Tasks

- [x] 1. Fix enroll endpoint
  - [x] 1.1 Update `src/hooks/use-enroll.ts` to call `POST /api/v1/courses/:id/enroll` with courseId as a path segment
  - [x] 1.2 Update mock fallback to return `{ enrolled: true, courseId }` (add `courseId` field)
  - [x] 1.3 Write unit + property tests for enroll hook in `src/hooks/use-enroll.test.ts`

- [x] 2. Fix generate-path request body
  - [x] 2.1 Update `src/hooks/use-generate-path.ts` mutation argument to `{ profileId: string; profile: LearnerProfile }`
  - [x] 2.2 Send only `{ profileId }` in the API request body
  - [x] 2.3 Keep offline fallback using `generateLearningPath(profile)`
  - [x] 2.4 Write unit tests in `src/hooks/use-generate-path.test.ts`

- [x] 3. Create transcript hooks
  - [x] 3.1 Create `src/hooks/use-transcript.ts` with `useUploadTranscript` mutation
  - [x] 3.2 Add `useTranscriptStatus` query with polling logic (2s interval while processing)
  - [x] 3.3 Write unit + property tests in `src/hooks/use-transcript.test.ts`
