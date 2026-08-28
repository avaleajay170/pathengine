import type {
  Course,
  LearnerProfile,
  LearningPath,
  Review,
} from "@/data/mock";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ProfileResponse extends LearnerProfile {
  id: string;
  createdAt: string;
}

export interface CreateProfileRequest {
  name: string;
  goal: string;
  targetRole: string;
  skillLevels: Record<string, number>;
  completedCourses: string[];
  uploadedTranscript?: File;
  hoursPerWeek: number;
  preferredFormats: string[];
  pace: string;
}

export interface CoursesListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  breakdown: { stars: number; pct: number }[];
}

export interface PathsListResponse {
  paths: (Pick<LearningPath, "id" | "title" | "goal" | "level" | "courses" | "weeks"> & {
    milestones: { title: string; nodeCount: number }[];
  })[];
}

export interface NodeCompletionResponse {
  nodeId: string;
  status: "completed";
  pathProgress: number;
  unlockedNodes: string[];
  updatedMilestone?: { id: string; completed: boolean };
}

export type FeedbackType =
  | "too-easy"
  | "too-hard"
  | "not-interested"
  | "good-fit"
  | "pace-change";

export interface FeedbackRequest {
  nodeId?: string;
  type: FeedbackType;
  difficulty?: "too-easy" | "too-hard" | "just-right";
  relevance?: "relevant" | "not-relevant";
  comment?: string;
  requestedPace?: "relaxed" | "steady" | "intensive";
}

export interface AdaptationResponse {
  adapted: boolean;
  changes: {
    type:
      | "node-added"
      | "node-removed"
      | "node-reordered"
      | "pace-changed"
      | "milestone-updated";
    description: string;
    affectedNodeIds?: string[];
  }[];
  updatedPath: LearningPath;
}

export interface AssistantMessageRequest {
  message: string;
  context?: {
    currentPathId?: string;
    currentNodeId?: string;
    currentCourseId?: string;
    page?: string;
  };
}

export interface AssistantMessageResponse {
  id: string;
  role: "assistant";
  content: string;
  courseId?: string;
  milestone?: { title: string; detail: string };
  suggestedActions?: { label: string; action: string; targetId?: string }[];
}

export interface TranscriptUploadResponse {
  uploadId: string;
  status: "processing";
}

export interface TranscriptStatusResponse {
  uploadId: string;
  status: "processing" | "completed" | "failed";
  parsedCourses?: {
    title: string;
    matchedCourseId?: string;
    confidence: number;
    skills: string[];
  }[];
  parsedSkills?: { skill: string; inferredLevel: string }[];
  error?: string;
}

export interface ActivityResponse {
  activities: { id: string; type: string; description: string; timestamp: string }[];
}

export interface SkillHistoryResponse {
  data: { month: string; [skillName: string]: number | string }[];
}