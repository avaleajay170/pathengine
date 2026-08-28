# Dashboard Completion Specification

## Current State

The dashboard at `/dashboard` (`src/routes/dashboard.tsx`, ~14KB) is feature-rich and answers most of the key learner questions.

### Existing Sections

1. **Header**: Greeting, goal with target icon, goal date badge, "View full roadmap" button
2. **Summary Metrics** (4-card grid):
   - Overall progress % with mini progress bar and steps count
   - Current streak (computed from `profile.completedCourses.length` — not real streak)
   - Hours learned (also `profile.completedCourses.length` — not real hours)
   - Skills mastered (unique skill count from completed courses)
3. **Next Recommended Actions**: Top 3 actionable/upcoming nodes with kind icons, status badges, skills, and Start/Continue/Open buttons. "Ask Lumi" button in header.
4. **Skill Development**: SkillTrend line chart (static 6-month mock data). Badge showing "+30 since March" (hardcoded).
5. **Continue Learning**: Grid of up to 3 started/unlocked course cards with progress bars
6. **Sidebar**:
   - Skills vs. Target Role: SkillRadar chart (current vs 80% target)
   - Milestones: MilestoneTracker checklist with "View all" link
   - Recent Activity: 5-item timeline (static mock data)

## Dashboard Must Answer These Questions

| Question | Currently Answered? | How |
|----------|-------------------|----- |
| Where am I now? | **YES** | Progress % metric, active node in next actions |
| What have I completed? | **PARTIAL** | Steps count in progress card. No dedicated "completed" section with details. |
| What skills have improved? | **PARTIAL** | SkillRadar shows current levels. SkillTrend shows progression but with STATIC mock data. |
| What is my current milestone? | **YES** | MilestoneTracker in sidebar shows status of each milestone |
| What should I do next? | **YES** | "Next Recommended Actions" section with top 3 nodes and action buttons |
| Why is that the recommended next action? | **MISSING** | Next actions show node title, kind, skills, and status but NOT the `node.reason` explaining WHY it's recommended |
| How close am I to my goal? | **PARTIAL** | Progress % is shown. ETA date is shown. But no explicit "goal proximity" visualization (e.g., "73% to becoming an ML Engineer") |

## Required Changes

### 1. Add Recommendation Reason to Next Actions

**Current**: Each next action card shows kind icon, title, status badge, duration, skills, and action button.

**Missing**: The `node.reason` text is available in the data but not rendered in the dashboard next actions.

**Required**: Add a single-line reason text below each next action title, styled with the AI color accent. This should be truncated to 1-2 lines with a "Why this?" link that opens the assistant `explain()` for that node.

**Implementation**: In `dashboard.tsx`, within the next action list rendering (the `actionable.slice(0, 3).map(...)` block), add:
```tsx
<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
  <Sparkle className="inline h-3 w-3 text-ai mr-1" />
  {node.reason}
</p>
```

**Files to modify**: `src/routes/dashboard.tsx`

### 2. Fix Streak and Hours Metrics

**Current**: Both "Current streak" and "Hours learned" use `profile.completedCourses.length` as their value, which is incorrect:
- Streak should represent consecutive days/weeks of learning activity
- Hours should represent actual time spent

**Required for frontend**: These metrics should display backend-provided data when available. For now:
- **Streak**: Change label to something meaningful with mock data, such as computing from `activity` array or keeping the current value but labeling it "Courses completed" instead of "streak".
- **Hours**: Compute from completed course durations: `completedCourses.map(id => getCourse(id)?.hours || 0).reduce(sum, 0)`. This gives actual estimated hours.

**Backend-dependent**: Real streak tracking and time-spent telemetry require backend. Frontend should use backend data when API provides it.

**Files to modify**: `src/routes/dashboard.tsx`

### 3. Skill Trend Real Data

**Current**: `SkillTrend` chart reads from `skillTrend` array in `mock.ts` — a hardcoded 6-month dataset. The "+30 since March" badge is also hardcoded.

**Required**: When API is available, fetch from `GET /api/v1/profile/skill-history` and pass to `SkillTrend`. The chart component itself is production-ready — it just needs real data.

**Files to modify**: `src/routes/dashboard.tsx`, `src/components/SkillChart.tsx` (accept data prop instead of importing from mock)

### 4. Activity Feed Real Data  

**Current**: `activity` array is 5 hardcoded items in `mock.ts`.

**Required**: When API is available, fetch from `GET /api/v1/profile/activity`. The rendering code is already structured to handle `{ description, timestamp, type }` objects.

**Files to modify**: `src/routes/dashboard.tsx`

### 5. Loading State

**Current**: No loading state — all data is synchronous.

**Required**: When using backend API, show loading skeletons for:
- Summary metrics: 4 skeleton cards
- Next actions: 3 skeleton list items
- Charts: skeleton rectangles
- Activity: skeleton timeline items

**Files to modify**: `src/routes/dashboard.tsx`

### 6. Error State

**Current**: No error handling for data loading.

**Required**: If API call fails, show error banner at top of dashboard with retry button. Do NOT hide the entire dashboard — show whatever data is available from local cache.

## Items Already Complete (Do Not Modify)

- [x] Greeting header with goal and ETA
- [x] 4 summary metric cards layout
- [x] Next recommended actions section with top 3 nodes
- [x] SkillTrend line chart component
- [x] SkillRadar chart in sidebar
- [x] MilestoneTracker in sidebar
- [x] Continue learning cards
- [x] Recent activity timeline layout
- [x] "Ask Lumi" button
- [x] "View full roadmap" button
- [x] Responsive layout (sidebar stacks, metrics stack)
- [x] Assistant integration

## Acceptance Criteria

1. Dashboard shows recommendation reason for each next action
2. Hours metric displays computed hours from completed course durations (not raw course count)
3. Streak metric is labeled accurately for mock data
4. SkillTrend chart accepts real data when backend provides it
5. Activity feed loads from backend when available
6. Loading skeletons shown during API data fetch
7. Error state with retry on API failure
8. All existing dashboard sections preserved
9. All existing responsive behavior preserved
