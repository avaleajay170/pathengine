# Feedback and Adaptation Specification

## Current state
`PathNode` exposes `useful` and `too-easy` controls; `/path/$id` exposes `too easy`, `too hard`, and `not interested`. `LearnerProfileProvider.submitNodeFeedback()` only writes a local value, while `path.$id.tsx` and `PathNode.tsx` show timer-driven success toasts. The path is not changed by those actions. This is **PARTIAL**, and the timer must not survive API integration as a claim of successful adaptation.

## Required frontend behavior

1. Collect feedback at the node and path level. Minimum types are `good-fit`, `too-easy`, `too-difficult`, `not-relevant`, `already-know`, and `pace-change`; support an optional comment and requested pace.
2. On submit, disable the relevant control set, show `Submitting feedback`, and retain the existing path until a response arrives. Do not optimistically invent new nodes or an ETA.
3. Send the path ID, node ID when applicable, feedback type, difficulty/relevance, comment, and requested pace through the API/repository layer.
4. On `adapted: false`, show `Feedback recorded`; keep the path unchanged.
5. On `adapted: true`, replace the cached path with the returned full path, render the returned statuses/progress/next action, and show a dismissible change summary from the response. Highlight affected node IDs briefly without changing their semantics.
6. On failure, show an actionable error and retry; preserve the last known path and distinguish local fallback from server confirmation.
7. Invalidate/refetch the path and dashboard recommendation queries after a successful mutation. Keep local profile feedback as an offline cache only.

## Existing surfaces to extend
- `src/components/PathNode.tsx`: feedback controls, pending/error/success affordances, optional comment dialog, and server mutation callback.
- `src/routes/path.$id.tsx`: path-level feedback, adaptation summary, affected-node highlighting, and query invalidation.
- `src/routes/dashboard.tsx`: consume the updated next action/progress after adaptation.
- `src/lib/learner-profile.tsx`: retain local optimistic/offline state, but do not present it as recalculated path state.
- `src/components/ui/alert-dialog.tsx`, `dialog.tsx`, `textarea.tsx`, and `sonner.tsx`: reuse existing primitives.

## Backend boundary
The backend owns feedback persistence and recommendation/path recalculation. The frontend consumes `AdaptationResponse` from `03-api-contract.md`; it must not infer changed recommendations from the feedback label. With no API base URL, the current mock behavior may remain clearly labeled as prototype fallback, but production/API mode must never use the timer success path.

## Acceptance criteria
A feedback action has observable pending, success, unchanged, and failure states. A successful adapted response visibly changes the roadmap only from returned data, lists what changed, updates the next action, and remains correct after refresh.
