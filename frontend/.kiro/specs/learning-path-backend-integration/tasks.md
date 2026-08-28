# Implementation Plan: Learning Path Backend Integration

## Overview

Wire existing TanStack Query hooks into the UI components, replace placeholder loading/error states with proper Skeleton and error-card UI, connect `useCompleteNode` into `PathNode`, and replace the simulated `adapt()` function in `PathPage` with `useFeedback` plus an inline Adaptation Summary card. All changes are UI-layer only — no new hooks or API endpoints required.

## Tasks

- [ ] 1. Add `pathId` and `highlighted` props to PathNode and wire `useCompleteNode`
  - Add `pathId: string` and `highlighted?: boolean` to the `PathNode` props interface
  - Instantiate `useCompleteNode(pathId)` inside `PathNode`
  - Replace the direct `completeNode(node.id, node.courseId)` call with an `handleComplete` function that calls `completeNode()` optimistically then calls `completeNodeMutation.mutate({ nodeId: node.id, courseId: node.courseId })`
  - Disable the Complete button while `completeNodeMutation.isPending`
  - Apply `ring-2 ring-primary` class to the node card when `highlighted` is true
  - _Requirements: 3.1, 3.2, 3.5_

- [ ]* 1.1 Write property test for online node completion URL (P1)
  - **Property 1: Online node completion URL is correctly formed**
  - **Validates: Requirements 3.1**
  - Use `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for `pathId` and `nodeId`
  - Assert POST URL is exactly `/api/v1/paths/<pathId>/nodes/<nodeId>/complete`
  - Tag: `Feature: learning-path-backend-integration, Property 1`

- [ ]* 1.2 Write property test for offline node completion (P3)
  - **Property 3: Offline node completion never calls the API**
  - **Validates: Requirements 3.5**
  - Use `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for `nodeId` and `courseId`
  - Assert `api.post` is never called when `isApiEnabled` is false
  - Tag: `Feature: learning-path-backend-integration, Property 3`

- [ ]* 1.3 Write property test for API error throwing (P2)
  - **Property 2: Node completion API error causes mutation to throw**
  - **Validates: Requirements 3.4**
  - Use `fc.integer({ min: 400, max: 599 })` for the error status code
  - Assert the async function rejects with the `ApiError` for any non-zero error
  - Tag: `Feature: learning-path-backend-integration, Property 2`

- [~] 2. Update PathPage to pass `pathId` and `highlightedNodeIds` to PathNode
  - Update every `<PathNode node={node} />` call in `path.$id.tsx` to pass `pathId={id}` and `highlighted={highlightedNodeIds.has(node.id)}`
  - Add local state: `const [highlightedNodeIds, setHighlightedNodeIds] = useState<Set<string>>(new Set())`
  - _Requirements: 3.3, 4.6_

- [~] 3. Replace simulated `adapt()` with `useFeedback` in PathPage
  - Remove the local `adapt()` simulation function
  - Instantiate `const feedback = useFeedback(id)` in `PathPage`
  - Add local state `const [adaptationSummary, setAdaptationSummary] = useState<AdaptationResponse | null>(null)`
  - Write `handleAdapt(type: FeedbackType)` that: clears `adaptationSummary`, calls `feedback.mutate(...)`, on `adapted: true` sets `adaptationSummary` and `highlightedNodeIds` (cleared via `setTimeout` after 3 s), on `adapted: false` fires a success Toast, on error fires an error Toast
  - Add the offline guard: when `!isApiEnabled`, call the removed local simulation logic directly (preserve existing Toast messages)
  - Wire the three adapt buttons ("Too easy", "Too hard", "Not interested") to `handleAdapt` with the correct `FeedbackType` values (`"too-easy"`, `"too-hard"`, `"not-interested"`)
  - Disable all three adapt buttons while `feedback.isPending`
  - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.7_

