/**
 * GA4 custom events for mobile growth funnel.
 * Never send raw search text or PII.
 */

export type GolfMapAnalyticsEvent =
  | "mobile_home_search"
  | "quick_filter_click"
  | "map_filter_open"
  | "map_filter_apply"
  | "map_list_toggle"
  | "course_card_open"
  | "course_call_click"
  | "course_map_click"
  | "course_reservation_click"
  | "collection_map_continue"
  | "mobile_gallery_swipe";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  event: GolfMapAnalyticsEvent,
  params: EventParams = {},
): void {
  if (typeof window === "undefined") return;
  const payload: EventParams = { ...params };
  // Strip accidental free-text query fields
  delete payload.q;
  delete payload.query;
  delete payload.search;
  try {
    window.gtag?.("event", event, payload);
  } catch {
    /* analytics must never break UX */
  }
}
