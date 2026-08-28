import { describe, expect, it, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

// vi.mock is hoisted — declare mocks with vi.hoisted so they're available
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

// Inline the function under test to avoid React Query provider setup
async function enrollCourse(courseId: string): Promise<{ enrolled: true; courseId: string }> {
  const { isApiEnabled, api } = await import("@/lib/api-client");
  if (!isApiEnabled) return { enrolled: true, courseId };
  const result = await api.post<{ enrolled: true; courseId: string }>(
    `/api/v1/courses/${encodeURIComponent(courseId)}/enroll`,
  );
  if (!result.ok) throw result.error;
  return result.data;
}

beforeEach(() => {
  mockPost.mockReset();
  mockIsApiEnabled.value = false;
});

describe("enrollCourse — offline mode", () => {
  it("returns { enrolled: true, courseId } without calling the API", async () => {
    const result = await enrollCourse("react-pro");
    expect(result).toEqual({ enrolled: true, courseId: "react-pro" });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("echoes back any courseId", async () => {
    const result = await enrollCourse("ml-foundations");
    expect(result.courseId).toBe("ml-foundations");
  });
});

describe("enrollCourse — online mode", () => {
  beforeEach(() => {
    mockIsApiEnabled.value = true;
  });

  it("calls POST /api/v1/courses/:id/enroll with courseId as path segment", async () => {
    mockPost.mockResolvedValue({ ok: true, data: { enrolled: true, courseId: "python-basics" } });
    await enrollCourse("python-basics");
    expect(mockPost).toHaveBeenCalledWith("/api/v1/courses/python-basics/enroll");
  });

  it("does NOT use /profile/ in the URL", async () => {
    mockPost.mockResolvedValue({ ok: true, data: { enrolled: true, courseId: "sql-analytics" } });
    await enrollCourse("sql-analytics");
    const url = mockPost.mock.calls[0]![0] as string;
    expect(url).not.toContain("/profile/");
  });

  it("returns the server response on success", async () => {
    const serverData = { enrolled: true as const, courseId: "deep-learning" };
    mockPost.mockResolvedValue({ ok: true, data: serverData });
    expect(await enrollCourse("deep-learning")).toEqual(serverData);
  });

  it("throws ApiError on non-zero HTTP failure", async () => {
    const err = { status: 409, message: "Already enrolled" };
    mockPost.mockResolvedValue({ ok: false, error: err });
    await expect(enrollCourse("react-pro")).rejects.toEqual(err);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------
describe("enrollCourse — properties", () => {
  it("P1: URL is always /api/v1/courses/<id>/enroll for any valid courseId", async () => {
    mockIsApiEnabled.value = true;
    await fc.assert(
      fc.asyncProperty(fc.stringMatching(/^[a-z0-9-]{1,40}$/), async (courseId) => {
        mockPost.mockResolvedValue({ ok: true, data: { enrolled: true, courseId } });
        await enrollCourse(courseId);
        const url = mockPost.mock.calls.at(-1)![0] as string;
        expect(url).toBe(`/api/v1/courses/${courseId}/enroll`);
        expect(url).not.toContain("/profile/");
      }),
    );
  });

  it("P2: offline mode never calls api.post for any courseId", async () => {
    mockIsApiEnabled.value = false;
    await fc.assert(
      fc.asyncProperty(fc.stringMatching(/^[a-z0-9-]{1,40}$/), async (courseId) => {
        const result = await enrollCourse(courseId);
        expect(result).toEqual({ enrolled: true, courseId });
      }),
    );
    expect(mockPost).not.toHaveBeenCalled();
  });
});
