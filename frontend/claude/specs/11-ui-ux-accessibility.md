# UI, Responsive, and Accessibility Specification

## Preserve
The Lumina visual language, route structure, Tailwind tokens, Radix primitives, Lucide icons, responsive stacking, sticky desktop sidebars, mobile Sheet navigation, course/path cards, charts, and restrained AI accent all remain. Do not redesign pages or add a second design system.

## Current state
Desktop/tablet/mobile layouts are already present across landing, onboarding, roadmap, dashboard, course detail, and assistant. Semantic headings, labels, `aria-pressed`, Radix dialog/accordion/tab/select behavior, and visible text status badges exist. This is **PARTIAL** because dynamic state announcements, chart alternatives, skip navigation, reduced motion, and custom-control verification are absent.

## Required changes
- Add a skip-to-content link and a stable `id` on the main content container.
- Give onboarding generation, API fetches, mutations, assistant replies, upload processing, and adaptation summaries truthful `aria-busy`/`aria-live` announcements. Do not announce every token of a streamed response individually.
- Ensure every custom button has a visible focus indicator and an accessible name; feedback icon buttons must expose selected/pending/disabled state, not color alone.
- Add concise data-table or visually hidden text alternatives for `SkillRadar`, `SkillGapBars`, and `SkillTrend`; preserve chart legends for sighted users.
- Use semantic status text for locked, available, in-progress, completed, and feedback states. Check contrast in both light and dark themes.
- Add `prefers-reduced-motion` rules for pulse, bounce, hover transforms, smooth scrolling, and generation transitions. Reduced motion must not remove status information.
- Keep long goals, course titles, errors, and assistant messages within containers on narrow widths; test keyboard access to mobile Sheet, Tabs, Accordions, dialogs, sliders, and chat submission.
- Avoid adding explanatory instructional copy as a visual feature tour; labels and status text should serve the current workflow.

## Acceptance criteria
Core flows are usable with keyboard and screen reader semantics, dynamic changes are announced once, charts have equivalent text data, no state relies on color alone, and onboarding/roadmap/dashboard/course/assistant remain usable at mobile and tablet widths with no clipping or overlap.
