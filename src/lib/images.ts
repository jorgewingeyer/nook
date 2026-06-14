export interface MediaTransform {
  w?: number;
  h?: number;
  q?: number;
  format?: string;
}

/**
 * Build a URL to an R2-backed media object, optionally with Cloudflare Images
 * transform params. Use for plain <img> tags or anywhere outside next/image
 * (next/image uses the custom loader in src/lib/image-loader.ts instead).
 */
export function mediaUrl(key: string, t?: MediaTransform): string {
  const base = `/api/media/${key}`;
  if (!t) return base;
  const p = new URLSearchParams();
  if (t.w) p.set("w", String(t.w));
  if (t.h) p.set("h", String(t.h));
  if (t.q) p.set("q", String(t.q));
  p.set("format", t.format ?? "avif");
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Responsive srcset across the given widths (for plain <img srcset>). */
export function mediaSrcSet(
  key: string,
  widths: number[],
  t?: Omit<MediaTransform, "w">,
): string {
  return widths.map((w) => `${mediaUrl(key, { ...t, w })} ${w}w`).join(", ");
}
