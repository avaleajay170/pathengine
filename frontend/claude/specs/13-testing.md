# Frontend Testing Specification

## Current coverage
`src/lib/learning-path.test.ts` has 3 passing pure-function tests for role selection, prerequisite locking/unlocking, and progress calculation. No route, context, assistant, mutation, transcript, accessibility, or responsive-critical tests exist. Keep the existing tests and add focused coverage as behavior becomes async.

## Required tests, in priority order

### Pure logic and adapters
- API DTO adapters preserve course `Free` pricing, syllabus, prerequisite arrays, node kinds/statuses, reasons, and optional metadata.
- Path progress, remaining hours, prerequisite states, added courses, and server-updated paths render consistently.

### Onboarding
- Landing goal is handed to onboarding and a valid role-or-goal advances.
- Back/edit preserves all entered fields; invalid/blank goal is blocked.
- Profile submission contains goal, role, skill values, completed courses, preferences, pace, objectives/interests when present.
- Generation prevents duplicate submission, navigates only after a successful response, and exposes retry/error without losing input.
- Transcript upload handles uploading, processing, parsed review, confirm/reject, failure, and manual fallback.

### Path/progress/adaptation
- Returned node statuses render locked/available/in-progress/completed with prerequisite labels.
- Completion sends the correct path/node IDs, updates or invalidates data, and handles failure without false success.
- Feedback sends the correct type/comment/node; `adapted: false` leaves the path unchanged; `adapted: true` renders the returned path and change summary; failure retains old data and enables retry.
- Dashboard next action and progress reflect the updated path.

### Recommendations and courses
- Course/project/assessment recommendations show type, skill, prerequisite, reason, and goal relevance.
- Explore filters, no-results state, course detail missing-resource state, enrollment, and add-to-path behavior work with API and mock repositories.
- `Why this?` passes context to assistant without a second recommendation implementation.

### Assistant
- Empty suggestions render; send ignores whitespace; pending state is announced; success renders referenced course/milestone/action metadata.
- Failed message shows retry for that message without duplicating user messages.
- Full-page and widget share the same provider state; contextual course/path links navigate correctly.

### Accessibility and responsive-critical checks
- Keyboard focus/activation for onboarding controls, PathNode details/feedback, mobile navigation, tabs, accordions, dialogs, and chat.
- Accessible names and live announcements for dynamic states; chart text alternatives exist.
- Smoke-test core journey at desktop, tablet, and mobile widths for no horizontal overflow, clipped long text, or inaccessible controls.

## Test approach
Use Vitest for pure logic and component/provider tests with mocked repository responses. Add browser-level tests only for route navigation and viewport-critical interactions if the project adds a browser runner. Do not test decorative gradients, static marketing copy, or implementation details of Radix primitives.

## Definition of test completion
Every acceptance scenario in `14-acceptance-criteria.md` has at least one executable test or an explicitly documented manual browser check, and `npm test`, `npm run typecheck`, and `npm run lint` remain green aside from existing warnings.
