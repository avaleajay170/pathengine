import { useMutation } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { AssistantMessageRequest, AssistantMessageResponse } from "@/lib/types/api";

async function sendMessage(request: AssistantMessageRequest): Promise<AssistantMessageResponse> {
  if (!isApiEnabled) {
    // Mock response when API is disabled - will fall back to client-side logic
    throw new Error("API_DISABLED");
  }

  const result = await api.post<AssistantMessageResponse>("/api/v1/assistant/message", request);

  if (!result.ok) throw result.error;
  return result.data;
}

export function useAssistantMessage() {
  return useMutation({
    mutationFn: sendMessage,
  });
}
