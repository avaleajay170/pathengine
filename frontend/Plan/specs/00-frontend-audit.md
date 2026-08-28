# Frontend Audit: Current State of Lumina

## Project Overview

- **Framework**: TanStack Start + React 19 + TypeScript 5.8
- **Styling**: Tailwind CSS v4 with OKLCH semantic design tokens
- **UI Library**: shadcn/ui (46 Radix UI primitives), Lucide React icons
- **Charts**: Recharts (Radar, Bar, Line)
- **Routing**: TanStack Router (file-based, 9 routes + root)
- **Data Fetching**: TanStack Query (QueryClient initialized but not used for data fetching yet — all data is synchronous mock)
- **Forms**: react-hook-form + zod available but NOT currently used (onboarding uses raw React state)
- **State Management**: 2 React Context providers (LearnerProfileProvider, AssistantProvider)
- **Persistence**: localStorage only (`lumina-learner` key, v1)
- **Testing**: Vitest with 1 test file (`learning-path.test.ts`, 3 specs)
- **Build**: Vite 8 with SSR via TanStack Start, CSRF middleware, error recovery
- **Package Manager**: Bun (with npm lockfile also present)

## Route Inventory

| Route | File | Purpose | Lines |
|-------|------|---------|-------|
| `/` | `src/routes/index.tsx` | Landing page: hero, goal input, course preview, featured paths, how-it-works, testimonials, CTA | ~11.5KB |
| `/onboarding` | `src/routes/onboarding.tsx` | 5-step profile wizard: goal, skills, prior learning, preferences, review + generation | ~26.5KB |
| `/paths` | `src/routes/paths.tsx` | Learning path catalogue (3 static templates) | ~3KB |
| `/path/$id` | `src/routes/path.$id.tsx` | Personalized roadmap: timeline, skill gap, milestones, adaptation, feedback | ~13KB |
| `/explore` | `src/routes/explore.tsx` | Course discovery: search, level filter, category filter | ~4KB |
| `/course/$id` | `src/routes/course.$id.tsx` | Course detail: overview, syllabus, reviews, enrollment, AI reasoning, prerequisites | ~19KB |
| `/dashboard` | `src/routes/dashboard.tsx` | Dashboard: progress, skills, milestones, next actions, activity, charts | ~14KB |
| `/assistant` | `src/routes/assistant.tsx` | Full-page Lumi assistant with context sidebar | ~5.7KB |
| `/about` | `src/routes/about.tsx` | About, features, pricing (non-functional tiers) | ~11.4KB |
| Root | `src/routes/__root.tsx` | Shell: Navbar, ChatWidget, 404, Error boundary, theme, providers | ~5.3KB |

## Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| `ChatThread` | `src/components/Chat.tsx` | Full chat UI with bubbles, course cards, milestone chips, suggestions |
| `ChatWidget` | `src/components/ChatWidget.tsx` | Floating bottom-right assistant overlay (hidden on `/assistant`) |
| `CourseCard` | `src/components/CourseCard.tsx` | Course summary card with price, rating, skills, "Why this?" |
| `Footer` | `src/components/Footer.tsx` | 4-column footer with links, social, newsletter (simulated) |
| `MilestoneTracker` | `src/components/MilestoneTracker.tsx` | Vertical step indicator for milestones |
| `Navbar` | `src/components/Navbar.tsx` | Top navigation with theme toggle, mobile drawer, disabled sign-in |
| `PathNode` | `src/components/PathNode.tsx` | Timeline node for courses/projects/assessments with status, feedback, adapt |
| `SkillRadar` | `src/components/SkillChart.tsx` | Recharts radar: current vs target skills |
| `SkillGapBars` | `src/components/SkillChart.tsx` | Horizontal bar chart: current vs target per skill |
| `SkillTrend` | `src/components/SkillChart.tsx` | Line chart: monthly skill progression (6 months mock data) |
| 46 UI primitives | `src/components/ui/*` | Full shadcn/ui library (accordion, dialog, tabs, tooltip, etc.) |

