# Acceptance Criteria and Definition of Done

## End-to-end acceptance scenarios

### 1. New learner
From `/`, a learner enters a natural-language goal, completes goal/role, skill level, previous learning, availability, formats, pace, interests/objectives where supported, reviews the profile, and generates a path. The generated response, not the client regex/template, determines the path in API mode. Errors keep the learner on the review step with retry.

### 2. Follow the roadmap
From dashboard, the learner can identify current position, completed work, improved skills, current milestone, next recommended action, and its reason. Opening a course/project/assessment preserves path context. Completing a node updates status, prerequisites, progress, milestone state, remaining time, and dashboard next action from returned or explicitly offline data.

### 3. Give feedback and adapt
The learner submits difficulty/relevance/fit feedback with optional comment. The UI shows pending state. `Feedback submitted` is distinct from `Path successfully recalculated`. If the backend returns an adapted path, the UI shows the returned changes and new next action; if not, the old path remains unchanged. Errors preserve old data and allow retry.

### 4. Ask Lumi
The learner can use `/assistant` or the global widget to ask what to learn next, why something was recommended, whether to skip, difficulty/pace questions, project alternatives, and goal proximity. Responses are rendered from backend message metadata, can link to resources or roadmap, and failures can be retried without duplicated messages.

### 5. API failure and recovery
For each connected read/write, failure produces a meaningful inline/toast state, retry, and a fallback route where appropriate. Cached/entered data is not silently corrupted. Unauthorized responses have a clear session action when authentication is enabled. Mock mode remains usable without pretending it is backend data.

### 6. Mobile
At mobile and tablet widths, onboarding, roadmap sequence/prerequisites, dashboard next action, course details, assistant input/history, feedback controls, and navigation remain operable with no clipped text or horizontal overflow.

## Requirement traceability
- Goal input: complete locally; API persistence/classification is backend-dependent.
- Profile capture: skills, prior course selection, hours, formats, pace, role, and goal exist; explicit interests/objectives and durable experience/transcript review require enhancement.
- Recommendations: course/project/assessment presentation and reasons exist; real ranking/content is backend-dependent.
- Personalized path: timeline, milestones, prerequisites, progress, statuses, and reasons exist; server generation and adaptation integration remain.
- AI explanations/assistant: UI exists; real responses, referenced actions, errors, and persistence/streaming are backend-dependent integration work.
- Progress: charts/tracker/next actions exist; live skill history, activity, time spent, and goal-proximity data require backend data.
- Adaptation: controls exist; feedback submission, returned path replacement, and change explanation remain.

## Definition of Done
- All remaining PARTIAL/MISSING items in `00-frontend-audit.md` and `01-product-requirements.md` are implemented without rewriting working routes/components.
- API client, typed contracts/adapters, query reads, and mutation writes are centralized as specified in `02-frontend-architecture.md`; routes do not scatter raw `fetch` calls.
- Mock fallback remains available and existing local behavior is preserved where backend data is unavailable.
- Onboarding, roadmap/progress, recommendation explanation, assistant, transcript, feedback/adaptation, dashboard, course discovery, responsive, and accessibility scenarios pass.
- Loading, empty, error, retry, unauthorized, partial-data, pending, and success states are covered for connected surfaces.
- Backend ownership is respected: no recommendation algorithm, LLM, persistence, transcript parsing, authentication, database, or skill-gap computation is reimplemented in the frontend.
- Existing tests pass; focused tests cover new contracts and mutations; typecheck/lint/build pass.
- No duplicated provider/state/recommendation system, unnecessary design-system replacement, or unrelated refactor is introduced.
