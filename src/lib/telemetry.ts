/**
 * Client-side error reporting.
 *
 * There is no error-tracking vendor wired into this app, and hard-coding one inside an
 * error boundary is how boundaries become untestable. So the boundary calls
 * `captureError`, and whoever starts the app decides where reports go by calling
 * `setErrorSink` once — a real service in production, a spy in tests, nothing at all in
 * development, where the console fallback is enough.
 */

export interface ErrorReport {
  /** Readable summary, already unwrapped from Response, Error, or an unknown throw. */
  message: string;
  stack?: string | undefined;
  /** Which boundary caught it, e.g. "root". */
  boundary: string;
  /** Path the user was on when it failed. */
  route: string;
  capturedAt: string;
}

export type ErrorSink = (report: ErrorReport) => void;

let sink: ErrorSink | undefined;

/** Register the destination for captured errors. Pass undefined to unregister. */
export function setErrorSink(next: ErrorSink | undefined): void {
  sink = next;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function describe(error: unknown): Pick<ErrorReport, "message" | "stack"> {
  // Router loaders and server functions throw a bare Response to signal a redirect or
  // an HTTP failure. String(response) is the useless "[object Response]", so read the
  // status and URL off it instead.
  if (error instanceof Response) {
    return { message: `HTTP ${error.status}${error.url ? ` for ${error.url}` : ""}` };
  }
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: typeof error === "string" ? error : safeStringify(error) };
}

/**
 * Report an error caught by a React error boundary.
 *
 * No-ops on the server: SSR failures are already logged with their full cause chain by
 * the wrapper in `src/server.ts`, so reporting them here would only duplicate them.
 */
export function captureError(error: unknown, context: { boundary: string }): void {
  if (typeof window === "undefined") return;

  const report: ErrorReport = {
    ...describe(error),
    boundary: context.boundary,
    route: window.location.pathname,
    capturedAt: new Date().toISOString(),
  };

  if (sink) {
    sink(report);
    return;
  }

  // Production React does not rethrow boundary-caught errors to window.onerror, so
  // without this the failure would leave no trace at all in the console.
  console.error(`[${report.boundary}] ${report.message}`, error);
}
