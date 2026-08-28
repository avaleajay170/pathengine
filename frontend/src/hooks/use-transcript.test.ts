import { describe, expect, it, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

const { mockPost, mockGet, mockIsApiEnabled } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
  mockIsApiEnabled: { value: false },
}));

vi.mock("@/lib/api-client", () => ({
  get isApiEnabled() {
    return mockIsApiEnabled.value;
  },
  api: { post: mockPost, get: mockGet },
}));

// Inline the bare async functions under test
async function uploadTranscript(file: File) {
  const { isApiEnabled, api } = await import("@/lib/api-client");
  if (!isApiEnabled) return { uploadId: "mock-upload", status: "processing" as const };
  const formData = new FormData();
  formData.append("file", file);
  const result = await api.post("/api/v1/profile/transcript", formData);
  if (!result.ok) throw (result as { ok: false; error: unknown }).error;
  return (result as { ok: true; data: unknown }).data;
}

async function fetchTranscriptStatus(uploadId: string) {
  const { isApiEnabled, api } = await import("@/lib/api-client");
  if (!isApiEnabled) return { uploadId, status: "completed" as const, parsedCourses: [], parsedSkills: [] };
  const result = await api.get(`/api/v1/profile/transcript/${encodeURIComponent(uploadId)}`);
  if (!result.ok) throw (result as { ok: false; error: unknown }).error;
  return (result as { ok: true; data: unknown }).data;
}

// Mirrors the refetchInterval logic from the hook
function refetchInterval(status: string | undefined): number | false {
  return status === "processing" ? 2000 : false;
}

beforeEach(() => {
  mockPost.mockReset();
  mockGet.mockReset();
  mockIsApiEnabled.value = false;
});

// ---------------------------------------------------------------------------
// Upload — offline
// ---------------------------------------------------------------------------
describe("uploadTranscript — offline", () => {
  it("returns mock response without calling the API", async () => {
    const file = new File(["data"], "transcript.pdf");
    const result = await uploadTranscript(file);
    expect(result).toEqual({ uploadId: "mock-upload", status: "processing" });
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Upload — online
// ---------------------------------------------------------------------------
describe("uploadTranscript — online", () => {
  beforeEach(() => { mockIsApiEnabled.value = true; });

  it("calls POST /api/v1/profile/transcript with FormData", async () => {
    mockPost.mockResolvedValue({ ok: true, data: { uploadId: "u1", status: "processing" } });
    const file = new File(["csv"], "courses.csv");
    await uploadTranscript(file);
    expect(mockPost).toHaveBeenCalledWith(
      "/api/v1/profile/transcript",
      expect.any(FormData),
    );
  });

  it("FormData contains file under 'file' key", async () => {
    mockPost.mockResolvedValue({ ok: true, data: { uploadId: "u2", status: "processing" } });
    const file = new File(["pdf"], "t.pdf");
    await uploadTranscript(file);
    const fd = mockPost.mock.calls[0]![1] as FormData;
    expect(fd.get("file")).toBe(file);
  });

  it("returns server response on success", async () => {
    const data = { uploadId: "u3", status: "processing" as const };
    mockPost.mockResolvedValue({ ok: true, data });
    const result = await uploadTranscript(new File([], "x.pdf"));
    expect(result).toEqual(data);
  });

  it("throws ApiError on failure", async () => {
    const err = { status: 413, message: "File too large" };
    mockPost.mockResolvedValue({ ok: false, error: err });
    await expect(uploadTranscript(new File([], "big.pdf"))).rejects.toEqual(err);
  });
});

// ---------------------------------------------------------------------------
// Status — offline
// ---------------------------------------------------------------------------
describe("fetchTranscriptStatus — offline", () => {
  it("returns completed mock without calling the API", async () => {
    const result = await fetchTranscriptStatus("abc") as { status: string; uploadId: string };
    expect(result.status).toBe("completed");
    expect(result.uploadId).toBe("abc");
    expect(mockGet).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Status — online
// ---------------------------------------------------------------------------
describe("fetchTranscriptStatus — online", () => {
  beforeEach(() => { mockIsApiEnabled.value = true; });

  it("calls GET /api/v1/profile/transcript/:uploadId", async () => {
    mockGet.mockResolvedValue({ ok: true, data: { uploadId: "u1", status: "processing" } });
    await fetchTranscriptStatus("u1");
    expect(mockGet).toHaveBeenCalledWith("/api/v1/profile/transcript/u1");
  });

  it("URL-encodes the uploadId", async () => {
    mockGet.mockResolvedValue({ ok: true, data: { uploadId: "a b", status: "completed" } });
    await fetchTranscriptStatus("a b");
    expect(mockGet).toHaveBeenCalledWith("/api/v1/profile/transcript/a%20b");
  });

  it("throws ApiError on failure", async () => {
    const err = { status: 404, message: "Not found" };
    mockGet.mockResolvedValue({ ok: false, error: err });
    await expect(fetchTranscriptStatus("missing")).rejects.toEqual(err);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------
describe("properties", () => {
  it("P4: refetchInterval returns 2000 only for 'processing', false otherwise", () => {
    const statuses = ["processing", "completed", "failed", "unknown", ""];
    for (const status of statuses) {
      const result = refetchInterval(status);
      if (status === "processing") {
        expect(result).toBe(2000);
      } else {
        expect(result).toBe(false);
      }
    }
  });

  it("P4 (property): for any non-'processing' status string, refetchInterval is false", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== "processing"),
        (status) => {
          expect(refetchInterval(status)).toBe(false);
        },
      ),
    );
  });

  it("offline mode never calls api.get for any uploadId", async () => {
    mockIsApiEnabled.value = false;
    await fc.assert(
      fc.asyncProperty(fc.stringMatching(/^[a-z0-9-]{1,40}$/), async (uploadId) => {
        const result = await fetchTranscriptStatus(uploadId) as { status: string };
        expect(result.status).toBe("completed");
        expect(mockGet).not.toHaveBeenCalled();
      }),
    );
  });
});
