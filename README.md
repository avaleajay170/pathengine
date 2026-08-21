# Path Finder AI

Build a professional, Coursera-inspired web app frontend for an AI-Powered Personalized Learning Path Recommender. This is a hackathon prototype, so use realistic mock/dummy data throughout (no real backend needed yet, but structure state/data so it's easy to swap in real APIs later). Use React + Tailwind CSS + shadcn/ui components. Prioritize a clean, trustworthy, edtech aesthetic — generous whitespace, soft shadows, rounded cards, a confident color system, and smooth micro-interactions.

Design System

Primary color: deep blue (#0056D2-ish, Coursera-like) with a secondary accent (teal or violet) for AI/assistant elements to visually distinguish "AI" moments from static content.

Neutral grays for backgrounds, dark slate for text.

Font: a clean sans-serif (Inter or similar), clear type hierarchy (large bold headings, readable body text).

Rounded-xl cards, subtle hover elevation, consistent 8px spacing grid.

Include a light/dark mode toggle if feasible, but light mode is the priority.

Pages / Routes to Build

1. Landing Page (/)

Sticky top navbar: logo, nav links (Explore Courses, Paths, Dashboard, Pricing/About), Sign In / Get Started buttons.

Hero section: bold headline about AI-personalized learning, subheading, a prominent CTA input like "What do you want to learn today?" (this doubles as the entry point into the conversational goal-setting flow) plus a "Get my learning path" button.

Trust strip: logos or stats (e.g., "10,000+ learners", "500+ courses", "98% goal completion").

Explore Courses section: a searchable/filterable grid of course cards (title, provider/instructor, thumbnail, rating, level tag, duration, price/free badge). Include category filter chips (Data Science, Web Dev, AI/ML, Design, Business, etc.) and a search bar.

Featured Learning Paths section: horizontally scrollable cards showing pre-built paths (e.g., "Become a Data Analyst") with number of courses, estimated duration, and skill level.

"How it works" 3-4 step visual section explaining: Tell us your goal → AI analyzes your profile → Get a personalized roadmap → Track progress.

Testimonials/social proof section.

Footer with links, socials, newsletter signup.

2. Onboarding / Learner Profiling Flow (/onboarding)

Multi-step wizard (progress bar at top) capturing the learner profiling engine:

Step 1: Career goal / interest selection (chips + free text field for natural language goal input, e.g., "I want to become a machine learning engineer in 6 months").

Step 2: Current skill level self-assessment (beginner/intermediate/advanced per relevant skill, shown as sliders or radio cards).

Step 3: Prior learning history — let user tag/select completed courses or upload a "learning history" (mock file upload + a searchable multiselect of common courses).

Step 4: Learning preferences — time availability per week, preferred content format (video, reading, hands-on projects), pace.

Step 5: Summary screen showing an "AI is generating your path..." animated loading state, then redirect to the Path page.

3. Conversational AI Assistant (persistent + dedicated view)

A floating chat bubble available on every page (bottom-right) that opens a chat panel — this is the conversational interface for describing goals in natural language and asking questions.

Also build a dedicated /assistant full-page chat view with a clean chat UI: message bubbles, suggested prompt chips ("Why was this course recommended?", "I want to switch to backend development", "Adjust my pace"), typing indicator, and inline rich responses (e.g., the assistant can render a mini course-card or milestone-card directly inside a chat message when explaining a recommendation).

Every recommended course/step anywhere in the app should have a small "Why this?" button that opens the assistant with a pre-filled explanation bubble (mock a reasoning explanation referencing the learner's goal, skill gap, and prior courses).

4. Learning Path / Roadmap Page (/path/:id)

The core path generator visualization:

Header: path title, goal description, overall progress %, estimated completion date, "Adjust path" button.

Vertical/timeline roadmap UI showing stages grouped by milestone (e.g., "Foundations" → "Core Skills" → "Specialization" → "Capstone Project"), with:

Course/project/assessment nodes as cards, connected by a visual path line.

Status indicators per node: locked (prerequisite not met), available, in-progress, completed.

Prerequisite tooltips ("Requires: Python Basics").

Each node expandable to show description, duration, skills gained, and a "Why recommended" link.

Sidebar: skill-gap radar/bar chart (current vs. target skill levels), milestone checklist, "adapt my path" feedback control (e.g., thumbs up/down or "too easy / too hard / not interested" buttons per node feeding into an "adapting..." toast/animation).

5. Dashboard (/dashboard)

Top summary cards: overall progress %, current streak, hours learned, skills mastered.

Skill development chart (radar or bar chart comparing skills over time / vs. goal).

Milestone timeline/progress tracker.

"Next recommended actions" list (2-3 upcoming courses/tasks with quick-start buttons).

Recent activity feed.

Course-in-progress cards with progress bars and "Continue" buttons.

6. Course Detail Page (/course/:id)

Course hero (title, provider, rating, level, duration, price/free).

Tabs: Overview, Syllabus, Reviews.

Sidebar: "Why this is in your path" AI explanation card, prerequisites, related courses.

Enroll / Add to Path button.

Cross-Cutting Requirements

Use realistic dummy data for at least 15-20 courses across 4-5 categories, 2-3 sample learning paths, and a sample learner profile.

All AI-generated content (recommendations, explanations, chat replies) should be clearly mocked with believable, specific-sounding text (reference the learner's stated goal and skill gaps) rather than generic placeholder text.

Responsive design: must look polished on both desktop and mobile.

Use icons (lucide-react) consistently for skills, categories, and status indicators.

Add subtle loading/skeleton states wherever "AI is thinking" would realistically occur.

Keep component structure modular (Navbar, CourseCard, PathNode, ChatWidget, SkillChart, MilestoneTracker, etc.) so it's easy to extend.

Build this as a multi-page app with working navigation between all routes described above. Start with the Landing Page and Learning Path page as the highest-fidelity screens since they'll make the strongest first impression, then fill in the rest.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pathcraft-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3d377097-1779-48cf-8b26-02b1f911ee2a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
