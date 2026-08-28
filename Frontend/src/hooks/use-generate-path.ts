import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { LearnerProfile, LearningPath } from "@/data/mock";
import { generateLearningPath } from "@/lib/learning-path";

interface GeneratePathRequest {
  profile: LearnerProfile;
}

async function generatePath(request: GeneratePathRequest): Promise<LearningPath> {
  if (!isApiEnabled) {
    // Fall back to client-side generation
    return generateLearningPath(request.profile);
  }

  const result = await api.post<LearningPath>("/api/v1/paths/generate", {
    profile: request.profile,
  });

  if (!result.ok) {
    // Fall back to client-side generation on error
    if (result.error.status === 0) {
      return generateLearningPath(request.profile);
    }
    throw result.error;
  }
  
  return result.data;
}

export function useGeneratePath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generatePath,
    onSuccess: (data) => {
      // Cache the generated path
      queryClient.setQueryData(["path", data.id], data);
      // Invalidate paths list to include new path
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
}
