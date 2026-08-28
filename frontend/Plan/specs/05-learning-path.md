# Learning Path Completion Specification

## Current State

The learning path experience spans two routes:
- `/paths` (`src/routes/paths.tsx`, ~3KB): Catalogue of 3 static path templates
- `/path/$id` (`src/routes/path.$id.tsx`, ~13KB): Personalized roadmap with timeline, progress, skill gap, milestones, adaptation

The path detail page is the **central product experience** and is already richly implemented.

## Path Detail Page (`/path/$id`) — Current Features

### Header Section
- Back link to `/paths`
- "Personalized for {name}" badge
- Path title, goal, and metadata badges (level, courses, weeks, hours/week)
- Progress panel card: overall %, steps completed, remaining hours, progress bar, ETA with calendar icon
- "Adjust path" button (opens assistant with "Adjust my pace")
- "Ask Lumi" button (opens assistant with "What should I do next?")

### Timeline Section
- Active node indicator
- Continuous vertical line connector
- Milestone stage gates with numbered circles (green check if complete, gradient AI if pending)
- Stage title, summary, completed count
- PathNode components for each node

### PathNode Component (`src/components/PathNode.tsx`)
- Status icon ring: green check (completed), blue play (in-progress), outline circle (available), lock (locked)
- Kind badge (course/project/assessment), status badge, duration, prerequisites tooltip
- Title, description, skill badges
- Start/Continue button (links to `/course/$id`)
- Complete button (marks node done)
- "Why this?" button (opens assistant)
- Details accordion (shows `node.reason`)
- Thumbs up/down feedback buttons

### Sidebar (desktop: sticky right column)
- **Skill Gap Card**: SkillGapBars chart with target vs current, color legend, AI callout for widest gap
- **Milestones Card**: MilestoneTracker checklist
- **Adapt My Path Card**: 3 buttons:
  - "Too easy" → fast pace, compress modules
  - "Too hard" → slow pace, insert primers
  - "Not interested" → swap node for alternative

## Status by Feature

| Feature | Status | Details |
|---------|--------|---------|
| Path header with metadata | **COMPLETE** | Title, goal, level, courses, weeks, hours |
| Progress panel | **COMPLETE** | %, steps, remaining hours, ETA |
| Timeline visualization | **COMPLETE** | Vertical line, milestone gates, ordered nodes |
| Node status states | **COMPLETE** | 4 states with distinct visual indicators |
| Prerequisite gating | **COMPLETE** | Lock icons, tooltip, logic in `generateLearningPath()` |
| Node completion | **COMPLETE** | Click "Complete" → `completeNode()` → state updates → re-render |
| Skill gap chart | **COMPLETE** | SkillGapBars + AI callout for widest gap |
| Milestone tracker | **COMPLETE** | MilestoneTracker with completion icons |
| Recommendation reasons | **COMPLETE** | Collapsible "Why Lumi placed this here" with `node.reason` |
| Feedback buttons | **COMPLETE** | Thumbs up/down on each node |
| Path adaptation UI | **PARTIAL** | 3 buttons exist but adaptation is simulated |
| Backend data loading | **MISSING** | Currently all synchronous from `generateLearningPath(profile)` |
| Loading state | **MISSING** | No loading skeleton while path data loads |
| Error state for API failure | **MISSING** | Only has 404 for invalid path ID |
| Path changed confirmation | **MISSING** | No visual diff when path is adapted |
| Custom course addition | **PARTIAL** | `addToPath()` exists in profile but no UI to add arbitrary courses to path |

## Required Changes

### 1. Backend Data Integration

**Current**: Path is generated client-side by `generateLearningPath(profile)` which reads from mock data.

**Required**: When API is available, fetch path from `GET /api/v1/paths/:id`.

**Implementation**:
```typescript
// src/hooks/use-path.ts (NEW)
import { useQuery } from "@tanstack/react-query";
import { generateLearningPath } from "@/lib/learning-path";
import { useLearnerProfile } from "@/lib/learner-profile";

export function useLearningPath(id: string) {
  const { profile } = useLearnerProfile();
  
  return useQuery({
    queryKey: ["path", id],
    queryFn: async () => {
      if (!import.meta.env.VITE_API_BASE_URL) {
        // Fall back to existing client-side generation
        return generateLearningPath(profile);
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/paths/${id}`);
      if (!res.ok) throw new Error("Failed to load path");
      return res.json();
    },
  });
}
```

Modify `path.$id.tsx` to use this hook instead of direct `generateLearningPath()` call. Add loading and error states.

### 2. Loading State

**Current**: No loading state — data is synchronous.

**Required**: When using API, show loading skeleton:
- Header section: skeleton bars for title, goal, metadata badges
- Progress panel: skeleton for percentage, progress bar
- Timeline: 3-4 skeleton node cards with pulsing placeholders
- Sidebar: skeleton charts

**Implementation**: Use existing `<Skeleton />` component from `src/components/ui/skeleton.tsx`. Create a `PathSkeleton` section within `path.$id.tsx` (not a separate component — keep it simple).

### 3. Error State

**Current**: Only handles invalid path ID with a 404 block ("We couldn't find that path").

**Required**: Also handle API failures:
```
API error
  → Show error card with message
  → "Try again" button that retriggers query
  → "Go to dashboard" fallback link
  → Preserve any locally cached path data if available