## State Architecture

### Provider Hierarchy
```
QueryClientProvider
  → LearnerProfileProvider (localStorage persistence)
    → AssistantProvider (in-memory chat state)
      → Application Shell (Navbar + Outlet + ChatWidget + Toaster)
```

### LearnerProfileProvider (`src/lib/learner-profile.tsx`)
Persists to `localStorage` under key `lumina-learner` (v1).

Profile shape (`LearnerProfile` from `src/data/mock.ts`):
- `name`, `goal`, `targetRole`, `selectedRole`
- `timeframe`, `hoursPerWeek`, `pace`
- `skillLevels: Record<string, number>` (0=Beginner, 1=Intermediate, 2=Advanced)
- `completedCourses: string[]`, `enrolledCourses: string[]`
- `nodeStatuses: Record<string, NodeStatus>`
- `nodeFeedback: Record<string, "too-easy" | "too-difficult" | "not-relevant" | "already-know" | "useful">`
- `addedCourseIds: string[]`
- `onboardingComplete: boolean`
- `priorExperience?: string`, `uploadedData?: string`, `preferredFormats?: string[]`

Actions exposed:
- `updateProfile(updates)`, `enrollCourse(id)`, `completeCourse(id)`, `completeNode(nodeId, courseId?)`, `addToPath(courseId)`, `submitNodeFeedback(nodeId, feedback)`, `resetLearner()`

### AssistantProvider (`src/lib/assistant.tsx`)
In-memory only (not persisted).

State:
- `open: boolean` (widget visibility)
- `messages: ChatMessage[]`
- `thinking: boolean`

Actions:
- `setOpen(boolean)`, `send(text)`, `explain({ title, reason, courseId })`

`ChatMessage` interface:
```ts
{
  id: string;
  role: "user" | "assistant";
  content: string;
  courseId?: string;
  milestone?: { title: string; detail: string };
  pending?: boolean;
}
```

Reply generation: `mockReply(text, profile)` — keyword regex matcher covering ~6 topic patterns with hardcoded responses. 1100ms simulated latency.

## Data Layer (`src/data/mock.ts`)

**Size**: ~36KB, ~1040 lines

### Mock Datasets
- `courses`: 20 curated course objects with full metadata (id, title, provider, instructor, category, level, rating, reviews, hours, price, blurb, skills[], syllabus[], prerequisites[], thumbHue)
- `learningPaths`: 3 career path templates:
  - `ml-engineer`: 4 milestones, 8 courses, 24 weeks
  - `data-analyst`: 3 milestones, 5 courses, 14 weeks
  - `fullstack`: 3 milestones, 4 courses, 16 weeks
- `learner`: Default profile for "Rutik" (ML Engineer goal)
- `activity`: 5 static recent activity items
- `testimonials`: 3 user testimonials
- `stats`: 4 platform metrics
- `skillTrend`: 6-month progression data for 3 skills
- `categories`: 5 category strings

### Accessor Functions
- `getCourse(id)`, `getPath(id)`, `getPathOrDefault(id)`
- `getReviews(courseId)`: Deterministic hash-seeded fake reviews
- `ratingBreakdown(course)`: Computed star distribution
- `findCourseInPaths(courseId)`: Locates course in path/milestone structure
- `findPrerequisiteCourse(label)`: Fuzzy prerequisite resolution

## Business Logic (`src/lib/learning-path.ts`)

- `pathIdForRole(role)`: Maps selectedRole to path ID slug
- `generateLearningPath(profile)`: Pure function that:
  - Resolves the right path template for the learner's role
  - Determines node statuses dynamically (completed/locked/in-progress/available)
  - Enforces prerequisite gating
  - Merges custom added courses into final milestone
  - Calculates progress %, remaining hours, estimated weeks, ETA

## What Is Real vs Simulated

