import { useMutation, useQuery } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { TranscriptUploadResponse, TranscriptStatusResponse } from "@/lib/types/api";

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

async function uploadTranscript(file: File): Promise<TranscriptUploadResponse> {
  if (!isApiEnabled) {
    return { uploadId: "mock-upload", status: "processing" };
  }

  const formData = new FormData();
  formData.append("file", file);

  const result = await api.post<TranscriptUploadResponse>(
    "/api/v1/profile/transcript",
    formData,
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export function useUploadTranscript() {
  return useMutation({ mutationFn: uploadTranscript });
}

// ---------------------------------------------------------------------------
// Status polling
// ---------------------------------------------------------------------------

async function fetchTranscriptStatus(uploadId: string): Promise<TranscriptStatusResponse> {
  if (!isApiEnabled) {
    return { uploadId, status: "completed", parsedCourses: [], parsedSkills: [] };
  }

  const result = await api.get<TranscriptStatusResponse>(
    `/api/v1/profile/transcript/${encodeURIComponent(uploadId)}`,
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export function useTranscriptStatus(uploadId: string | undefined) {
  return useQuery({
    queryKey: ["transcript", uploadId],
    queryFn: () => fetchTranscriptStatus(uploadId!),
    enabled: Boolean(uploadId),
    // Poll every 2 s while still processing; stop once completed or failed
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 2000 : false,
  });
}
