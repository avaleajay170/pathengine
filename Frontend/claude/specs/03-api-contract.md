# API Contract Specification (Frontend Perspective)

This document defines the data contracts the frontend expects from the backend. The backend developer should use these as requirements for their API design.

## Guiding Principles

1. **Frontend types are the starting point**. The existing `src/data/mock.ts` defines the TypeScript interfaces the UI already consumes. Backend responses should be adaptable to these shapes.
2. **Do not over-design**. Only specify what the frontend genuinely needs.
3. **Versioning**: Use URL path versioning (`/api/v1/...`).
4. **Authentication**: Bearer token in `Authorization` header. Frontend will store token in memory + localStorage.

## Existing Frontend Types (from `src/data/mock.ts`)

These are the types the UI currently renders. Backend responses should map to these:

```typescript
type Level = "Beginner" | "Intermediate" | "Advanced";
type NodeStatus = "locked" | "available" | "in-progress" | "completed";
type NodeKind = "course" | "project" | "assessment";

interface Course {
  id: string;
  title: string;
  provider: string;
  instructor: string;
  category: string;
  level: Level;
  rating: number;
  reviews: number;
  hours: number;
  price: number | "Free";
  blurb: string;
  skills: string[];
  syllabus: { title: string; items: string[] }[];
  prerequisites: string[];
  thumbHue: number;
}

interface PathNodeItem {
  id: string;
  courseId?: string;
  kind: NodeKind;
  title: string;
  duration: string;
  status: NodeStatus;
  skills: string[];
  description: string;
  requires?: string[];
  reason: string;
}

interface Milestone {
  id: string;
  title: string;
  summary: string;
  nodes: PathNodeItem[];
}

interface LearningPath {
  id: string;
  title: string;
  goal: string;
  level: Level;
  courses: number;
  weeks: number;
  progress: number;
  eta: string;
  milestones: Milestone[];
}

interface LearnerProfile {
  name: string;
  goal: string;
  targetRole: string;
  selectedRole: "ml-engineer" | "data-analyst" | "full-stack";
  timeframe: string;
  hoursPerWeek: number;
  pace: string;
  skillLevels: Record<string, number | string>;
  priorExperience?: string;
  uploadedData?: unknown;
  preferredFormats?: string[];
  completedCourses: string[];
  enrolledCourses: string[];
  nodeStatuses: Record<string, NodeStatus>;
  nodeFeedback: Record<
    string,
    "too-easy" | "too-difficult" | "not-relevant" | "already-know" | "useful"
  >;
  addedCourseIds: string[];
  onboardingComplete: boolean;
}

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  when: string;
  body: string;
}
```

## API Endpoints

### 1. Learner Profile

#### `POST /api/v1/profile`
Create learner profile after onboarding completion.

**Request body** (from onboarding wizard):
```typescript
interface CreateProfileRequest {
  name: string;
  goal: string;                          // natural language goal text
  targetRole: string;                    // selected role pill value
  skillLevels: Record<string, number>;   // skill name → 0|1|2
  completedCourses: string[];            // course IDs from checkbox selection
  uploadedTranscript?: File;             // optional PDF/CSV upload
  hoursPerWeek: number;                  // 2-25
  preferredFormats: string[];            // ["Video lessons", "Reading & articles", ...]
  pace: string;                          // "relaxed" | "steady" | "intensive"
}
```

**Response** (used by LearnerProfileProvider):
```typescript
interface ProfileResponse {
  id: string;                            // server-assigned profile ID
  name: string;
  goal: string;
  targetRole: string;
  selectedRole: string;                  // backend-classified role (replaces matchRole regex)
  skillLevels: Record<string, number>;
  completedCourses: string[];
  enrolledCourses: string[];
  hoursPerWeek: number;
  preferredFormats: string[];
  pace: string;
  onboardingComplete: boolean;
  createdAt: string;
}
```

#### `GET /api/v1/profile`
Retrieve current learner profile.

**Response**: Same as `ProfileResponse`.

#### `PATCH /api/v1/profile`
Update profile fields (goal edit, pace change, hours change).

**Request body**: Partial `ProfileResponse` (only fields being changed).

**Response**: Updated `ProfileResponse`.

---

### 2. Learning Path Generation

#### `POST /api/v1/paths/generate`
Generate a personalized learning path from the learner profile.

