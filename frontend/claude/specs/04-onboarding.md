# Onboarding Completion Specification

## Current State

The onboarding wizard at `/onboarding` (`src/routes/onboarding.tsx`, ~26.5KB) is the most complete feature in the prototype. It implements a 5-step wizard with the following flow:

```
Step 1: Your Goal
  → Role pill selection (6 roles: ML Engineer, Data Analyst, Full-Stack Developer, Data Scientist, Product Manager, UX Designer)
  → Goal textarea (4 rows)
  → Validation: role !== "" || goalText.trim().length > 8

Step 2: Skill Level
  → 5 skill sliders (Python, Statistics, ML, SQL, Web Dev)
  → 3-position sliders (0=Beginner, 1=Intermediate, 2=Advanced)
  → Dynamic level badges

Step 3: Prior Learning
  → File upload area (PDF/CSV) — SIMULATED (only captures filename)
  → Course search + checkbox selection from 20 mock courses
  → Selected count indicator

Step 4: Preferences
  → Hours slider (2-25 hrs/week)
  → Format multi-select pills (Video, Reading, Projects, Quizzes)
  → Pace radio group (Relaxed, Steady, Intensive)

Step 5: Summary & Generation
  → Summary <dl> list of all captured data
  → "Lumi's read" AI recommendation box
  → "Generate my learning path" button
  → 4-stage generation overlay with progress
```

## Status: PARTIAL

The wizard UI is fully functional. The gaps are:

### Gap 1: Transcript Upload is Simulated

**Current behavior**: File input captures filename only. Displays hardcoded "Parsed 14 completed courses from your transcript" regardless of file content. Stores filename in local state `uploadName` but never processes the file.

**Required behavior**:

```
User selects file
  → Show file name + size
  → Upload to backend (POST /api/v1/profile/transcript)
  → Show upload progress bar
  → Backend returns uploadId + status: "processing"
  → Show "Analyzing transcript..." with spinner
  → Poll GET /api/v1/profile/transcript/:uploadId every 2 seconds
  → On completion:
      → Display parsed courses with confidence scores
      → Display parsed skills with inferred levels
      → User can check/uncheck each parsed item
      → Confirmed courses merge into `completedCourses`
      → Confirmed skills update `skillLevels`
  → On failure:
      → Show error message
      → Allow re-upload
      → Manual course selection remains available as fallback
```

**Implementation approach**: Extend the existing Step 3 section in `onboarding.tsx`. Add states:
- `uploadStatus: "idle" | "uploading" | "processing" | "completed" | "failed"`
- `uploadProgress: number` (0-100)
- `parsedResults: TranscriptStatusResponse | null`
- `confirmedParsedCourses: string[]`

When `VITE_API_BASE_URL` is not set, keep the current simulated behavior as fallback.

**Files to modify**: `src/routes/onboarding.tsx`
**New files**: None (use api-client from architecture spec)

---

### Gap 2: Path Generation is Simulated

**Current behavior**: Clicking "Generate my learning path" triggers a setTimeout sequence (700ms × 4 stages). Uses `matchRole()` regex to select a role, then `pathIdForRole()` to pick from 3 static templates, then navigates to `/path/$id`.

**Required behavior**:

```
User clicks "Generate my learning path"
  → Save profile to backend (POST /api/v1/profile)
  → Request path generation (POST /api/v1/paths/generate)
  → Show existing 4-stage generation overlay
  → If backend supports progress events (SSE), update stages from server
  → If not, run existing client-side stage animation (cosmetic)
  → On generation complete:
      → Receive path ID and data
      → Navigate to /path/{id}
  → On failure:
      → Dismiss generation overlay
      → Show error alert on Step 5
      → Allow retry
      → Do NOT navigate away
```

**Implementation approach**:
- Replace the `setTimeout` chain in the `generate()` function with an actual API call.
- Keep the generation overlay UI exactly as is (it's well-designed).
- Add error handling state: `generationError: string | null`
- Add idempotency guard: disable button and track `generating` state to prevent double-submit (already partially done with `generating` useState).

**Files to modify**: `src/routes/onboarding.tsx`

---

### Gap 3: No Duplicate Generation Prevention

**Current behavior**: The `generating` state prevents the button from being clicked again during animation, but there's no idempotency token. If the user navigates back and clicks generate again, a new path would be generated.

**Required behavior**: After successful generation, store the generated path ID. If user returns to onboarding, either:
- Show "You've already generated a path" with link to it, OR
- Allow re-generation with confirmation dialog ("This will replace your current path")

**Implementation approach**: Check `profile.onboardingComplete` at the top of the onboarding route. If true, show a message with links to the existing path and an option to start over.

**Files to modify**: `src/routes/onboarding.tsx`

---

### Gap 4: Profile Submission to Backend

**Current behavior**: Profile data is saved to localStorage only. The `generate()` function calls `updateProfile()` with all wizard state, which saves to `lumina-learner` localStorage key.

**Required behavior**: Before or during path generation, submit the complete profile to the backend.

**Implementation approach**: The `generate()` function should:
1. Call `updateProfile()` for local state (keep existing behavior)
2. Call `POST /api/v1/profile` with all wizard data
3. Use the returned `profileId` for path generation request
4. If profile save fails, show error and don't proceed to generation

---

### Gap 5: Validation Enhancement

**Current state**: Only Step 1 has validation (`canAdvance = step !== 1 || role !== "" || goalText.trim().length > 8`).

**What's missing**:
- Step 2: No minimum requirement. Learner can skip all skill assessments at 0 (Beginner). This is acceptable — beginner across all skills is a valid state.
- Step 3: No validation needed. Prior learning is optional.
- Step 4: Hours slider has range constraint (2-25). Pace radio has no default — but `profile.pace` defaults to "steady" from the provider. This is acceptable.
- Step 5: No validation beyond the button guard.

**Assessment**: Current validation is **sufficient** for the wizard. No changes needed.

---

### Gap 6: Back Navigation Preservation

**Current state**: Wizard allows back navigation. Each step reads from local React state that persists across steps within the same page load.

**Assessment**: **COMPLETE**. State is preserved in React `useState` hooks during the session. If user refreshes, state resets — but profile data in localStorage is used to pre-populate initial values.

---

## Items Already Complete (Do Not Modify)

- [x] Step navigation and progress bar
- [x] Left stepper sidebar (desktop)
- [x] Role pill selection with toggle
- [x] Goal textarea with character validation
- [x] 5 skill assessment sliders with level badges
- [x] Course search and multi-select checkboxes
- [x] Hours slider with dynamic badge
- [x] Format multi-select pills
- [x] Pace radio group
- [x] Summary review with all data displayed
- [x] "Lumi's read" AI recommendation box
- [x] Generation overlay with 4-stage progress
- [x] Responsive layout (stepper hidden on mobile)
- [x] Accessibility (labels, aria-pressed, sr-only, semantic HTML)
- [x] Mobile step counter

## Acceptance Criteria

1. Learner completes all 5 steps with valid data
2. Profile is submitted to backend (when available) with all captured fields
3. Transcript upload processes real files (when backend supports it) with progress, parsed results, and confirmation flow
4. Path generation calls backend API (when available) with proper loading, error, and retry states
5. Duplicate generation is prevented or requires confirmation
6. When backend is unavailable, current simulated behavior works identically
7. All existing wizard UX, animations, and responsive behavior preserved
