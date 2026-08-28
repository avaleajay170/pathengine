# Design Document: Learning Path Backend Integration

## Overview

This integration completes the wiring between the existing TanStack Query hooks and the route components. The codebase already has:

- `usePath` / `usePaths` in `src/lib/repositories/paths.ts` — query hooks with offline fallback
- `useCompleteNode` in `src/hooks/use-complete-node.ts` — mutation with query invalidation
- `useFeedback` in `src/hooks/use-feedback.ts` — mutation that invalidates path on `adapted: true`
- `isApiEnabled` in `src/lib/api-client.ts` — offline-mode gate

The remaining work is entirely at the **UI layer**:

1. Replace plain-text loading/error states in `PathPage` and `PathsPage` with proper Skeleton and error-card UI.
2. Wire `useCompleteNode` into `PathNode` (currently it calls `completeNode()` from context only).
3. Replace the simulated `adapt()` function in `PathPage` with `useFeedback`, and render a proper Adaptation Summary card on `adapted: true`.
4. Ensure offline mode preserves existing behaviour exactly.

No new hooks or API endpoints are required.

---

## Architecture

The integration follows the existing **offline-first, API-optional** pattern:

```
isApiEnabled=false              isApiEnabled=true
      │                                │
      ▼                                ▼
generateLearningPath()          GET /api/v1/paths/:id
      │                                │
      └──────────────┬─────────────────┘
                     ▼
               usePath hook
                     │
                     ▼
               PathPage UI
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      Loading      Error      Data
     Skeleton      Card      Rendered
```

### State flow for node completion

```
User clicks "Complete"
       │
       ▼
completeNode() — optimistic local update (LearnerProfileContext)
       │
       ▼
useCompleteNode.mutate({ nodeId, courseId })
       │
  ┌────┴────┐
  ▼         ▼
success   error
  │         │
invalidate  toast error
["path"]  (keep local state)
```

### State flow for adaptation feedback

```
User clicks "Too easy" / "Too hard" / "Not interested"
       │
       ▼
Clear previous AdaptationSummary
Disable adapt buttons (isPending)
       │
       ▼
useFeedback.mutate({ type, nodeId })
       │
  ┌────┴──────────┐
  ▼               ▼
adapted:true    adapted:false / error
  │               │
Show Adaptation  Toast only
Summary card
Highlight affected nodes
```

---

## Components and Interfaces

### PathPage (`src/routes/path.$id.tsx`)

**Changes:**

- Replace inline `adapt()` simulation with `useFeedback(id)` mutation.
- Add local state `adaptationSummary: AdaptationResponse | null` for the inline summary card.
- Add local state `highlightedNodeIds: Set<string>` to briefly highlight affected nodes (cleared after 3 s).
- Replace plain-text loading state with `<PathLoadingSkeleton />`.
- Replace plain-text error state with `<PathErrorCard />`.
- Pass `highlightedNodeIds` down to milestone/node rendering.

**Props consumed from hooks:**

```typescript
const { data: path, isLoading, isError, refetch } = usePath(id, profile);
const feedback = useFeedback(id);
```

**`adapt` handler replacement:**

```typescript
const handleAdapt = (type: FeedbackType) => {
  setAdaptationSummary(null); // clear previous
  feedback.mutate(
    { type, nodeId: activeNode?.id },
    {
      onSuccess(data) {
        if (data.adapted) {
          setAdaptationSummary(data);
          setHighlightedNodeIds(new Set(
            data.changes.flatMap(c => c.affectedNodeIds ?? [])
          ));
          setTimeout(() => setHighlightedNodeIds(new Set()), 3000);
        } else {
          toast.success("Feedback received", {
            description: "Lumi noted your feedback.",
          });
        }
      },
      onError() {
        toast.error("Feedback failed", { description: "Please try again." });
      },
    }
  );
};
```

**Offline guard:** When `!isApiEnabled`, call the existing local `adapt()` function unchanged.

---

### PathsPage (`src/routes/paths.tsx`)

**Changes:**

- Replace plain-text loading state with `<PathsLoadingSkeleton />` (3 card-shaped skeletons).
- Replace plain-text error state with `<PathsErrorCard />`.

Both the loading skeleton and error card already have enough structure from the existing card grid to be built inline — no separate component file needed.

---

### PathNode (`src/components/PathNode.tsx`)

**Changes:**

- Accept a `pathId: string` prop so it can instantiate `useCompleteNode`.
- Accept an optional `highlighted?: boolean` prop to apply a brief highlight ring.
- Replace direct `completeNode(node.id, node.courseId)` call with:

