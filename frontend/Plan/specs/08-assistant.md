# Assistant Experience Specification

## Current State

The assistant ("Lumi") has two interfaces:
1. **Full-page**: `/assistant` (`src/routes/assistant.tsx`, ~5.7KB)
2. **Global widget**: `ChatWidget` (`src/components/ChatWidget.tsx`, ~2.2KB)

Both share the `ChatThread` component (`src/components/Chat.tsx`, ~5.2KB) and the `AssistantProvider` context (`src/lib/assistant.tsx`, ~6.7KB).

### Full-Page Assistant (`/assistant`)
- Context sidebar (desktop only, `hidden lg:block w-72`):
  - Lumi identity card (avatar, description)
  - Your Goal card (goal text, weekly hours badge, progress badge, "Open roadmap" button)
  - Widest Skill Gaps card (top 3 skill gaps with percentages)
  - Already Credited card (completed course links)
- Chat interface card:
  - Header with title, tracked skills/courses count, prototype badge
  - ChatThread (shared with widget)

### Global Widget
- Bottom-right floating trigger button ("Ask Lumi")
- Overlay card (560px height, `w-[min(24rem,calc(100vw-2rem))]`)
- Header with maximize button (links to `/assistant`), close button
- ChatThread inside
- Auto-hidden when on `/assistant`

### ChatThread Component
- Message bubbles: User (right-aligned, primary fill) vs Assistant (left-aligned, AI avatar)
- Rich attachments in assistant bubbles:
  - `MiniCourseCard`: Interactive card linking to `/course/$id` with title, provider, hours, level
  - `MilestoneChip`: Highlighted milestone alert box
- Thinking indicator: 3 bouncing dots with "Lumi is reasoning over your path…"
- 4 suggested prompt chips (shown when messages exist or empty)
- Textarea (2 rows) with send button
- Auto-scroll to bottom on new messages

### AssistantProvider
- State: `{ open, messages, thinking, setOpen, send, explain }`
- `send(text)`: Adds user message, sets thinking=true, calls `mockReply()`, adds response after 1100ms
- `explain({ title, reason, courseId })`: Opens assistant, sends contextual "Explain why {title} was recommended" prompt
- `mockReply(text, profile)`: Keyword regex matcher:
  - `"why" + "statistic"` → statistics course recommendation explanation + courseId reference
  - `"backend" | "switch"` → path switching response + milestone chip
  - `"pace" | "time" | "hour"` → pace adjustment response
  - `"too easy" | "skip"` → difficulty feedback response + milestone chip
  - `"recommend" | "next"` → next step recommendation + courseId reference
  - `"machine learning" | "ml engineer" | "goal"` → goal overview response + courseId reference
  - Default fallback: generic coaching response

## Status by Feature

| Feature | Status | Details |
|---------|--------|---------|
| Full-page assistant UI | **COMPLETE** | Context sidebar, chat, input |
| Global floating widget | **COMPLETE** | Trigger button, overlay, maximize, hide on /assistant |
| Message rendering | **COMPLETE** | User/assistant bubbles, course cards, milestone chips |
| Suggested prompts | **COMPLETE** | 4 quick-action chips |
| Thinking indicator | **COMPLETE** | Bouncing dots animation |
| Contextual explain | **COMPLETE** | `explain()` sends contextual prompt |
| Keyword-based responses | **PARTIAL** | ~6 patterns. Sufficient for prototype. Needs backend LLM. |
| Error handling | **MISSING** | No error state if response fails |
| Retry on failure | **MISSING** | No retry mechanism |
| Streaming responses | **MISSING** | No token-by-token rendering |
| Message persistence | **MISSING** | Messages lost on page refresh (in-memory only) |
| Backend LLM integration | **MISSING** | Currently all client-side keyword matching |

## Required Changes

### 1. Backend LLM Integration

**Current**: `mockReply()` matches keywords and returns hardcoded responses.

**Required**: When API available, call `POST /api/v1/assistant/message` with user message and context.

**Implementation**: Modify `AssistantProvider.send()` to:
```
if (VITE_API_BASE_URL) {
  // Call backend
  const response = await api.post("/assistant/message", {
    message: text,
    context: {
      currentPathId: profile.selectedRole ? pathIdForRole(profile.selectedRole) : undefined,
      page: window.location.pathname,
    },
  });
  // Map response to ChatMessage format
  addMessage({
    id: response.id,
    role: "assistant",
    content: response.content,
    courseId: response.courseId,
    milestone: response.milestone,
  });
} else {
  // Keep existing mockReply() fallback
}
```

**Files to modify**: `src/lib/assistant.tsx`

### 2. Error Handling

**Current**: No error handling. If `mockReply` throws (it can't since it's synchronous), nothing happens.

