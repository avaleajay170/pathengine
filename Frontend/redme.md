# Lumina Frontend Handoff

## Project Summary

Lumina is a TanStack Start + React + TypeScript frontend for an AI-personalized learning-path product. A learner enters a career goal, rates current skills, credits previous learning, selects time preferences, and receives a role-based roadmap of courses, projects, and assessments.

The current app is a polished functional prototype. The UI and client-side flows are implemented, but the product is not connected to a backend, authentication provider, course platform, payment provider, or real AI model.

## Tech Stack

- React 19
- TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS v4
- Radix UI primitives through `src/components/ui`
- lucide-react icons
- Recharts for skill charts
- TanStack Query is configured at the root but is not yet used for real API data
- Vitest for tests
- ESLint and TypeScript compiler for validation

## How To Run

```bash
bun install
bun run dev
```

Useful validation commands:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Implemented Product Areas

### Public landing page (`/`)

- Lumina hero section with product positioning and image asset.
- Goal input that saves a goal locally and routes to onboarding.
- Course search and category filtering.
- Featured learning paths.
- Product explanation, testimonials, statistics, and footer.

### Onboarding (`/onboarding`)

Five-step learner profile wizard:

1. Select a target role or describe a goal.
2. Rate five skills: Python, Statistics, Machine Learning, SQL, and Web Development.
3. Select completed courses or choose a transcript file.
4. Set weekly hours, preferred formats, and pace.
5. Review the profile and generate a path.

The generation screen simulates four AI processing stages before navigating to the selected path.

### Learning paths (`/paths`, `/path/$id`)

- Browse the available role templates.
- Generated paths for ML Engineer, Data Analyst, and Full-Stack Developer roles.
- Milestones and timeline-style path nodes.
- Prerequisite gates and node statuses: locked, available, in progress, and completed.
- Progress percentage, estimated weeks, remaining hours, skill-gap charts, and milestone tracker.
- Add custom courses to the generated path.
- Mark available nodes complete.
- Give node feedback and trigger simulated adaptive re-planning toasts.
- Ask Lumi about the next action or adjust pace.

### Course discovery and details (`/explore`, `/course/$id`)

- Search courses by title, provider, and skill.
- Filter by category and level.
- Course detail page with overview, syllabus accordion, reviews, ratings, prerequisites, related courses, price, and skill information.
- Enroll locally, add a course to the path, and display toast feedback.
- Explain why a course was recommended through Lumi.

### Dashboard (`/dashboard`)

- Personalized greeting and current goal.
- Overall progress, completed-course count, planned hours, and tracked skills.
- Next recommended actions.
- Continue-learning course cards.
- Skill trend and skill-vs-target charts.
- Milestone tracker and recent activity.
- Quick links to the roadmap and Lumi.

### Lumi assistant (`/assistant` and global chat widget)

- Full assistant page and global chat widget.
- Profile-aware simulated replies for common prompts such as next action, pace changes, backend switching, statistics rationale, and too-easy feedback.
- Course recommendation and milestone metadata can be attached to replies.
- `Why this?` actions across the product open the assistant with contextual reasoning.

### Shared shell and UX

- Sticky responsive navbar with desktop and mobile navigation.
- Light/dark theme toggle persisted as `lumina-theme`.
- Root error and not-found screens.
- Toast notifications through Sonner.
- Responsive layouts and reusable Radix-based UI components.
- Page metadata and Open Graph metadata are defined for the routes.

## Main Architecture

- `src/data/mock.ts`: Types plus all mock courses, paths, learner data, reviews, activity, and helper accessors.
- `src/lib/learner-profile.tsx`: Learner profile context, local persistence, enrollment, completion, path additions, and node feedback.
- `src/lib/learning-path.ts`: Converts a role template plus learner profile into the current generated path and node statuses.
- `src/lib/assistant.tsx`: Assistant context and simulated response rules.
- `src/routes/`: File-based route pages.
- `src/components/`: Product-specific components such as `PathNode`, `MilestoneTracker`, `CourseCard`, `SkillChart`, `Chat`, and `Navbar`.
- `src/components/ui/`: Shared UI primitives.
- `src/styles.css`: Global theme tokens, utility classes, gradients, cards, and chart styles.