```typescript
const completeNodeMutation = useCompleteNode(pathId);

const handleComplete = () => {
  completeNode(node.id, node.courseId); // optimistic local update
  completeNodeMutation.mutate({ nodeId: node.id, courseId: node.courseId });
};
```

**Complete button state:**

```typescript
<Button
  size="sm"
  variant="outline"
  disabled={completeNodeMutation.isPending}
  onClick={handleComplete}
>
  <CheckCircle2 className="size-4" /> Complete
</Button>
```

**Error toast in `onError`** is handled inside `useCompleteNode` — no additional wiring needed at component level since the mutation is fire-and-forget from the component's perspective.

**Highlight ring:**

```typescript
<div className={`surface-card hover-lift p-5 ${highlighted ? "ring-2 ring-primary" : ""} ...`}>
```

---

### PathLoadingSkeleton (inline in `path.$id.tsx`)

Renders Shadcn `<Skeleton />` elements matching the real layout sections:

```
┌─────────────────────────────────────────┐
│  [Skeleton 40px tall — badge]           │
│  [Skeleton 48px — h1]                   │
│  [Skeleton 20px — subtext]              │
│                    ┌──────────────────┐ │
│                    │ Skeleton progress│ │
│                    │ panel card       │ │
│                    └──────────────────┘ │
├─────────────────────────────────────────┤
│  Skeleton timeline node (×2)            │
│  Skeleton sidebar panels (×2)           │
└─────────────────────────────────────────┘
```

---

### PathErrorCard (inline in `path.$id.tsx`)

```tsx
<main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
  <XCircle className="mx-auto size-12 text-destructive" />
  <h1 className="mt-4 text-2xl font-bold">Your roadmap could not be loaded</h1>
  <p className="mt-2 text-muted-foreground">
    There was a problem fetching your learning path. Your local progress is safe.
  </p>
  <div className="mt-6 flex justify-center gap-3">
    <Button onClick={() => void refetch()}>Try again</Button>
    <Button variant="outline" asChild>
      <Link to="/dashboard">Go to dashboard</Link>
    </Button>
  </div>
</main>
```

---

### AdaptationSummaryCard (inline in `path.$id.tsx`)

Rendered between the progress panel and the roadmap timeline when `adaptationSummary !== null`:

```tsx
<div className="surface-card border-l-4 border-primary p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Sparkle className="size-4 text-primary" />
      <p className="font-semibold">Your path was recalculated</p>
    </div>
    <Button size="icon" variant="ghost" onClick={() => setAdaptationSummary(null)}>
      <X className="size-4" />
    </Button>
  </div>
  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
    {adaptationSummary.changes.map((c, i) => (
      <li key={i}>• {c.description}</li>
    ))}
  </ul>
</div>
```

---

## Data Models

No new data models are introduced. Existing types from `src/lib/types/api.ts` are used as-is:

```typescript
// Already defined — relevant types consumed by this feature
AdaptationResponse {
  adapted: boolean;
  changes: {
    type: "node-added" | "node-removed" | "node-reordered" | "pace-changed" | "milestone-updated";
    description: string;
    affectedNodeIds?: string[];
  }[];
  updatedPath: LearningPath;
}

NodeCompletionResponse {
  nodeId: string;
  status: "completed";
  pathProgress: number;
  unlockedNodes: string[];
  updatedMilestone?: { id: string; completed: boolean };
}
```

**PathNode prop additions:**

