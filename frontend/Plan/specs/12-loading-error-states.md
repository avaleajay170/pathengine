# Loading, Empty, Error, and Recovery Specification

## Current state
The root route has a render-error boundary, retry, and 404 screen. Most product data is synchronous mock data, so route-level loading/empty/error handling does not exist. Assistant thinking and onboarding generation are cosmetic timers. This is **PARTIAL** for the eventual backend-connected product.

## State contract for every async surface
Every API-backed read or mutation must represent: `idle`, `loading/pending`, `success`, `empty` where meaningful, `error`, and `unauthorized`. Preserve last successful data during refetch when possible.

| Surface | Loading | Empty | Error/retry | Mutation success |
|---|---|---|---|---|
| Profile/onboarding | disable submit and show progress | blank profile with valid defaults | inline message, retry, keep entered values | show saved state before generation |
| Path detail | header/node/sidebar skeletons | no path explanation with dashboard/paths link | retry + dashboard fallback; do not discard cached path | refresh path and next action |
| Paths catalogue | card skeletons | no templates message | retry | n/a |
| Explore/courses | search/list skeletons | no matches with clear-filter action | retry while retaining filters | enrollment/add-to-path confirmation only after response or explicit offline mode |
| Course detail/reviews | metadata/tab skeletons | no reviews/related resources message | retry independently from course data | enrollment pending/success/error |
| Dashboard/activity/skills | section skeletons | empty learning state with onboarding CTA | retry sections independently; show partial data | refetch affected summaries |
| Assistant | pending message indicator | existing suggestions and context | assistant error bubble with retry for the failed user message | append server message once |
| Transcript | upload/processing progress | no parsed items with manual-entry option | retry/re-upload/manual fallback | confirmed items update profile |
| Completion/feedback | disable affected controls | n/a | retain old path and offer retry | distinguish saved feedback from recalculated path |

## Unauthorized behavior
A 401/expired session must stop protected mutations, preserve unsaved local form input, show a sign-in/session-expired action when authentication exists, and avoid redirect loops. Public course/path catalogue data may still render if the backend permits it.

## Mock mode
With no `VITE_API_BASE_URL`, use existing pure mock accessors as a development fallback. Do not render fake network skeletons indefinitely and do not call mock success a backend confirmation. The UI should expose prototype/fallback labeling where the current assistant already does.

## Existing surfaces to extend
Use `src/components/ui/skeleton.tsx`, `alert.tsx`, `button.tsx`, `sonner.tsx`, the root error component in `src/routes/__root.tsx`, and route-local states. Add shared error/loading components only if at least two routes need identical behavior.

## Acceptance criteria
Each backend-connected screen has truthful loading, empty, error, retry, unauthorized, partial-data, pending, and success behavior appropriate to its operation. A failure never silently replaces known-good data with empty mock/default data.
