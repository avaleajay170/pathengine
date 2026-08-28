# Product Requirements Traceability Matrix

## Problem Statement

> AI-Powered Personalized Learning Path Recommender: Design and prototype an AI-powered solution that delivers personalized learning experiences based on an individual's needs, interests, learning patterns, and goals.

## Requirement-by-Requirement Audit

### A. Conversational Goal Input

> "Allow learners to describe goals in natural language."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Natural language goal input on landing page | Hero section has `<Input>` with placeholder, saves to `profile.goal` and navigates to `/onboarding` on submit. Validates `goal.trim()` before saving. | **COMPLETE** | None | `src/routes/index.tsx` |
| Natural language goal input in onboarding | Step 1 has `<Textarea id="goal">` (4 rows) for goal description alongside role pill selection | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Goal validation | Landing: checks `goal.trim()`. Onboarding Step 1: `canAdvance` requires `role !== "" || goalText.trim().length > 8` | **COMPLETE** | None | `src/routes/index.tsx`, `src/routes/onboarding.tsx` |
| Goal editing capability | Onboarding allows back-navigation to Step 1 to edit goal. Profile sidebar on assistant page displays current goal. | **PARTIAL** | No way to edit goal AFTER onboarding is complete without resetting profile. Add goal edit capability on dashboard or path page. | `src/routes/onboarding.tsx`, `src/routes/assistant.tsx` |
| Goal persistence | Saved to `profile.goal` in localStorage via LearnerProfileProvider | **COMPLETE** (client-side) | Will need backend persistence when API is available | `src/lib/learner-profile.tsx` |
| Goal handoff to path generation | Onboarding Step 5 uses `matchRole(role, goalText)` regex classifier → `pathIdForRole(selectedRole)` → `generateLearningPath(profile)` → navigates to `/path/$id` | **PARTIAL** | `matchRole` is a basic regex, not NLP. Frontend currently uses this to select from 3 static path templates. When backend provides real path generation, frontend must call API instead of local heuristic. | `src/routes/onboarding.tsx`, `src/lib/learning-path.ts` |

### B. Learner Profile Capture

> "Capture learner interests, experience/skill level, completed courses, and objectives."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Interests capture | Role pills in onboarding Step 1 (ML Engineer, Data Analyst, Full-Stack Developer, Data Scientist, Product Manager, UX Designer). No explicit "interests" field beyond role and goal text. | **PARTIAL** | Consider adding an interests/topics multi-select in onboarding or allowing the goal text to serve as interests input. The current role pills partially capture interest area but are limited to 6 predefined roles. | `src/routes/onboarding.tsx` |
| Skill level assessment | Onboarding Step 2: 5 skills (Python, Statistics, ML, SQL, Web Dev) with 3-position sliders (Beginner/Intermediate/Advanced). Stored in `profile.skillLevels` as `Record<string, number>` (0/1/2). | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Experience level | Derived from skill self-assessment. No explicit "years of experience" or "current role" field. | **PARTIAL** | The skill sliders capture this implicitly. A brief "current experience" field could strengthen the profile but is not strictly required. | `src/routes/onboarding.tsx` |
| Completed courses | Onboarding Step 3: searchable checkbox list from 20 mock courses. Stored in `profile.completedCourses[]`. | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Transcript upload | Onboarding Step 3: File upload drop area accepts PDF/CSV. **Only captures filename.** Displays hardcoded "Parsed 14 completed courses from your transcript". | **PARTIAL** | Frontend needs: upload progress state, processing indicator, backend response with parsed courses, learner review/confirm/reject UI for extracted data. Currently entirely simulated. | `src/routes/onboarding.tsx` |
| Objectives capture | Goal text + target role selection captures objectives. | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Weekly availability | Onboarding Step 4: Slider 2-25 hrs/week. Stored in `profile.hoursPerWeek`. | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Learning format preferences | Onboarding Step 4: Multi-select pills (Video, Reading, Projects, Quizzes). Stored in `profile.preferredFormats[]`. | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Learning pace | Onboarding Step 4: Radio group (Relaxed/Steady/Intensive). Stored in `profile.pace`. | **COMPLETE** | None | `src/routes/onboarding.tsx` |
| Profile review | Onboarding Step 5: Summary `<dl>` displaying all captured data with "Lumi's read" AI recommendation box. | **COMPLETE** | None | `src/routes/onboarding.tsx` |

### C. Recommendation Engine UI