The root provider order is:

`QueryClientProvider` -> `LearnerProfileProvider` -> `AssistantProvider` -> application shell.

## Current Data and State Behavior

- Course and path data are static mock data.
- Learner profile state is stored in browser local storage under `lumina-learner` with version `1`.
- Theme state is stored under `lumina-theme`.
- Assistant messages are session-only React state and are not persisted.
- Enrolling or completing a course updates local state only; it does not launch an external course.
- The path generator is deterministic and uses role templates, prerequisites, completed courses, enrollment, and added course IDs.
- Assistant replies and adaptive-path updates are simulated with hard-coded rules and delayed toast responses.

## Known Prototype Limitations

- No authentication, user accounts, server sessions, or multi-device synchronization.
- No backend API or database.
- No real AI/LLM integration, recommendation model, skill assessment, or re-planning engine.
- Transcript upload only stores the selected filename. CSV/PDF parsing and course credit extraction are not implemented.
- Course enrollment is local and does not connect to Coursera, Udemy, edX, or another provider.
- Course lessons, video playback, quizzes, assessments, projects, certificates, and actual completion tracking do not exist yet.
- Pricing is informational only. No checkout, subscriptions, billing, or entitlement checks exist.
- Sign-in is intentionally disabled and labeled “Coming soon”.
- Mock course metadata and some copy contain hard-coded values that should be replaced or verified.
- The dashboard's “hours learned” value currently reflects the number of completed courses rather than tracked learning hours.
- Adaptive feedback records a signal and shows simulated results, but does not mutate the generated node sequence or ETA beyond the existing pace update.
- Accessibility, browser compatibility, and mobile behavior need a dedicated QA pass.
- There are currently focused tests for learning-path logic, but route/component coverage is limited.

## Recommended Build Order

### P0: Product foundation

1. Define backend API contracts for profiles, courses, paths, progress, feedback, assistant messages, and recommendations.
2. Add authentication and replace local-only profile state with server-backed persistence while retaining a local draft for onboarding.
3. Move mock data behind repository/API functions so the UI does not depend directly on static arrays.
4. Add loading, empty, retry, unauthorized, and API-error states to every data-driven route.

### P1: Core learning workflow

1. Implement real course-provider links or integrations.
2. Add lesson/course launch, progress events, quiz/project/assessment records, and completion synchronization.
3. Make node completion update prerequisites, path progress, dashboard metrics, and ETA consistently.
4. Implement transcript parsing and review/confirmation before crediting prior learning.
5. Replace simulated adaptive re-planning with a real server-side recommendation/path-generation service.

### P1: Assistant

1. Add a backend LLM service with authenticated, profile-scoped context.
2. Persist conversations and assistant feedback.
3. Add guardrails, response/error states, request cancellation, rate limits, and observability.
4. Ensure assistant recommendations link to real courses and can apply confirmed path changes.

### P2: Monetization and teams

1. Add Stripe or the selected billing provider.
2. Enforce Free, Plus, and Teams entitlements.
3. Build team skill matrices, role benchmark editing, manager reporting, and SSO if Teams remains in scope.

### P2: Quality and release readiness

1. Add route-level integration tests for onboarding, enrollment, completion, path adaptation, and assistant flows.
2. Add accessibility checks and keyboard/screen-reader testing.
3. Add responsive visual regression tests for desktop and mobile.
4. Add analytics, error monitoring, privacy/consent flows, and production environment configuration.
5. Verify all third-party course/provider claims, images, testimonials, pricing, and statistics before launch.

## Agent Working Rules

- Preserve the existing TanStack Router and provider structure unless there is a strong reason to change it.
- Keep domain logic in `src/lib` or data/repository modules rather than duplicating it inside route components.
- Preserve the existing responsive visual language and shared UI primitives.
- Prefer focused changes with a corresponding test or validation command.
- Do not treat simulated toasts or mock assistant replies as completed backend behavior.
- Before replacing mock data, define the API/data contract and keep a development fallback if needed.

## Immediate Next Task

The highest-value next implementation is to introduce a typed data-access layer and backend contract for learner profiles and generated paths. This creates a clean boundary for replacing `src/data/mock.ts` and `localStorage` without rewriting every route component.
