import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, isApiEnabled } from "@/lib/api-client";
import type { LearnerProfile } from "@/data/mock";
import type { ProfileResponse, CreateProfileRequest } from "@/lib/types/api";

async function fetchProfile(): Promise<ProfileResponse | null> {
  if (!isApiEnabled) {
    return null; // Fall back to localStorage
  }

  const result = await api.get<ProfileResponse>("/api/v1/profile");
  
  if (!result.ok) {
    if (result.error.status === 404 || result.error.status === 0) {
      return null; // Profile doesn't exist yet or API is offline
    }
    throw result.error;
  }
  
  return result.data;
}

async function updateProfile(updates: Partial<LearnerProfile>): Promise<ProfileResponse> {
  if (!isApiEnabled) {
    // Return mock response when API is disabled
    return { ...updates, id: "local", createdAt: new Date().toISOString() } as ProfileResponse;
  }

  const result = await api.patch<ProfileResponse>("/api/v1/profile", updates);

  if (!result.ok) throw result.error;
  return result.data;
}

async function createProfile(data: CreateProfileRequest): Promise<ProfileResponse> {
  if (!isApiEnabled) {
    // Return mock response when API is disabled
    return { ...data, id: "local", createdAt: new Date().toISOString() } as ProfileResponse;
  }

  const result = await api.post<ProfileResponse>("/api/v1/profile", data);

  if (!result.ok) throw result.error;
  return result.data;
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