> "Recommend relevant courses, projects, and learning resources."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Course recommendations display | Path nodes include courses with title, duration, skills, description, reason. Dashboard "Next Recommended Actions" shows top 3 actionable nodes. Landing shows 6 courses. Explore shows all 20. | **COMPLETE** | None — UI is ready for backend-provided recommendations | `src/routes/path.$id.tsx`, `src/routes/dashboard.tsx`, `src/routes/index.tsx`, `src/routes/explore.tsx` |
| Project recommendations | Path nodes support `kind: "project"` with wrench icon. Mock data includes project nodes (e.g., `capstone-ml`). | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/data/mock.ts` |
| Assessment recommendations | Path nodes support `kind: "assessment"` with flask icon. | **COMPLETE** | None | `src/components/PathNode.tsx` |
| Recommendation reason display | PathNode has collapsible "Why Lumi placed this here" drawer showing `node.reason`. CourseCard has "Why this?" button. Course detail has "Why this is in your path" AI callout. | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/components/CourseCard.tsx`, `src/routes/course.$id.tsx` |
| Skill addressed per recommendation | Each PathNode and CourseCard displays skill badges from the course/node `skills[]` array. | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/components/CourseCard.tsx` |
| Prerequisite relationship display | PathNode shows prerequisites via tooltip. Course detail has prerequisite checklist with completion status (check/lock icons). Locked nodes show lock icon. | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/routes/course.$id.tsx` |
| Relevance to learner goal | Path header shows goal. Node reasons reference goal alignment. Dashboard shows goal with target icon. | **COMPLETE** | None | `src/routes/path.$id.tsx`, `src/routes/dashboard.tsx` |

### D. Personalized Learning Path

