import { useQuery } from "@tanstack/react-query";
import { learningPaths, getPath, type LearnerProfile, type LearningPath } from "@/data/mock";
import { api, isApiEnabled } from "@/lib/api-client";
import { generateLearningPath } from "@/lib/learning-path";
import type { PathsListResponse } from "@/lib/types/api";

export async function fetchPaths(): Promise<PathsListResponse> {
  if (!isApiEnabled) {
    return {
      paths: learningPaths.map(({ id, title, goal, level, courses, weeks, milestones }) => ({
        id,
        title,
        goal,
        level,
        courses,
        weeks,
        milestones: milestones.map(({ title, nodes }) => ({ title, nodeCount: nodes.length })),
      })),
    };
  }
  const result = await api.get<PathsListResponse>("/api/v1/paths");
  if (result.ok) return result.data;
  if (result.error.status === 0) {
    return fetchMockPaths();
  }
  throw result.error;
}

export async function fetchPath(id: string, profile: LearnerProfile): Promise<LearningPath | undefined> {
  if (!isApiEnabled) return getPath(id) ? generateLearningPath(profile) : undefined;
  const result = await api.get<LearningPath>(`/api/v1/paths/${encodeURIComponent(id)}`);
  if (result.ok) return result.data;
  if (result.error.status === 0) return getPath(id) ? generateLearningPath(profile) : undefined;
  if (result.error.status === 404) return undefined;
  throw result.error;
}

export function usePaths() {
  return useQuery({ queryKey: ["paths"], queryFn: fetchPaths });
}

export function usePath(id: string, profile: LearnerProfile) {
  return useQuery({
    queryKey: ["path", id, profile],
    queryFn: () => fetchPath(id, profile),
    enabled: Boolean(id),
  });
}

function fetchMockPaths(): PathsListResponse {
  return {
    paths: learningPaths.map(({ id, title, goal, level, courses, weeks, milestones }) => ({
      id,
      title,
      goal,
      level,
      courses,
      weeks,
      milestones: milestones.map(({ title, nodes }) => ({ title, nodeCount: nodes.length })),
    })),
  };
}