```typescript
interface PathNodeProps {
  node: PathNodeItem;
  pathId: string;          // new — needed by useCompleteNode
  highlighted?: boolean;   // new — drives brief highlight ring
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Online node completion URL is correctly formed

*For any* URL-safe `pathId` and `nodeId`, when `isApiEnabled` is true and the API succeeds, the POST request URL must be exactly `/api/v1/paths/<pathId>/nodes/<nodeId>/complete` with no extra path segments.

**Validates: Requirements 3.1**

---

### Property 2: Node completion API error causes mutation to throw

*For any* HTTP error status (400–599) returned by the node completion endpoint, the `completeNode` async function must throw the `ApiError` rather than returning a value, ensuring TanStack Query's `onError` callback fires and the locally-applied optimistic state is preserved.

**Validates: Requirements 3.4**

---

### Property 3: Offline node completion never calls the API

*For any* valid `nodeId` and `courseId`, when `isApiEnabled` is false, the `completeNode` async function must return the mock `NodeCompletionResponse` without invoking `api.post`.

**Validates: Requirements 3.5, 7.2**

---

### Property 4: Online feedback URL is correctly formed

*For any* URL-safe `pathId`, when `isApiEnabled` is true and the API succeeds, the POST request must be made to `/api/v1/paths/<pathId>/feedback`.

**Validates: Requirements 4.1**

---

### Property 5: Offline feedback never calls the API

*For any* valid `FeedbackRequest` (any `FeedbackType`), when `isApiEnabled` is false, the `submitFeedback` async function must return `{ adapted: false, changes: [] }` without invoking `api.post`.

**Validates: Requirements 4.7, 7.3**

---

### Property 6: Highlighted node IDs match affectedNodeIds from adaptation response

*For any* `AdaptationResponse` where `adapted: true`, the set of node IDs passed as `highlighted` to `PathNode` components must be exactly the union of all `affectedNodeIds` arrays across `changes`.

**Validates: Requirements 4.6**

---

### Property 7: Adaptation summary renders all change descriptions

*For any* `AdaptationResponse` with a non-empty `changes` array, rendering the `AdaptationSummaryCard` must produce a list item for every entry in `changes`, with each item's text containing the corresponding `description` string.

**Validates: Requirements 5.1**

---

### Property 8: Offline fetchPaths returns mock data without an API call

*For any* invocation of `fetchPaths` when `isApiEnabled` is false, the returned `PathsListResponse.paths` must match the local `learningPaths` mock data in ID and title, and `api.get` must not have been called.

**Validates: Requirements 6.4, 7.4**

---

### Property 9: Offline fetchPath never calls the API

*For any* known `pathId` from mock data, when `isApiEnabled` is false, `fetchPath` must return a non-null `LearningPath` without invoking `api.get`.

**Validates: Requirements 7.1**

---

### Property 10: Network-down fetchPath falls back rather than throwing

*For any* known `pathId` from mock data, when `isApiEnabled` is true but `api.get` returns `{ ok: false, error: { status: 0 } }` (network unreachable), `fetchPath` must return the client-side generated path and must not throw.

**Validates: Requirements 7.1**

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| `usePath` network error (`status: 0`) | Fallback to `generateLearningPath(profile)` — no error state shown |
| `usePath` HTTP error (non-zero, non-404) | `isError: true` → PathErrorCard with retry + dashboard link |
| `usePath` 404 | `data` is `undefined` → "path not found" card (existing) |
| `useCompleteNode` any error | Toast error; local optimistic state preserved |
| `useFeedback` any error | Toast error; adapt buttons re-enabled |
| `usePaths` network error (`status: 0`) | Fallback to mock data — no error state shown |
| `usePaths` HTTP error | `isError: true` → PathsErrorCard with retry |
| `isApiEnabled: false` | All mutations return mock responses; queries use local data |

---

## Testing Strategy

### Dual approach

Unit/example tests cover specific scenarios and edge cases. Property-based tests (using **fast-check**, already used in the project) verify universal correctness across generated inputs.

### Unit tests

Located alongside the source files using Vitest, following the project's existing pattern of inlining the async functions under test (no React Query provider required).

Focus areas:
- `fetchPath` and `fetchPaths` offline/online branches and error paths
- `completeNode` async function: offline mock, online happy path, network-down fallback
- `submitFeedback` async function: offline mock, online happy path, non-zero error throw
- `AdaptationSummaryCard` visibility: shown on `adapted: true`, hidden on `adapted: false`

### Property-based tests

Each property from the Correctness Properties section is implemented as a single **fast-check** property test with ≥ 100 iterations.

Tag format in test comments: `Feature: learning-path-backend-integration, Property <N>: <title>`

| Property | Test description | Generator |
|---|---|---|
| P1 | Online completion URL is correctly formed | `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for pathId/nodeId |
| P2 | API error causes mutation to throw | `fc.integer({ min: 400, max: 599 })` for status code |
| P3 | Offline node completion never calls `api.post` | `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for nodeId/courseId |
| P4 | Online feedback URL is correctly formed | `fc.stringMatching(/^[a-z0-9-]{1,40}$/)` for pathId |
| P5 | Offline feedback never calls `api.post` | `fc.constantFrom(...feedbackTypes)` for type |
| P6 | Highlighted node IDs match affectedNodeIds | `fc.array(fc.record({ affectedNodeIds: fc.array(fc.string()) }))` |
| P7 | Adaptation summary renders all change descriptions | `fc.array(fc.record({ description: fc.string(), type: fc.constantFrom(...) }))` |
| P8 | Offline `fetchPaths` returns mock data | Single invocation property |
| P9 | Offline `fetchPath` never calls `api.get` | Fixed known pathIds from mock |
| P10 | Network-down `fetchPath` falls back | Fixed known pathIds, `api.get` returns `{ status: 0 }` |

### Regression tests

- All existing `PathNode` interactions must continue to pass after `pathId` prop is added.
- Confirm ThumbsUp/ThumbsDown in `PathNode` still calls `submitNodeFeedback` on context (not `useFeedback` — that's for the sidebar adapt buttons only).
