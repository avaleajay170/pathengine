import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { NodeCompletionResponse } from "@/lib/types/api";

interface CompleteNodeParams {
  pathId: string;
  nodeId: string;
  courseId?: string;
}

async function completeNode(params: CompleteNodeParams): Promise<NodeCompletionResponse> {
  if (!isApiEnabled) {
    // Mock response when API is disabled
    return {
      nodeId: params.nodeId,
      status: "completed",
      pathProgress: 0,
      unlockedNodes: [],
    };
  }

  const result = await api.post<NodeCompletionResponse>(
    `/api/v1/paths/${encodeURIComponent(params.pathId)}/nodes/${encodeURIComponent(params.nodeId)}/complete`,
    { courseId: params.courseId }
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export function useCompleteNode(pathId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Omit<CompleteNodeParams, "pathId">) => 
      completeNode({ ...params, pathId }),
    onSuccess: (data) => {
      // Invalidate path to refresh progress and unlock status
      queryClient.invalidateQueries({ queryKey: ["path", pathId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "activity"] });
    },
  });
}