**Required**: Handle API failures gracefully.

```
Assistant API call fails
  → Remove thinking indicator
  → Add error message bubble:
      role: "assistant"
      content: "I'm having trouble connecting right now. Please try again."
      isError: true  (new field)
  → Show "Retry" button on the error bubble
  → Clicking retry resends the last user message
```

**Implementation**:
- Add `isError?: boolean` to `ChatMessage` interface
- In `ChatThread`, render error bubbles with a distinct style (destructive border) and retry button
- In `AssistantProvider`, wrap API call in try/catch

**Files to modify**: `src/lib/assistant.tsx`, `src/components/Chat.tsx`

### 3. Streaming Response Support (Backend-Dependent)

**When backend supports SSE streaming**:

```
User sends message
  → Add user bubble
  → Start thinking indicator
  → Open SSE connection to /api/v1/assistant/message/stream
  → As tokens arrive:
      → Replace thinking indicator with growing assistant bubble
      → Append each token to content
      → Auto-scroll
  → On metadata event (courseId):
      → Add course card to current message
  → On done event:
      → Finalize message
      → Remove pending state
```

**Implementation**: Add a `sendStream()` method to `AssistantProvider` that uses `EventSource` or `fetch` with `ReadableStream`. The existing `pending?: boolean` field on `ChatMessage` is already designed for this.

**Files to modify**: `src/lib/assistant.tsx`

### 4. Message Persistence (Optional Enhancement)

**Current**: Messages are stored in React state (`useState<ChatMessage[]>`) and lost on page refresh.

**Options**:
- **Minimal**: Store recent messages in `sessionStorage` so they survive within-tab navigation
- **Full**: Backend persists conversation history, frontend fetches on load

**Recommendation**: For now, store in `sessionStorage` as a quick win. Backend conversation persistence can come later.

**Files to modify**: `src/lib/assistant.tsx`

### 5. Contextual Action Support

The assistant should handle these learner questions. Current keyword matcher partially covers some:

| Question | Currently Handled? | Notes |
|----------|--------------------|-------|
| "What should I learn next?" | **YES** | `"recommend" | "next"` pattern |
| "Why was this recommended?" | **YES** | Via `explain()` contextual prompt |
| "Can I skip this?" | **PARTIAL** | `"too easy" | "skip"` pattern responds |
| "This is too easy" | **YES** | Matches `"too easy"` |
| "This is too difficult" | **PARTIAL** | No explicit `"too hard" | "difficult"` pattern |
| "I have only 5 hours this week" | **YES** | `"pace" | "time" | "hour"` pattern |
| "I want to learn more about X" | **PARTIAL** | Only matches specific keywords like "machine learning" |
| "Show me a project instead" | **NO** | No pattern |
| "How close am I to my goal?" | **PARTIAL** | `"goal"` pattern gives overview but no specific progress metric |

**For backend LLM**: All of these will be handled naturally by the LLM with RAG context. No additional frontend keyword patterns needed.

**For prototype improvement** (optional): Add patterns for:
- `"too hard" | "difficult"` → difficulty response (mirror the "too easy" pattern)
- `"project"` → suggest a project-type node from the path
- `"progress" | "close" + "goal"` → show progress % and ETA

**Files to modify**: `src/lib/assistant.tsx` (only if improving prototype before backend)

### 6. Prototype Badge

**Current**: The assistant header shows "Prototype · simulated replies" badge.

**Required**: When connected to real backend, hide this badge. Check `VITE_API_BASE_URL`.

**Files to modify**: `src/routes/assistant.tsx`

## Items Already Complete (Do Not Modify)

- [x] Full-page assistant layout with context sidebar
- [x] Global floating widget with trigger button
- [x] Widget auto-hide on `/assistant`
- [x] Widget maximize button to full page
- [x] User and assistant message bubbles
- [x] MiniCourseCard in assistant responses
- [x] MilestoneChip in assistant responses
- [x] Thinking indicator (bouncing dots)
- [x] 4 suggested prompt chips
- [x] Auto-scroll to latest message
- [x] Empty state with suggestions
- [x] Context sidebar: goal, skill gaps, completed courses
- [x] Send on Enter (Shift+Enter for newline)
- [x] Empty message validation
- [x] Responsive layout (sidebar hidden on mobile)

## Acceptance Criteria

1. Assistant sends messages to backend LLM when API available
2. Backend responses render with existing bubble/card/chip UI
3. API errors show error bubble with retry button
4. Streaming responses render token-by-token when backend supports SSE
5. Prototype badge hidden when connected to real backend
6. When backend unavailable, keyword-based mock replies work identically
7. All existing assistant UI preserved
8. All existing contextual explain() flows preserved
9. Message persistence across in-tab navigation (sessionStorage minimum)