Called after onboarding completion (replaces current `generateLearningPath(profile)` client-side call).

**Request body**:
```typescript
interface GeneratePathRequest {
  profileId: string;
  // Profile data already stored server-side; profileId is sufficient.
  // Alternatively, send full profile if backend prefers stateless generation.
}
```

**Response** (must map to existing `LearningPath` interface):
```typescript
interface GeneratedPathResponse {
  id: string;
  title: string;
  goal: string;
  level: Level;
  courses: number;                       // total course count
  weeks: number;                         // estimated weeks to complete
  progress: number;                      // 0 for new path
  eta: string;                           // estimated completion date
  milestones: {
    id: string;
    title: string;
    summary: string;
    nodes: {
      id: string;
      courseId?: string;
      kind: NodeKind;
      title: string;
      duration: string;
      status: NodeStatus;
      skills: string[];
      description: string;
      requires?: string[];               // prerequisite labels or node IDs
      reason: string;                    // AI-generated reason for this node
    }[];
  }[];
}
```

**Frontend behavior during generation**:
- Display the existing 4-stage generation overlay
- Poll or use SSE for generation progress if backend supports it
- On completion, navigate to `/path/{id}`
- On failure, show error with retry button

#### `GET /api/v1/paths/:id`
Retrieve a specific learning path with current progress.

**Response**: Same as `GeneratedPathResponse` but with updated `status` values reflecting learner progress.

#### `GET /api/v1/paths`
List available path templates (for `/paths` catalogue page).

**Response**:
```typescript
interface PathsListResponse {
  paths: {
    id: string;
    title: string;
    goal: string;
    level: Level;
    courses: number;
    weeks: number;
    milestones: { title: string; nodeCount: number }[];
  }[];
}
```

---

### 3. Courses

#### `GET /api/v1/courses`
List/search courses with filters.

**Query parameters**:
```
?q=search+text           // full-text search across title, provider, skills
&category=Data+Science    // category filter
&level=Beginner           // level filter
&page=1                   // pagination
&limit=20                 // page size
```

**Response**:
```typescript
interface CoursesListResponse {
  courses: Course[];                     // matches existing Course interface
  total: number;                         // total matching courses
  page: number;
  limit: number;
}
```

#### `GET /api/v1/courses/:id`
Get course details.

**Response**: Single `Course` object matching existing interface.

#### `GET /api/v1/courses/:id/reviews`
Get course reviews.

**Response**:
```typescript
interface ReviewsResponse {
  reviews: Review[];                     // matches existing Review interface
  averageRating: number;
  totalReviews: number;
  breakdown: { stars: number; pct: number }[];
}
```

#### `POST /api/v1/courses/:id/enroll`
Enroll in a course.

**Response**: `{ enrolled: true; courseId: string }`

---

### 4. Progress & Node Operations

#### `POST /api/v1/paths/:pathId/nodes/:nodeId/complete`
Mark a path node as completed.

**Response**:
```typescript
interface NodeCompletionResponse {
  nodeId: string;
  status: "completed";
  pathProgress: number;                  // updated overall progress %
  unlockedNodes: string[];               // node IDs now unlocked
  updatedMilestone?: {
    id: string;
    completed: boolean;
  };
}
```

#### `GET /api/v1/profile/activity`
Get recent learning activity.

**Response**:
```typescript
interface ActivityResponse {
  activities: {
    id: string;
    type: string;                        // "module_complete" | "badge" | "milestone" | ...
    description: string;
    timestamp: string;
  }[];
}
```

#### `GET /api/v1/profile/skill-history`
Get historical skill progression data (for SkillTrend chart).

**Response**:
```typescript
interface SkillHistoryResponse {
  data: {
    month: string;                       // "Mar" | "Apr" | ...
    [skillName: string]: number | string; // skill scores
  }[];
}
```

---

### 5. Feedback & Adaptation

#### `POST /api/v1/paths/:pathId/feedback`
Submit learner feedback on a node or the overall path.

**Request body**:
```typescript
interface FeedbackRequest {
  nodeId?: string;                       // specific node, or null for path-level
  type: "too-easy" | "too-hard" | "not-interested" | "good-fit" | "pace-change";
  difficulty?: "too-easy" | "too-hard" | "just-right";
  relevance?: "relevant" | "not-relevant";
  comment?: string;                      // optional free-text
  requestedPace?: "relaxed" | "steady" | "intensive";
}
```

