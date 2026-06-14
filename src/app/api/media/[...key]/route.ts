import { getCloudflareContext } from "@opennextjs/cloudflare";
import { downloadFile } from "@/lib/storage";

const TRANSFORMABLE = /^image\/(jpeg|png|webp|avif|gif)$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  try {
    const { env } = await getCloudflareContext();
    const object = await downloadFile((env as any).R2_BUCKET, key);

    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const r2Object = object as any;
    const contentType = r2Object.httpMetadata?.contentType ?? "application/octet-stream";
    const buf: ArrayBuffer = await r2Object.arrayBuffer();

    const url = new URL(request.url);
    const w = Number(url.searchParams.get("w")) || undefined;
    const h = Number(url.searchParams.get("h")) || undefined;
    const q = Number(url.searchParams.get("q")) || undefined;
    const fmtParam = url.searchParams.get("format");
    const images = (env as any).IMAGES;

    const wantsTransform = Boolean((w || h || fmtParam) && TRANSFORMABLE.test(contentType));

    if (wantsTransform && images?.input) {
      try {
        const format = fmtParam
          ? fmtParam.startsWith("image/")
            ? fmtParam
            : `image/${fmtParam}`
          : "image/avif";

        const transform: Record<string, unknown> = {
          fit: url.searchParams.get("fit") ?? "cover",
        };
        if (w) transform.width = w;
        if (h) transform.height = h;

        const output: Record<string, unknown> = { format };
        if (q) output.quality = q;

        const result = await images.input(buf).transform(transform).output(output);
        const resp: Response = result.response();
        const headers = new Headers();
        headers.set("Content-Type", resp.headers.get("content-type") ?? format);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        return new Response(resp.body, { headers, status: resp.status });
      } catch (err) {
        // Transform unavailable (e.g. binding not active locally) → serve original.
        console.warn("[media] image transform failed, serving original", err);
      }
    }

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    return new Response(buf, { headers });
  } catch {
    return new Response("Error fetching file", { status: 500 });
  }
}
