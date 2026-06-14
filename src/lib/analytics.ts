// Phase 3 — Workers Analytics Engine. Fire-and-forget storefront event tracking
// for funnel/product analytics. Feature-detects the ANALYTICS binding and is a
// no-op when it's absent, so the app is unaffected locally / before provisioning.
//
// Query later via the GraphQL/SQL API, e.g.:
//   SELECT blob1 AS event, blob2 AS slug, count() AS n
//   FROM nook_events GROUP BY event, slug ORDER BY n DESC

interface AnalyticsBinding {
  writeDataPoint: (event: {
    indexes?: string[];
    blobs?: (string | null)[];
    doubles?: number[];
  }) => void;
}

export type StorefrontEvent =
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "order_created"
  | "search";

export interface TrackOptions {
  slug?: string | null;
  query?: string | null;
  sessionId?: string | null;
  productId?: number;
  value?: number;
  quantity?: number;
}

/**
 * Records a storefront event. Synchronous and non-throwing — safe to call
 * inline in server actions without awaiting or try/catch at the call site.
 */
export function trackEvent(env: any, type: StorefrontEvent, opts: TrackOptions = {}): void {
  const analytics = env?.ANALYTICS as AnalyticsBinding | undefined;
  if (!analytics?.writeDataPoint) return;
  try {
    analytics.writeDataPoint({
      // indexes drive sampling; key by event type.
      indexes: [type],
      blobs: [type, opts.slug ?? opts.query ?? "", opts.sessionId ?? ""],
      doubles: [opts.value ?? 0, opts.productId ?? 0, opts.quantity ?? 0],
    });
  } catch {
    // analytics must never break a request
  }
}
