import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { FeedbackRequest, AdaptationResponse } from "@/lib/types/api";

async function submitFeedback(pathId: string, feedback: FeedbackRequest): Promise<AdaptationResponse> {
  if (!isApiEnabled) {
    // Mock response when API is disabled
    return {
      adapted: false,
      changes: [],
      updatedPath: {} as any, // Will be ignored in mock mode
    };
  }

  const result = await api.post<AdaptationResponse>(
    `/api/v1/paths/${encodeURIComponent(pathId)}/feedback`,
    feedback
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export function useFeedback(pathId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedback: FeedbackRequest) => submitFeedback(pathId, feedback),
    onSuccess: (data) => {
      // Invalidate path query to refresh with adapted content
      if (data.adapted) {
        queryClient.invalidateQueries({ queryKey: ["path", pathId] });
      }
    },
  });
}
