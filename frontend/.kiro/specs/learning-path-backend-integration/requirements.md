# Requirements Document

## Introduction

This feature completes the backend integration for the learning path experience. The application already has a React + TypeScript frontend with TanStack Query hooks (`useCompleteNode`, `useFeedback`, `usePath`, `usePaths`) and an API client (`src/lib/api-client.ts`) that supports an offline-first fallback pattern via `isApiEnabled`. The remaining work is to wire these hooks fully into the route components, replace placeholder loading/error UI with proper Skeleton and error card components, connect the "Adapt my path" buttons to the real `useFeedback` mutation, and ensure node completion calls `useCompleteNode` with optimistic updates.

## Glossary

- **PathPage**: The route component at `/path/$id` rendered by `src/routes/path.$id.tsx`
- **PathsPage**: The route component at `/paths` rendered by `src/routes/paths.tsx`
- **PathNode**: The `<PathNode />` component in `src/components/PathNode.tsx`
- **usePath**: TanStack Query `useQuery` hook in `src/lib/repositories/paths.ts` that fetches a single learning path
- **usePaths**: TanStack Query `useQuery` hook in `src/lib/repositories/paths.ts` that fetches the path catalogue
- **useCompleteNode**: TanStack Query `useMutation` hook in `src/hooks/use-complete-node.ts` for marking a node complete
- **useFeedback**: TanStack Query `useMutation` hook in `src/hooks/use-feedback.ts` for submitting adaptation feedback
- **isApiEnabled**: Boolean flag in `src/lib/api-client.ts` indicating whether a backend URL is configured
- **Skeleton**: Shadcn/ui `<Skeleton />` component used for loading placeholder UI
- **AdaptationResponse**: API response type containing `adapted`, `changes[]`, and `updatedPath` fields
- **Adaptation Summary**: A UI card shown when the backend confirms the path was recalculated after feedback
- **Optimistic Update**: Immediately applying a local state change before the backend confirms it
- **Toast**: Sonner notification triggered by the `toast()` utility

---

## Requirements

### Requirement 1: Path Detail Loading State

**User Story:** As a learner, I want to see a meaningful loading skeleton while my personalized roadmap is being fetched, so that the page feels responsive and I understand content is on its way.

#### Acceptance Criteria

1. WHEN `usePath` returns `isLoading: true`, THE PathPage SHALL render Skeleton placeholders for the header section, progress panel, at least two timeline nodes, and the sidebar panels.
2. WHILE the loading skeleton is displayed, THE PathPage SHALL NOT render any real path data or the adapt-path panel.
3. WHEN `usePath` transitions from `isLoading: true` to `isLoading: false`, THE PathPage SHALL replace all Skeleton placeholders with the resolved content without a full page reload.

---

### Requirement 2: Path Detail Error State

**User Story:** As a learner, I want a clear error message with recovery options when my roadmap fails to load, so that I'm not left staring at a blank page.

#### Acceptance Criteria

1. WHEN `usePath` returns `isError: true`, THE PathPage SHALL render an error card containing a descriptive message, a "Try again" button, and a "Go to dashboard" link.
2. WHEN the "Try again" button is clicked, THE PathPage SHALL call `refetch()` from the `usePath` hook.
3. IF locally cached path data exists in the TanStack Query cache when `isError: true`, THEN THE PathPage SHALL display the cached path data alongside a non-blocking warning banner.
4. WHEN `isError: true` and no cached data exists, THE PathPage SHALL NOT render the path content, adapt panel, or node list.

---

### Requirement 3: Node Completion Backend Sync

**User Story:** As a learner, I want my node completions to be saved to the backend so that my progress is preserved across devices and sessions.

#### Acceptance Criteria

1. WHEN a learner clicks the "Complete" button on a PathNode, THE PathNode SHALL call `useCompleteNode` with the `pathId` and `nodeId`.
2. WHEN `useCompleteNode` is called, THE PathNode SHALL immediately apply an optimistic local status update via `completeNode()` from `useLearnerProfile` before the API responds.
3. WHEN `useCompleteNode` succeeds, THE PathPage SHALL invalidate the `["path", pathId]` query so the path refreshes with the server's authoritative state.
4. IF `useCompleteNode` returns an error, THEN THE PathNode SHALL display a Toast error notification and retain the locally-applied completed status.
5. WHERE `isApiEnabled` is false, THE PathNode SHALL call `completeNode()` locally only, with no API call made.

