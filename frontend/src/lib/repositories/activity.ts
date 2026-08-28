import { useQuery } from "@tanstack/react-query";
import { activity as mockActivity, skillTrend as mockSkillTrend } from "@/data/mock";
import { api, isApiEnabled } from "@/lib/api-client";
import type { ActivityResponse, SkillHistoryResponse } from "@/lib/types/api";

export async function fetchActivity(): Promise<ActivityResponse> {
  if (!isApiEnabled) {
    return { activities: mockActivity.map(({ id, text, when }) => ({ id, type: "activity", description: text, timestamp: when })) };
  }
  const result = await api.get<ActivityResponse>("/api/v1/profile/activity");
  if (result.ok) return result.data;
  if (result.error.status === 0) {
    return { activities: mockActivity.map(({ id, text, when }) => ({ id, type: "activity", description: text, timestamp: when })) };
  }
  throw result.error;
}

export async function fetchSkillHistory(): Promise<SkillHistoryResponse> {
  if (!isApiEnabled) return { data: mockSkillTrend };
  const result = await api.get<SkillHistoryResponse>("/api/v1/profile/skill-history");
  if (result.ok) return result.data;
  if (result.error.status === 0) return { data: mockSkillTrend };
  throw result.error;
}

export function useActivity() {
  return useQuery({ queryKey: ["profile", "activity"], queryFn: fetchActivity });
}

export function useSkillHistory() {
  return useQuery({ queryKey: ["profile", "skill-history"], queryFn: fetchSkillHistory });
}