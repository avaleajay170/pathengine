import type { ApiError, ApiResult } from "@/lib/types/api";

const configuredBaseUrl = import.meta.env["VITE_API_BASE_URL"]?.trim();
export const isApiEnabled = Boolean(configuredBaseUrl);

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  token?: string;
}

function errorFromResponse(status: number, payload: unknown): ApiError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const data = error as Partial<ApiError>;
      return {
        status,
        message: typeof data.message === "string" ? data.message : "Request failed",
        ...(typeof data.code === "string" && { code: data.code }),
        ...(data.details && { details: data.details }),
      };
    }
  }
  return { status, message: status === 429 ? "Please wait and try again." : "Request failed" };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  if (!configuredBaseUrl) {
    return { ok: false, error: { status: 0, message: "API is not configured" } };
  }

  const url = new URL(path, `${configuredBaseUrl.replace(/\/$/, "")}/`);
  Object.entries(options.params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (!isFormData) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  try {
    const { params: _params, body: requestBody, token: _token, ...requestInit } = options;
    const init: RequestInit = { ...requestInit, headers };
    if (requestBody !== undefined) {
      init.body = isFormData ? (requestBody as BodyInit) : JSON.stringify(requestBody);
    }
    const response = await fetch(url, init);
    const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) return { ok: false, error: errorFromResponse(response.status, payload) };
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, error: { status: 0, message: "Unable to reach the API" } };
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};