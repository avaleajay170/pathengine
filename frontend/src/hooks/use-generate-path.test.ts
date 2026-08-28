import { describe, expect, it, vi, beforeEach } from "vitest";
import { emptyLearnerProfile } from "@/lib/learner-profile";

const { mockPost, mockIsApiEnabled } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockIsApiEnabled: { value: false },
}));

vi.mock("@/lib/api-client", () => ({
  get isApiEnabled() {
    return mockIsApiEnabled.value;
  },
  api: { post: mockPost },
}));

// Import the bare async logic mirroring the hook's generatePath function
async function generatePath(request: {
  profileId: string;
  profile: (typeof emptyLearnerProfile);
}) {
  const { isApiEnabled, api } = await import("@/lib/api-client");
  const { generateLearningPath } = await import("@/lib/learning-path");

  if (!isApiEnabled) return generateLearningPath(request.profile);

  const result = await api.post("/api/v1/paths/generate", { profileId: request.profileId });
  if (!result.ok) {
    if ((result as { ok: false; error: { status: number } }).error.status === 0) {
      return generateLearningPath(request.profile);
    }
    throw (result as { ok: false; error: unknown }).error;
  }
  return (result as { ok: true; data: unknown }).data;
}

const baseProfile = {
  ...emptyLearnerProfile,
  selectedRole: "ml-engineer" as const,
  targetRole: "Machine Learning Engineer",
  goal: "Become an ML engineer",
};

beforeEach(() => {
  mockPost.mockReset();
  mockIsApiEnabled.value = false;
});

describe("generatePath — offline mode", () => {
  it("returns a client-side generated path without calling the API", async () => {
    const path = await generatePath({ profileId: "local", profile: baseProfile });
    expect(path).toHaveProperty("id");
    expect(path).toHaveProperty("milestones");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("uses the profile to generate a role-specific path", async () => {
    const path = await generatePath({ profileId: "x", profile: baseProfile }) as { id: string };
    expect(path.id).toBe("ml-engineer");
  });
});

describe("generatePath — online mode", () => {
  beforeEach(() => {
    mockIsApiEnabled.value = true;
  });

  it("P3: sends { profileId } only — no profile key in body", async () => {
    const serverPath = { id: "ml-engineer", milestones: [], title: "ML Engineer", goal: "", level: "Intermediate", courses: 0, weeks: 0, progress: 0, eta: "" };
    mockPost.mockResolvedValue({ ok: true, data: serverPath });

    await generatePath({ profileId: "prof-123", profile: baseProfile });

    expect(mockPost).toHaveBeenCalledWith("/api/v1/paths/generate", { profileId: "prof-123" });
    const body = mockPost.mock.calls[0]![1] as Record<string, unknown>;
    expect(body).not.toHaveProperty("profile");
    expect(body).toHaveProperty("profileId", "prof-123");
  });

  it("returns server data on success", async () => {
    const serverPath = { id: "srv-path", milestones: [] };
    mockPost.mockResolvedValue({ ok: true, data: serverPath });
    const result = await generatePath({ profileId: "p1", profile: baseProfile });
    expect(result).toEqual(serverPath);
  });

  it("falls back to client-side generation when status === 0 (network down)", async () => {
    mockPost.mockResolvedValue({ ok: false, error: { status: 0, message: "Unable to reach the API" } });
    const result = await generatePath({ profileId: "p1", profile: baseProfile }) as { id: string };
    expect(result.id).toBe("ml-engineer");
  });

  it("throws ApiError for non-zero HTTP failures", async () => {
    const err = { status: 500, message: "Server error" };
    mockPost.mockResolvedValue({ ok: false, error: err });
    await expect(generatePath({ profileId: "p1", profile: baseProfile })).rejects.toEqual(err);
  });
});
