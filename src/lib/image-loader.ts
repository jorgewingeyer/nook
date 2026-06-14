type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * Custom next/image loader. Routes R2-backed product media through the
 * /api/media endpoint with Cloudflare Images transform params, so next/image
 * generates a responsive AVIF srcset automatically. Non-media srcs (external
 * or static assets) are returned untouched.
 */
export default function mediaImageLoader({ src, width, quality }: LoaderArgs): string {
  if (!src.startsWith("/api/media/")) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}&q=${quality ?? 72}&format=avif`;
}
