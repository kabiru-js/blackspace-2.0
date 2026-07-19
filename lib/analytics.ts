// PostHog analytics
// To enable: add NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST to .env.local
// Then uncomment the providers code below

/*
import posthog from "posthog-js";

export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false,
  });
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(event, properties);
  }
}
*/

// Fallback: no-op analytics
export function track(
  _event: string,
  _properties?: Record<string, unknown>
) {
  // Analytics not configured — add NEXT_PUBLIC_POSTHOG_KEY to enable
}

export function trackPageView() {
  track("$pageview");
}
