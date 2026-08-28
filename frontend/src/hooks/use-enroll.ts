import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";

async function enrollCourse(courseId: string): Promise<{ enrolled: true; courseId: string }> {
  if (!isApiEnabled) {
    return { enrolled: true, courseId };
  }

  const result = await api.post<{ enrolled: true; courseId: string }>(
    `/api/v1/courses/${encodeURIComponent(courseId)}/enroll`,
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