---

### Requirement 4: Adaptation Feedback Backend Submission

**User Story:** As a learner, I want my "Too easy / Too hard / Not interested" feedback to be submitted to the backend so that Lumi can genuinely recalculate my path.

#### Acceptance Criteria

1. WHEN a learner clicks an adapt button ("Too easy", "Too hard", or "Not interested"), THE PathPage SHALL call `useFeedback` with the corresponding `FeedbackType` and the active node's ID.
2. WHEN `useFeedback` mutation is pending, THE PathPage SHALL disable all three adapt buttons to prevent duplicate submissions.
3. WHEN `useFeedback` returns `adapted: true`, THE PathPage SHALL display an Adaptation Summary card listing the changes from `AdaptationResponse.changes`.
4. WHEN `useFeedback` returns `adapted: false`, THE PathPage SHALL display a Toast confirming feedback was received without showing an Adaptation Summary card.
5. IF `useFeedback` returns an error, THEN THE PathPage SHALL display a Toast error notification.
6. WHEN `useFeedback` returns `adapted: true`, THE PathPage SHALL briefly highlight the affected PathNodes identified in `AdaptationResponse.changes[].affectedNodeIds`.
7. WHERE `isApiEnabled` is false, THE PathPage SHALL execute the existing local `adapt()` simulation and display the existing success Toast without calling the backend.

---

### Requirement 5: Adaptation Summary Visibility

**User Story:** As a learner, I want to clearly distinguish between "feedback received" and "path recalculated" so that I understand when my roadmap has actually changed.

#### Acceptance Criteria

1. WHEN an Adaptation Summary card is shown, THE PathPage SHALL display a list of human-readable change descriptions from `AdaptationResponse.changes[].description`.
2. WHEN an Adaptation Summary card is shown, THE PathPage SHALL provide a dismiss button that hides the card.
3. WHEN a new adapt action is initiated, THE PathPage SHALL clear any previously shown Adaptation Summary card before submitting new feedback.
4. THE PathPage SHALL visually distinguish the Adaptation Summary card from a standard Toast notification by rendering it inline within the page layout.

---

### Requirement 6: Path Catalogue Loading and Error States

**User Story:** As a learner, I want the path catalogue to load gracefully with skeletons and a retry option on failure, so that browsing available paths feels consistent with the rest of the app.

#### Acceptance Criteria

1. WHEN `usePaths` returns `isLoading: true`, THE PathsPage SHALL render Skeleton placeholders matching the card grid layout (at least three card-shaped skeletons).
2. WHEN `usePaths` returns `isError: true`, THE PathsPage SHALL render an error card containing a descriptive message and a "Try again" button.
3. WHEN the "Try again" button on the PathsPage error state is clicked, THE PathsPage SHALL call `refetch()` from the `usePaths` hook.
4. WHERE `isApiEnabled` is false, THE PathsPage SHALL render the static path list from mock data without entering a loading or error state.

---

### Requirement 7: Offline / Degraded-Mode Preservation

**User Story:** As a learner using the app without a configured backend, I want all existing functionality to continue working identically, so that the app is usable in any environment.

#### Acceptance Criteria

1. WHERE `isApiEnabled` is false, THE PathPage SHALL generate and display the learning path using `generateLearningPath(profile)` without any visible loading delay.
2. WHERE `isApiEnabled` is false, THE PathPage SHALL allow node completion using local state only, with no error toasts or mutation calls.
3. WHERE `isApiEnabled` is false, THE PathPage SHALL execute the local `adapt()` simulation when adapt buttons are clicked and display the existing outcome Toast.
4. WHERE `isApiEnabled` is false, THE PathsPage SHALL render path cards from the local `learningPaths` mock data.

---

### Requirement 8: Existing Interaction and Layout Preservation

**User Story:** As a learner, I want all existing PathNode interactions and responsive layouts to continue working after the backend integration changes, so that nothing breaks for me.

#### Acceptance Criteria

1. THE PathNode SHALL preserve all existing interactions: Start/Continue course link, Complete button, "Why this?" assistant trigger, Details expand/collapse, ThumbsUp/ThumbsDown feedback.
2. THE PathPage SHALL preserve the existing two-column responsive layout (timeline + sidebar) on large screens and single-column stacking on small screens.
3. THE PathPage SHALL preserve the existing sticky sidebar behaviour on large screens.
