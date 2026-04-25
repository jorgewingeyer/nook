import { getCloudflareContext } from "@opennextjs/cloudflare";
import { downloadFile } from "@/lib/storage";

export async function GET(
  _request: Request,
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
    const headers = new Headers();
    headers.set("Content-Type", r2Object.httpMetadata?.contentType ?? "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(r2Object.body, { headers });
  } catch {
    return new Response("Error fetching file", { status: 500 });
  }
}