### REAL (functioning client-side logic)
- All navigation and routing
- Responsive layouts (desktop/tablet/mobile)
- Dark/light theme switching
- Course search and filtering (client-side against 20 courses)
- 5-step onboarding wizard with validation
- Prerequisite gating and node status resolution
- Progress calculation
- Node completion state tracking
- Course enrollment state tracking
- Skill gap visualization (radar, bars, trend)
- Milestone tracking
- Course detail tabs (overview, syllabus, reviews)
- Error boundary with retry
- 404 not-found screen
- Toast notifications

### SIMULATED (mock/fake behavior)
- **AI assistant responses**: Keyword regex matcher with 1100ms delay, ~6 hardcoded patterns
- **Path generation**: Role classifier is a client-side regex; generation is a 4-stage setTimeout (700ms/stage) with fake progress
- **Transcript parsing**: Only captures filename; displays hardcoded "Parsed 14 completed courses" text
- **Adaptive re-planning**: `adapt()` in PathNode runs setTimeout (1400ms) and shows static toast messages; no actual recalculation
- **Reviews and ratings**: Deterministic hash-seeded generation, not real user reviews
- **Skill trend data**: Static 6-month array, not computed from actual learning activity
- **Activity log**: 5 hardcoded items, not real telemetry
- **Trust metrics**: Hardcoded marketing numbers (10,000+ learners, 500+ courses, etc.)
- **Newsletter subscription**: Toast only, no network call
- **Pricing tiers**: Non-functional; all link to onboarding
- **Sign-in**: Disabled button placeholder
- **Course enrollment**: Updates local array, no LMS integration
- **Node feedback**: Stored locally, no backend processing

## Existing Test Coverage

**Single test file**: `src/lib/learning-path.test.ts` (Vitest)
- 3 test specs in `describe("generateLearningPath")`:
  1. Generates role-specific roadmap for `data-analyst` with SQL node
  2. Verifies prerequisite locking (`viz-storytelling` locked until `sql-analytics` completed)
  3. Validates progress percentage calculation

**No tests exist for**: Components, routes, contexts, assistant logic, onboarding flow, error states, accessibility.

## Existing Accessibility

### Present
- `aria-label` on theme toggle, menu, assistant close, send button, search inputs
- `aria-pressed` on category filter pills and onboarding role/format pills
- `aria-hidden` on decorative timeline lines
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<aside>`, `<section>`, `<article>`, `<figure>`, `<blockquote>`, `<figcaption>`, `<dl>`, `<dt>`, `<dd>`
- Proper `<label htmlFor>` associations in onboarding
- Radix UI primitives provide built-in ARIA for accordion, tabs, dialog, select, radio, tooltip
- Hidden file input uses `sr-only`

### Missing or Insufficient
- No skip-to-content link
- No `aria-live` regions for dynamic content updates (assistant messages, toast equivalents, path adaptation results)
- No `aria-busy` on loading/generation states
- No reduced-motion media query consideration for animations
- Charts lack text alternatives
- Star ratings in reviews need clearer screen reader text
- Color-only status indicators on path nodes (completed=green, locked=gray) without text alternative in some contexts

## Responsive Behavior Summary

All routes implement responsive layouts:
- Desktop: Multi-column grids (2-4 columns)
- Tablet: Reduced columns (2 columns)
- Mobile: Single column stacking
- Mobile navigation: Sheet drawer replaces desktop nav
- Assistant context sidebar: Hidden on mobile
- Path sidebar: Stacks below timeline on mobile
- Course detail sidebar: Stacks below tabs on mobile
- Featured paths: Horizontal scroll with snap points
- `useIsMobile()` hook available (768px breakpoint)

## Dependencies Not Yet Used

The following are installed but not actively used in the current codebase:
- `@tanstack/react-query`: QueryClient is initialized but no `useQuery`/`useMutation` calls exist
- `react-hook-form` + `zod` + `@hookform/resolvers`: Available but onboarding uses raw useState
- Several shadcn/ui components (calendar, carousel, command, context-menu, drawer, hover-card, input-otp, menubar, resizable, sidebar, table, toggle, toggle-group) are installed but not used by any route
