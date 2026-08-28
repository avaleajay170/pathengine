# Course Discovery Completion Specification

## Current State

Course discovery spans two routes:
- `/explore` (`src/routes/explore.tsx`, ~4KB): Search + filter grid
- `/course/$id` (`src/routes/course.$id.tsx`, ~19KB): Course detail with tabs

Plus the `CourseCard` component (`src/components/CourseCard.tsx`, ~3KB).

### `/explore` — Current Features
- Hero header with title and description
- Full-text search input (filters title, provider, skills client-side)
- Level dropdown (All levels / Beginner / Intermediate / Advanced)
- Category pill filters (All, Data Science, Web Dev, AI/ML, Design, Business)
- Results count
- 3-column responsive grid of CourseCard components

### `/course/$id` — Current Features
- Hero with back link, badges (category, level, completed), title, blurb
- Metadata row: provider, instructor, rating with stars, review count, duration
- Gradient hue banner (desktop)
- **Tabs**:
  - Overview: "What you'll learn" checklist, skills badges, about text with completion weeks
  - Syllabus: Module accordion with lesson lists
  - Reviews: Star breakdown bars, review cards with avatar/name/rating/text
- **Sidebar**:
  - Enrollment card: price, CTA (Enroll/Continue/Review), "Add to my path"
  - "Why this is in your path" AI callout with reasoning
  - Prerequisites checklist (cleared/pending with course links)
  - Related courses list (3 items)

### `CourseCard` Component
- Colored header bar (thumbHue)
- Category + level badges
- Title (links to `/course/$id`)
- Provider, duration, price
- Skill badges
- Star rating
- "Why this?" button (calls `explain()` in assistant)
- "View course" button

## Status by Feature

| Feature | Status | Details |
|---------|--------|---------|
| Course search | **COMPLETE** (client-side) | Filters 20 mock courses by title/provider/skills |
| Level filter | **COMPLETE** | Radix Select dropdown |
| Category filter | **COMPLETE** | Pill buttons with aria-pressed |
| Course card display | **COMPLETE** | Full metadata, rating, price, skills |
| "Why this?" explanation | **COMPLETE** | Opens assistant with heuristic reason |
| Course detail tabs | **COMPLETE** | Overview, Syllabus, Reviews |
| Reviews | **PARTIAL** | Deterministic hash-seeded fake reviews, not real |
| Enrollment | **PARTIAL** | Updates local `enrolledCourses[]`, no backend |
| Add to path | **PARTIAL** | Updates local `addedCourseIds[]`, no backend |
| Prerequisites display | **COMPLETE** | Checklist with completion status |
| Related courses | **COMPLETE** | 3 same-category courses |
| AI reasoning callout | **COMPLETE** | Shows path location, milestone, and reasoning |
| Backend search | **MISSING** | No server-side search/pagination |
| Loading state | **MISSING** | Data is synchronous |
| Error state | **MISSING** | Only 404 for invalid course ID |
| Pagination | **MISSING** | All 20 courses shown at once |
| Provider filter | **MISSING** | Not mentioned in problem statement but could enhance UX |

## Required Changes

### 1. Backend Search Integration

**Current**: `courses.filter(...)` runs client-side against 20 items.

**Required**: When API available, call `GET /api/v1/courses?q=...&category=...&level=...&page=...&limit=20`.

**Implementation**:
```typescript
// In explore.tsx or a new hook
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ["courses", { query, category, level }],
  queryFn: () => fetchCourses({ query, category, level }),
  // Debounce search by keeping previous data while typing
  placeholderData: keepPreviousData,
});
```

When API unavailable, fall back to current client-side filter.

**Files to modify**: `src/routes/explore.tsx`

### 2. Course Detail Backend Fetch

**Current**: `getCourse(id)` is a synchronous lookup in mock array.

**Required**: When API available, fetch from `GET /api/v1/courses/:id`.

**Files to modify**: `src/routes/course.$id.tsx`

### 3. Reviews Backend Fetch

**Current**: `getReviews(courseId)` generates deterministic fake reviews via hash function.

**Required**: When API available, fetch from `GET /api/v1/courses/:id/reviews`.

**Files to modify**: `src/routes/course.$id.tsx`

### 4. Enrollment Backend Sync

**Current**: `enrollCourse(courseId)` adds to local `enrolledCourses[]` array and shows toast.

**Required**: Also call `POST /api/v1/courses/:id/enroll`. Keep local update as optimistic.

**Files to modify**: `src/routes/course.$id.tsx`, `src/lib/learner-profile.tsx`

### 5. Loading States

**Explore page**: Show skeleton grid (6 skeleton CourseCards) while courses load.

**Course detail page**: Show skeleton layout (hero skeleton, tab skeleton, sidebar skeleton) while course loads.

### 6. Error States

**Explore page**: Show error banner above grid with retry. Preserve search/filter state.

**Course detail page**: Show error block with retry button (similar to existing 404 block but for API errors).

### 7. Empty State Enhancement

**Current**: Shows "0 courses" count and empty grid.

**Required**: Show a proper empty state message: "No courses match your search" with suggestion to broaden filters or browse categories. Show category links for quick navigation.

**Files to modify**: `src/routes/explore.tsx`

### 8. Personalized Recommendation Indicator

**Current**: CourseCard has "Why this?" which is great. But the explore grid doesn't distinguish between recommended and non-recommended courses.

**Required**: When user has a generated path, highlight courses that are in their path with a subtle badge or border accent. The data is already available via `findCourseInPaths(courseId)` from `mock.ts`.

**Implementation**: In `explore.tsx`, for each course in the grid, check if it's in the learner's path. If so, pass a `recommended` prop or add a badge:
```tsx
<CourseCard 
  course={course} 
  reason={isInPath ? "Part of your learning path" : undefined}
/>
```

The `CourseCard` component already accepts an optional `reason` prop — it's just not used from the explore page.

**Files to modify**: `src/routes/explore.tsx`

## Reinforcing Personalized Learning

The course discovery experience should NOT feel like a generic marketplace. To reinforce personalization:

1. **Already implemented**: "Why this is in your path" callout on course detail. "Why this?" on course cards.
2. **Needed**: Recommended badge on explore grid for path courses (Gap 8 above).
3. **Backend-dependent**: Sort results by relevance to learner profile. Server should prioritize courses that fill skill gaps.

## Items Already Complete (Do Not Modify)

- [x] Search input with icon
- [x] Level dropdown filter
- [x] Category pill filters
- [x] Results count
- [x] CourseCard with full metadata
- [x] "Why this?" assistant integration
- [x] Course detail tabs (Overview, Syllabus, Reviews)
- [x] Enrollment with toast
- [x] "Add to my path" button
- [x] "Why this is in your path" AI callout
- [x] Prerequisites checklist with completion status
- [x] Related courses
- [x] "Ask Lumi about this" button
- [x] Responsive grids and stacking
- [x] 404 for invalid course ID
- [x] Course hero with gradient banner

## Acceptance Criteria

1. Course search fetches from backend API when available
2. Course detail loads from backend with loading skeleton
3. Reviews load from backend when available
4. Enrollment syncs to backend
5. Loading skeletons on explore and course detail pages
6. Error states with retry on both pages
7. Enhanced empty state on explore page
8. Recommended course indicator on explore grid
9. When backend unavailable, current functionality works identically
10. All existing course detail interactions preserved
