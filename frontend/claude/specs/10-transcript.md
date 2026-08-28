# Transcript and Previous Learning Specification

## Current state
Onboarding Step 3 supports manual selection from mock courses and a hidden PDF/CSV file input, but `onboarding.tsx` stores only `uploadName` and displays the hardcoded text `Parsed 14 completed courses`. No file bytes, upload status, parsed courses, confidence, or review decision is retained. This is **PARTIAL**.

## Required flow

`select file -> validate -> upload -> processing -> parsed results -> learner review -> confirm/reject -> profile updated -> path generation`

### File selection
Accept PDF and CSV, show name and size, reject unsupported/oversized files with an inline error, and keep manual course tagging available. Do not claim parsing before a backend response.

### Upload and processing
Use the API layer, not `fetch` in the route. Track `idle | uploading | processing | completed | failed`, upload progress when available, cancellation/retry, and an `uploadId`. Poll or subscribe only through the agreed backend contract. On refresh or navigation, recover the status when an upload ID is known, or reset to a truthful idle state.

### Review
Render parsed courses and inferred skills with source text when provided, confidence, and selectable confirm/reject controls. Deduplicate confirmed course IDs against manual selections. Confirmed skills merge with explicit learner ratings only after the learner confirms them. Provide `Use manual selection instead` when parsing fails or is unavailable.

### Profile handoff
Send transcript metadata/confirmed results as part of profile submission or the dedicated transcript endpoint defined by the backend. Keep the original file out of localStorage. The review summary must show confirmed items, not a fabricated count.

## Existing surfaces to extend
- `src/routes/onboarding.tsx`: Step 3 state machine, upload/review UI, validation, retry, and Step 5 summary.
- `src/data/mock.ts`: only if a deterministic fallback fixture is needed; never add fake parsed results that look server-confirmed.
- `src/lib/learner-profile.tsx`: store confirmed IDs/metadata only, with a versioned migration if the shape changes.
- New API types/repository functions are permitted only within the architecture boundary in `02-frontend-architecture.md`.

## Fallback behavior
When the backend is unavailable, manual checkbox selection works and the file is not represented as parsed. An explicit `Transcript processing is unavailable; choose completed courses manually` state is preferable to the current fake success copy.

## Acceptance criteria
A learner can upload a valid transcript, see truthful upload/processing states, review extracted items, confirm or reject them, and see only confirmed data in the profile review. Errors are retryable, manual entry remains usable, and no transcript contents are silently persisted to localStorage.
