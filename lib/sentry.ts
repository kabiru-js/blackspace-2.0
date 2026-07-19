// Sentry client configuration
// To enable: add NEXT_PUBLIC_SENTRY_DSN to .env.local and uncomment below

/*
import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
*/

// Fallback: log errors to console in production
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    console.error("[Error]", error.message, context || {});
  }
}