> "Generate a personalized learning path with prerequisites and milestones."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Path generation | Onboarding Step 5 triggers `generateLearningPath(profile)` after 4-stage simulated animation. Uses `matchRole()` regex to select from 3 static templates, then dynamically calculates statuses. | **PARTIAL** | Generation is currently client-side template selection. Frontend needs to call backend API for real generation and handle async response. The generation loading UI already exists and is well-designed. | `src/routes/onboarding.tsx`, `src/lib/learning-path.ts` |
| Sequence visualization | Vertical timeline with milestone stages, ordered nodes, prerequisite gates, and continuous vertical line connector. | **COMPLETE** | None | `src/routes/path.$id.tsx` |
| Prerequisites display | Nodes show `requires` prerequisites in tooltip. Locked nodes display lock icon. Prerequisite gating logic enforced in `generateLearningPath()`. | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/lib/learning-path.ts` |
| Milestone structure | Paths divided into milestone stages (e.g., Foundations → Core → Specialization → Capstone). Each milestone has title, summary, and ordered nodes. MilestoneTracker component shows checklist. | **COMPLETE** | None | `src/routes/path.$id.tsx`, `src/components/MilestoneTracker.tsx` |
| Estimated time | Path header shows total weeks and weekly hours. Each node shows duration. Progress panel shows remaining hours. ETA calculation with calendar icon. | **COMPLETE** | None | `src/routes/path.$id.tsx` |
| Progress tracking | Progress %, completed/total steps, remaining hours. Progress bar. Node statuses: completed/in-progress/available/locked. | **COMPLETE** | None | `src/routes/path.$id.tsx`, `src/lib/learning-path.ts` |
| Current position indicator | Active node highlighted ("Active now: {title}"). In-progress nodes show blue play icon. | **COMPLETE** | None | `src/routes/path.$id.tsx` |
| Node status states | 4 states: completed (green check), in-progress (blue play), available (outline circle), locked (lock icon). All visually distinct. | **COMPLETE** | None | `src/components/PathNode.tsx` |

### E. AI Explanation ("Why this?")

> "Explain why recommendations were made."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| "Why this?" on course cards | CourseCard has "Why this?" button that calls `explain()` in AssistantProvider. Opens assistant with contextual prompt about the course. | **COMPLETE** | Currently generates explanation client-side with heuristic math. When backend is available, `explain()` should call API. | `src/components/CourseCard.tsx` |
| "Why this?" on path nodes | PathNode has "Why this?" button and collapsible "Why Lumi placed this here" drawer showing `node.reason` text. | **COMPLETE** | `node.reason` is currently authored in mock data. Backend should provide real reasoning. Frontend rendering is ready. | `src/components/PathNode.tsx` |
| "Why this?" on course detail | Course detail sidebar has "Why this is in your path" AI callout showing path location, milestone, and reasoning text. "Ask Lumi about this" button opens assistant. | **COMPLETE** | None | `src/routes/course.$id.tsx` |
| Explanation via assistant | `explain({ title, reason, courseId })` opens assistant and sends contextual question. Assistant responds with keyword-matched explanation. | **PARTIAL** | Response is keyword-matched mock. Backend LLM integration needed for real explanations. Frontend transport (send → receive → render) is ready. | `src/lib/assistant.tsx` |

### F. AI Assistant

> "Answer learner questions through an AI assistant."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Full-page assistant | `/assistant` route with chat thread, input, suggestions, context sidebar (goal, skill gaps, completed courses) | **COMPLETE** | None | `src/routes/assistant.tsx` |
| Global chat widget | Floating bottom-right button, overlay chat card, maximize to full page, auto-hide on `/assistant` | **COMPLETE** | None | `src/components/ChatWidget.tsx` |
| Contextual responses | Keyword regex matcher covers: statistics reasoning, backend switching, pace adjustment, too-easy feedback, next recommendations, goal overview | **PARTIAL** | Responses are hardcoded patterns. Backend LLM integration needed. Frontend message flow (send → thinking indicator → receive → render with course cards and milestone chips) is ready. | `src/lib/assistant.tsx`, `src/components/Chat.tsx` |
| Course cards in responses | `MiniCourseCard` renders interactive course links inside assistant bubbles | **COMPLETE** | None | `src/components/Chat.tsx` |
| Milestone chips in responses | `MilestoneChip` renders milestone alerts inside assistant bubbles | **COMPLETE** | None | `src/components/Chat.tsx` |
| Thinking indicator | 3 bouncing dots with "Lumi is reasoning over your path…" | **COMPLETE** | None | `src/components/Chat.tsx` |
| Suggested prompts | 4 quick-action chips: "Why was this course recommended?", "I want to switch to backend development", "Adjust my pace", "What should I do next?" | **COMPLETE** | None | `src/components/Chat.tsx` |
| Empty conversation state | Shows suggested prompts when no messages exist | **COMPLETE** | None | `src/components/Chat.tsx` |
| Error state for assistant | **None** — no error handling if assistant response fails | **MISSING** | Add error state for failed responses, retry capability, and error message bubble | `src/lib/assistant.tsx`, `src/components/Chat.tsx` |
| Streaming responses | Not implemented | **BACKEND-DEPENDENT** | When backend provides streaming, frontend needs to handle SSE/WebSocket token-by-token rendering | `src/lib/assistant.tsx`, `src/components/Chat.tsx` |

### G. Adaptation Based on Feedback

> "Adapt recommendations based on learner feedback and progress."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Feedback collection on nodes | PathNode has thumbs up ("Good fit") and thumbs down ("Too easy") buttons. Calls `submitNodeFeedback(nodeId, { rating, comment })`. | **COMPLETE** | None | `src/components/PathNode.tsx` |
| Difficulty feedback | PathNode thumbs down + path sidebar "Too easy" / "Too hard" buttons | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/routes/path.$id.tsx` |
| Relevance feedback | PathNode thumbs up/down + path sidebar "Not interested" button | **COMPLETE** | None | `src/components/PathNode.tsx`, `src/routes/path.$id.tsx` |
| Pace adjustment | Path sidebar has 3 adaptation buttons: Too easy (→ fast pace), Too hard (→ slow pace), Not interested (→ swap node). Also via assistant "Adjust my pace". | **PARTIAL** | Adaptation is entirely simulated with setTimeout and static toast messages. No real path recalculation. Frontend needs to: 1) submit feedback to backend, 2) receive updated path, 3) re-render path with changes, 4) clearly indicate what changed. | `src/routes/path.$id.tsx`, `src/components/PathNode.tsx` |
| Visual indication of path changes | Currently shows sequential toast messages ("Compressed 3 overlapping modules", "New ETA: Oct 2025") but path does NOT actually change visually. | **PARTIAL** | Frontend must visually diff the old vs new path state after backend re-planning. Highlight added/removed/reordered nodes. Show "Path updated" confirmation with changelog. | `src/routes/path.$id.tsx` |
| Updated recommendations after feedback | Not implemented — feedback is stored locally but never triggers recommendation refresh | **MISSING** | After backend processes feedback: 1) poll or receive updated path, 2) update local state, 3) re-render affected nodes, 4) update dashboard next actions | `src/routes/path.$id.tsx`, `src/routes/dashboard.tsx` |

### H. Progress Visualization

> "Visualize progress, skill development, milestones, and next recommended actions."

| Requirement | Current Implementation | Status | Remaining Frontend Work | Relevant Files |
|-------------|----------------------|--------|------------------------|----------------|
| Overall progress | Dashboard metric card with %, mini progress bar, steps count. Path header with progress bar and remaining hours. | **COMPLETE** | None | `src/routes/dashboard.tsx`, `src/routes/path.$id.tsx` |
| Skill development visualization | SkillRadar (radar chart: current vs 80% target), SkillGapBars (bar chart: current vs target per skill), SkillTrend (line chart: 6-month progression) | **COMPLETE** | SkillTrend data is static mock. When backend provides real skill history, plug into chart. | `src/components/SkillChart.tsx` |
| Milestone tracking | MilestoneTracker component shows completed/in-progress/pending milestones. Used on dashboard sidebar and path page sidebar. | **COMPLETE** | None | `src/components/MilestoneTracker.tsx` |
| Next recommended actions | Dashboard shows top 3 actionable/upcoming nodes with kind icons, status badges, skills, and action buttons. | **COMPLETE** | None | `src/routes/dashboard.tsx` |
| Recent activity | Dashboard shows 5-item activity timeline with timestamps and descriptions. | **PARTIAL** | Activity is hardcoded mock data. Needs backend activity feed. Frontend rendering is ready. | `src/routes/dashboard.tsx` |
| Goal proximity indicator | Dashboard header shows goal text and ETA date. Path header shows ETA with calendar icon. | **PARTIAL** | No explicit "X% to goal" or visual progress toward the stated career goal (distinct from path completion %). Consider adding goal proximity indicator. | `src/routes/dashboard.tsx`, `src/routes/path.$id.tsx` |