```

### 4. Adaptation Feedback Loop

**Current**: The `adapt()` function in `path.$id.tsx` is entirely simulated:
```javascript
// Current simulated adaptation
function adapt(kind: string) {
  // Updates pace in profile
  // Calls submitNodeFeedback
  // Shows 3 sequential toasts after 1400ms setTimeout
  // Path does NOT actually change
}
```

**Required**: Replace simulation with real backend integration:

```
User clicks "Too easy" / "Too hard" / "Not interested"
  → Show loading indicator on the button (disable all 3 buttons)
  → POST /api/v1/paths/:pathId/feedback with feedback type
  → Receive AdaptationResponse
  → If adapted: true:
      → Show adaptation summary card listing changes[].description
      → Update path state with updatedPath
      → Highlight affected nodes briefly (e.g., subtle border pulse)
      → Toast: "Path updated based on your feedback"
  → If adapted: false:
      → Toast: "Feedback recorded — no changes needed right now"
  → If error:
      → Toast: "Couldn't update path. Try again."
      → Re-enable buttons
```

**When API unavailable**: Keep existing simulated behavior as fallback.

**Files to modify**: `src/routes/path.$id.tsx` (the `adapt()` function), `src/components/PathNode.tsx` (the `adapt()` in feedback buttons)

### 5. Node Completion Backend Sync

**Current**: `completeNode(nodeId)` updates localStorage. Progress recalculates client-side.

**Required**: Also send `POST /api/v1/paths/:pathId/nodes/:nodeId/complete` when API available.

**Implementation**: Create a mutation hook:
```typescript
// In path.$id.tsx or a new hook file
const completeNodeMutation = useMutation({
  mutationFn: (nodeId: string) => api.post(`/paths/${id}/nodes/${nodeId}/complete`),
  onSuccess: (data) => {
    // Update local state optimistically (already done)
    // Invalidate path query to refetch latest state
    queryClient.invalidateQueries({ queryKey: ["path", id] });
  },
  onError: () => {
    toast.error("Couldn't save progress. Your changes are saved locally.");
  },
});
```

Keep `completeNode()` from LearnerProfileProvider as optimistic/offline update. Add API sync on top.

### 6. Path Catalogue Backend Integration

**Current**: `/paths` route renders 3 hardcoded path templates from `learningPaths` array.

**Required**: Fetch from `GET /api/v1/paths` when API available. Show loading skeleton. Show error with retry.

**This is lower priority** — the path catalogue is a simple listing page.

## Items Already Complete (Do Not Modify)

- [x] Path header with all metadata
- [x] Progress panel with %, steps, remaining hours, ETA
- [x] Vertical timeline with milestone gates
- [x] PathNode component with all status states
- [x] Prerequisite gating and lock icons
- [x] Node completion (local state)
- [x] "Why this?" button and reason drawer
- [x] Skill gap bars chart with AI callout
- [x] MilestoneTracker
- [x] Feedback buttons (thumbs up/down)
- [x] 3 adaptation trigger buttons
- [x] Responsive layout (sidebar stacks on mobile)
- [x] 404 for invalid path ID
- [x] Assistant integration ("Adjust path", "Ask Lumi")
- [x] Prerequisites tooltip
- [x] Active node indicator

## Visual Communication Goal

The roadmap must communicate:
> "This is my personalized journey from where I am now to where I want to be."

The current implementation already achieves this through:
- Personal greeting badge ("Personalized for {name}")
- Goal statement in header
- Target role with skill gap visualization
- Clear visual progression (locked → available → in-progress → completed)
- ETA showing when the learner will reach their goal
- Milestone gates showing major journey checkpoints

**No visual redesign is needed.** The existing timeline + sidebar layout effectively communicates the personalized journey.

## Acceptance Criteria

1. Path loads from backend API when available, with loading skeleton during fetch
2. API errors show meaningful error state with retry
3. Node completion syncs to backend with optimistic local update
4. Adaptation feedback submits to backend and re-renders path with real changes
5. Path changes are visually distinguished from static state (adaptation summary)
6. "Feedback submitted" is clearly distinguished from "Path recalculated"
7. When backend unavailable, all current functionality works identically
8. All existing PathNode interactions preserved
9. All existing responsive behavior preserved
