import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { LearnerProfile, LearningPath } from "@/data/mock";
import { generateLearningPath } from "@/lib/learning-path";

interface GeneratePathRequest {
  /** Server-assigned profile ID — sent to the API when online. */
  profileId: string;
  /** Full profile used for the offline client-side fallback. */
  profile: LearnerProfile;
}

async function generatePath(request: GeneratePathRequest): Promise<LearningPath> {
  if (!isApiEnabled) {
    return generateLearningPath(request.profile);
  }

  const result = await api.post<LearningPath>("/api/v1/paths/generate", {
    profileId: request.profileId,
  });

  if (!result.ok) {
    // Network unreachable — fall back to client-side generation
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
      queryClient.setQueryData(["path", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["paths"] });
    },
  });
}