**Response** (updated path reflecting adaptation):
```typescript
interface AdaptationResponse {
  adapted: boolean;                      // whether the path actually changed
  changes: {
    type: "node-added" | "node-removed" | "node-reordered" | "pace-changed" | "milestone-updated";
    description: string;                 // human-readable description of change
    affectedNodeIds?: string[];
  }[];
  updatedPath: GeneratedPathResponse;    // full updated path
}
```

**Frontend behavior**:
1. Submit feedback → show "Submitting feedback..." loading state
2. Receive response → if `adapted: true`, show changelog summary
3. Re-render path with updated data
4. If `adapted: false`, show "Feedback recorded" without path changes

---

### 6. AI Assistant

#### `POST /api/v1/assistant/message`
Send a message to the AI assistant.

**Request body**:
```typescript
interface AssistantMessageRequest {
  message: string;                       // user's message text
  context?: {
    currentPathId?: string;
    currentNodeId?: string;
    currentCourseId?: string;
    page?: string;                       // current route for context
  };
}
```

**Response**:
```typescript
interface AssistantMessageResponse {
  id: string;
  role: "assistant";
  content: string;                       // main response text
  courseId?: string;                     // referenced course (renders MiniCourseCard)
  milestone?: {
    title: string;
    detail: string;                      // renders MilestoneChip
  };
  suggestedActions?: {
    label: string;
    action: string;                      // "navigate" | "adjust-pace" | "enroll" | ...
    targetId?: string;                   // course/path/node ID
  }[];
}
```

**Streaming variant** (if backend supports SSE):
```
POST /api/v1/assistant/message/stream
Content-Type: application/json
Accept: text/event-stream

Response: Server-Sent Events
data: {"type": "token", "content": "Based on"}
data: {"type": "token", "content": " your profile"}
data: {"type": "metadata", "courseId": "ml-foundations"}
data: {"type": "done"}
```

Frontend should support both streaming and non-streaming responses.

---

### 7. Transcript Upload

#### `POST /api/v1/profile/transcript`
Upload a transcript file for parsing.

**Request**: `multipart/form-data` with file field.

**Response** (initial):
```typescript
interface TranscriptUploadResponse {
  uploadId: string;
  status: "processing";
}
```

#### `GET /api/v1/profile/transcript/:uploadId`
Check transcript processing status.

**Response**:
```typescript
interface TranscriptStatusResponse {
  uploadId: string;
  status: "processing" | "completed" | "failed";
  parsedCourses?: {
    title: string;
    matchedCourseId?: string;            // matched to platform course, if any
    confidence: number;                  // 0-1 match confidence
    skills: string[];
  }[];
  parsedSkills?: {
    skill: string;
    inferredLevel: Level;
  }[];
  error?: string;
}
```

**Frontend behavior**:
1. Upload file → show upload progress
2. Receive `uploadId` → show "Processing transcript..." with spinner
3. Poll status until `completed` or `failed`
4. On completion → display parsed courses and skills for learner review
5. Learner confirms/rejects each parsed item
6. Confirmed items update profile

---

## Error Response Format

All error responses should follow a consistent shape:

```typescript
interface ApiErrorResponse {
  error: {
    status: number;                      // HTTP status code
    message: string;                     // human-readable message
    code?: string;                       // machine-readable error code
    details?: Record<string, string[]>;  // field-level validation errors
  };
}
```

Frontend handles:
- `400`: Validation error → display field-level messages
- `401`: Unauthorized → redirect to sign-in or show auth prompt
- `403`: Forbidden → show access denied message
- `404`: Not found → show existing 404 component
- `429`: Rate limited → show "Please wait" with retry timer
- `500`: Server error → show error state with retry button

## Offline / Fallback Behavior

When `VITE_API_BASE_URL` is not set OR the API is unreachable:
1. All repository functions fall back to `src/data/mock.ts` data
2. Profile operations use localStorage only
3. Assistant uses `mockReply()` keyword matcher
4. Path generation uses client-side `generateLearningPath()`
5. UI functions identically to current prototype
6. No error states shown (mock data is always available)

This ensures the frontend remains fully functional as a standalone prototype even without a running backend.