- [ ]* 3.1 Write property test for online feedback URL (P4)
  - **Property 4: Online feedback URL is correctly formed**
  - **Validates: Requirements 4.1**
  - Use `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for `pathId`
  - Assert POST URL is `/api/v1/paths/<pathId>/feedback`
  - Tag: `Feature: learning-path-backend-integration, Property 4`

- [ ]* 3.2 Write property test for offline feedback (P5)
  - **Property 5: Offline feedback never calls the API**
  - **Validates: Requirements 4.7**
  - Use `fc.constantFrom("too-easy", "too-hard", "not-interested", "good-fit", "pace-change")` for type
  - Assert `api.post` is never called when `isApiEnabled` is false
  - Tag: `Feature: learning-path-backend-integration, Property 5`

- [ ]* 3.3 Write property test for highlighted node IDs (P6)
  - **Property 6: Highlighted node IDs match affectedNodeIds from adaptation response**
  - **Validates: Requirements 4.6**
  - Generate `AdaptationResponse` with `fc.array(fc.record({ affectedNodeIds: fc.array(fc.string()) }))`
  - Assert the resulting `highlightedNodeIds` set equals the union of all `affectedNodeIds` arrays
  - Tag: `Feature: learning-path-backend-integration, Property 6`

- [~] 4. Add AdaptationSummaryCard to PathPage
  - Render the card between the progress panel section and the timeline section when `adaptationSummary !== null`
  - Card must show the Sparkle icon, "Your path was recalculated" heading, a dismiss button (`X` icon), and a `<ul>` of `changes[].description` entries
  - Dismiss button calls `setAdaptationSummary(null)`
  - New adapt action clears existing card before firing (`setAdaptationSummary(null)` at start of `handleAdapt`)
  - _Requirements: 4.3, 5.1, 5.2, 5.3_

- [ ]* 4.1 Write property test for adaptation summary rendering (P7)
  - **Property 7: Adaptation summary renders all change descriptions**
  - **Validates: Requirements 5.1**
  - Generate `changes` arrays with `fc.array(fc.record({ description: fc.string(), type: fc.constantFrom("node-added","node-removed","node-reordered","pace-changed","milestone-updated") }))`
  - Render the card and assert every `description` string appears in the output
  - Tag: `Feature: learning-path-backend-integration, Property 7`

- [~] 5. Replace loading and error states in PathPage with Skeleton and error card UI
  - Import `Skeleton` from `@/components/ui/skeleton` and `XCircle`, `X` from `lucide-react` (if not already imported)
  - Replace the plain-text `isLoading` branch with a `<PathLoadingSkeleton />` inline function/component that renders Skeleton elements for: badge + h1 + subtext (header), progress panel card, two timeline node shapes, and two sidebar panel shapes
  - Replace the plain-text `isError` branch with a `<PathErrorCard />` inline function/component that renders: `XCircle` icon, heading, descriptive message ("Your local progress is safe"), "Try again" button calling `refetch()`, and "Go to dashboard" `<Link to="/dashboard">`
  - _Requirements: 1.1, 1.3, 2.1, 2.2, 2.4_

- [ ]* 5.1 Write example test for PathPage loading state
  - Mock `usePath` to return `{ isLoading: true }` and assert Skeleton elements are rendered and no path content is present
  - _Requirements: 1.1, 1.2_

- [ ]* 5.2 Write example test for PathPage error state
  - Mock `usePath` to return `{ isError: true, refetch: mockFn }`, assert error card elements are present, simulate "Try again" click, assert `refetch` was called
  - _Requirements: 2.1, 2.2_

- [~] 6. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [~] 7. Replace loading and error states in PathsPage with Skeleton and error card UI
  - Replace the plain-text `isLoading` branch with three `<Skeleton />` card-shaped placeholders matching the grid layout
  - Replace the plain-text `isError` branch with an error card containing a descriptive message and a "Try again" button calling `refetch()`
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 7.1 Write property test for offline fetchPaths (P8)
  - **Property 8: Offline fetchPaths returns mock data without an API call**
  - **Validates: Requirements 6.4, 7.4**
  - Assert `PathsListResponse.paths` IDs and titles match `learningPaths` mock; assert `api.get` not called
  - Tag: `Feature: learning-path-backend-integration, Property 8`

- [ ]* 7.2 Write property test for offline fetchPath (P9)
  - **Property 9: Offline fetchPath never calls the API**
  - **Validates: Requirements 7.1**
  - Use known pathIds `["ml-engineer", "data-analyst", "fullstack"]`
  - Assert `api.get` is never called and result is a non-null `LearningPath`
  - Tag: `Feature: learning-path-backend-integration, Property 9`

- [ ]* 7.3 Write property test for network-down fetchPath fallback (P10)
  - **Property 10: Network-down fetchPath falls back rather than throwing**
  - **Validates: Requirements 7.1**
  - Mock `api.get` to return `{ ok: false, error: { status: 0 } }` with `isApiEnabled: true`
  - Assert `fetchPath` resolves (does not throw) and returns a valid `LearningPath` for known pathIds
  - Tag: `Feature: learning-path-backend-integration, Property 10`

- [~] 8. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property tests should use `fast-check` (`fc`) — already a project dependency
- Each property test should run with the default fast-check iteration count (100+)
- The ThumbsUp/ThumbsDown buttons in `PathNode` continue to call `submitNodeFeedback` on `LearnerProfileContext` — they do NOT use `useFeedback` (which is for the sidebar adapt panel only)
- The offline guard in `handleAdapt` preserves the existing Toast messages word-for-word to avoid regression
