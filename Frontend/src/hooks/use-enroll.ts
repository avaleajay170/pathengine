import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";

async function enrollCourse(courseId: string): Promise<{ enrolled: boolean }> {
  if (!isApiEnabled) {
    // Mock response when API is disabled
    return { enrolled: true };
  }

  const result = await api.post<{ enrolled: boolean }>("/api/v1/profile/enroll", { courseId });

  if (!result.ok) throw result.error;
  return result.data;
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      // Invalidate profile to refresh enrollment state
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
