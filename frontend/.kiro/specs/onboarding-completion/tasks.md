# Implementation Plan: Onboarding Completion

## Overview

Wire the existing 5-step onboarding wizard to backend APIs using four pre-built hooks. All changes are confined to `src/routes/onboarding.tsx`. The implementation proceeds gap-by-gap, with each task building on the previous one and ending with everything integrated.

## Tasks

- [x] 1. Add upload state and wire `useUploadTranscript` + `useTranscriptStatus` into Step 3
  - Add `uploadStatus: UploadStatus`, `uploadId`, and `confirmedParsedCourseIds` state variables to the `Onboarding` component
  - Import and call `useUploadTranscript` and `useTranscriptStatus(uploadId)` hooks at the top of the component
  - Extract the existing inline `onChange` handler into a named `handleFileUpload` function; when `isApiEnabled` is `true`, call `uploadMutation.mutateAsync(file)`, set `uploadId` from the response, and set `uploadStatus` accordingly
  - Add a `useEffect` that watches `transcriptStatus.data?.status` and transitions `uploadStatus` to `"completed"` or `"failed"`; when `"failed"`, copy the `error` field to a local error string for display
  - Keep the existing CSV/TXT simulation branch (executed when `isApiEnabled` is `false`) identical to today
  - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8_

  - [ ]* 1.1 Write unit tests for upload state transitions
    - Test that `uploadStatus` becomes `"uploading"` then `"processing"` on successful upload mutation
    - Test that `uploadStatus` becomes `"failed"` and an error string is set when the mutation rejects
    - Test that the file input is disabled while `uploadStatus` is `"uploading"` or `"processing"`
    - _Requirements: 1.2, 1.7_

- [x] 2. Render parsed-courses confirmation UI in Step 3
  - When `uploadStatus === "completed"` and `transcriptStatus.data?.parsedCourses` is non-empty, render a list below the upload area showing each parsed course's `title` and `confidence` (formatted as a percentage)
  - Each parsed course entry must have a checkbox; checking it adds the course's `matchedCourseId` (or title as fallback) to `confirmedParsedCourseIds`
  - Add a "Confirm selected" button that merges `confirmedParsedCourseIds` into `priorCourses` state (deduplicating with existing selections)
  - When `uploadStatus === "failed"`, render the error message text and ensure manual course selection remains available
  - _Requirements: 1.4, 1.5, 1.6_

  - [ ]* 2.1 Write property test for parsed-courses display (P1)
    - **Property 1: Parsed courses are fully displayed**
    - **Validates: Requirements 1.4**
    - Generate arbitrary `parsedCourses[]` arrays with `fast-check`, render Step 3 in completed state, assert every title and confidence value appears in the output
    - Tag: `Feature: onboarding-completion, Property 1: Parsed courses are fully displayed`

  - [ ]* 2.2 Write property test for confirmed-courses state (P2)
    - **Property 2: Confirmed courses propagate to selection state**
    - **Validates: Requirements 1.6**
    - Generate arbitrary subsets of parsed course IDs, simulate the confirmation interaction, assert all confirmed IDs are present in `priorCourses`
    - Tag: `Feature: onboarding-completion, Property 2: Confirmed courses propagate to selection state`

- [x] 3. Checkpoint — ensure Step 3 tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add duplicate-generation notice to Step 5
  - At the top of the Step 5 section, check `profile.onboardingComplete`; if `true`, render a notice banner containing:
    - Text informing the learner a path has already been generated
    - A link to `/path/${pathIdForRole(selectedRole)}` (the existing mock path URL, or the stored path id if available)
    - A "Start over" button that, on click, calls a `handleStartOver` function
  - Implement `handleStartOver`: show a browser `confirm()` dialog; if confirmed, call `resetLearner()` from `useLearnerProfile` and clear `onboardingComplete` locally so generation can proceed
  - When the notice is shown and `onboardingComplete` is `true`, keep the "Generate my learning path" button disabled until the learner starts over
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.1 Write unit tests for duplicate-generation notice
    - Test that the notice banner renders when `profile.onboardingComplete` is `true`
    - Test that the "Generate" button is disabled when the notice is shown
    - Test that confirming "Start over" calls `resetLearner` and hides the notice
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Implement `buildProfilePayload` and `handleGenerate` for API-backed generation
  - Add a `generationError: string | null` state variable
  - Implement `buildProfilePayload()` as a pure function inside the component that maps wizard state to a `CreateProfileRequest` object with all 8 required fields
  - Import and call `useCreateProfile` and `useGeneratePath` hooks
  - Replace the existing inline `onClick` on the "Generate" button with a call to `handleGenerate`
  - In `handleGenerate`:
    - Clear `generationError`
    - If `isApiEnabled` is `false`, follow the existing path (call `updateProfile`, set `generating`, let the existing `useEffect` run the mock sequence)
    - If `isApiEnabled` is `true`:
      1. Call `createProfile.mutateAsync(buildProfilePayload())`; on error, set `generationError` and return (overlay must not open)
      2. Call `updateProfile({ ...wizardData, onboardingComplete: true })` on success
      3. Set `genStage(0)` and `setGenerating(true)` to show overlay
      4. Call `generatePath.mutateAsync({ profileId, profile })`; on success, navigate to `/path/${path.id}`; on error, dismiss overlay (`setGenerating(false)`), set `generationError`
  - Render `generationError` as an inline alert (`role="alert"`) at the top of the Step 5 section, above the summary dl, when non-null
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 5.1 Write property test for profile body completeness (P3)
    - **Property 3: Profile submission body contains all required fields**
    - **Validates: Requirements 2.1, 2.2**
    - Generate arbitrary combinations of wizard inputs with `fast-check`, call `buildProfilePayload`, assert all 8 required keys are present and non-undefined
    - Tag: `Feature: onboarding-completion, Property 3: Profile submission body contains all required fields`

  - [ ]* 5.2 Write property test for profileId threading (P4)
    - **Property 4: profileId is threaded from profile response to generate request**
    - **Validates: Requirements 2.3, 3.1**
    - Mock `useCreateProfile` to return an arbitrary `profileId` string, assert `useGeneratePath` receives `{ profileId: <same string> }` exactly
    - Tag: `Feature: onboarding-completion, Property 4: profileId is threaded from profile response to generate request`

  - [ ]* 5.3 Write property test for navigation target (P5)
    - **Property 5: Navigation target matches the returned path id**
    - **Validates: Requirements 3.3**
    - Mock `useGeneratePath` to return an arbitrary `{ id }`, assert `navigate` is called with `{ to: "/path/$id", params: { id: <same value> } }`
    - Tag: `Feature: onboarding-completion, Property 5: Navigation target matches the returned path id`

  - [ ]* 5.4 Write unit tests for generation error handling
    - Test that `generationError` alert is visible and overlay is never shown when profile save fails
    - Test that overlay is dismissed and `generationError` alert is visible when path generation fails
    - Test that the offline branch calls `updateProfile` and enters the mock generation sequence
    - _Requirements: 2.4, 2.5, 3.4, 3.5_

- [x] 6. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All changes are confined to `src/routes/onboarding.tsx`; existing hooks require no modification
- The `isApiEnabled` guard must wrap every API call — the simulated paths must remain bitwise-identical to today's behavior
- `fast-check` is already installed and used in `src/hooks/*.test.ts`; use the same patterns
- Minimum 100 iterations per property-based test