### I. Responsive UX

| Requirement | Status | Notes |
|-------------|--------|-------|
| Desktop layouts | **COMPLETE** | Multi-column grids throughout |
| Tablet layouts | **COMPLETE** | Reduced columns, responsive breakpoints |
| Mobile layouts | **COMPLETE** | Single column stacking, sheet drawer nav |
| Mobile onboarding | **COMPLETE** | Stepper sidebar hidden, step counter visible |
| Mobile roadmap | **COMPLETE** | Sidebar stacks below timeline |
| Mobile dashboard | **COMPLETE** | Metrics stack, sidebar below main content |
| Mobile course detail | **COMPLETE** | Sidebar stacks below tabs |
| Mobile assistant | **COMPLETE** | Context sidebar hidden, bot avatar shown |
| Mobile navigation | **COMPLETE** | Sheet drawer with all links |

### J. Accessibility

| Requirement | Status | Notes |
|-------------|--------|-------|
| Keyboard navigation | **PARTIAL** | Radix primitives handle it. Custom interactions (PathNode expand, feedback buttons) need keyboard testing. |
| Focus states | **PARTIAL** | Tailwind ring utilities present. Need to verify all interactive elements have visible focus indicators. |
| Semantic headings | **COMPLETE** | Proper h1/h2/h3 hierarchy on all pages. |
| Form labels | **COMPLETE** | `<label htmlFor>` on onboarding forms. `aria-label` on search inputs. |
| ARIA on dialogs | **COMPLETE** | Radix Dialog/Sheet/Accordion handle ARIA automatically. |
| ARIA on custom widgets | **PARTIAL** | `aria-pressed` on toggles. Missing `aria-live` for dynamic updates. |
| Chart accessibility | **MISSING** | No text alternatives for Recharts visualizations. Screen readers cannot access chart data. |
| Color contrast | **PARTIAL** | OKLCH tokens designed for contrast. Color-only status indicators on nodes need verification. |
| Reduced motion | **MISSING** | No `prefers-reduced-motion` media query. Animations on generation overlay, bouncing dots, and pulse effects run unconditionally. |
| Skip navigation | **MISSING** | No skip-to-content link. |
| Live regions | **MISSING** | No `aria-live` for toast notifications, assistant messages, or path adaptation results. |

## Implementation Priority Summary

### Already Complete (Do Not Rebuild)
1. All route structures and navigation
2. Landing page with goal input
3. 5-step onboarding wizard UI
4. Learning path timeline with milestones, nodes, prerequisites
5. Course discovery with search and filters
6. Course detail with tabs, enrollment, AI reasoning
7. Dashboard with metrics, charts, next actions
8. Assistant UI with chat thread, suggestions, course cards
9. Global chat widget
10. Responsive layouts
11. Theme switching
12. Error/404 screens
13. Toast system
14. All reusable components
15. All UI primitives

### Partially Complete (Extend)
1. **Goal editing post-onboarding** — Add edit capability
2. **Transcript handling** — Build real upload/parse/review flow
3. **Adaptation feedback loop** — Connect to backend, show real changes
4. **Assistant responses** — Prepare for backend LLM integration
5. **Activity feed** — Connect to backend telemetry
6. **Skill trend data** — Connect to backend history
7. **Accessibility gaps** — Skip nav, aria-live, chart alternatives, reduced motion

### Missing (Must Implement)
1. **API integration layer** — Hooks/repository pattern for backend calls
2. **Loading states for backend-connected screens** — Skeleton/spinner states
3. **Error states for API failures** — Meaningful error UI with retry
4. **Assistant error handling** — Failed response state
5. **Path adaptation confirmation** — Distinct "feedback submitted" vs "path recalculated" states
6. **Streaming assistant responses** — Token-by-token rendering when backend supports it

### Backend-Dependent (Frontend Prepares, Backend Implements)
1. Real path generation via LLM
2. Real assistant responses via LLM
3. Real transcript parsing
4. Real adaptive re-planning
5. User authentication
6. Cloud profile persistence
7. Real activity telemetry
8. Real skill history tracking
9. Real course search (server-side)
10. Real review system
