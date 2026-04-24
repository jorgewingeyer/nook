interface CloudflareEnv {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ASSETS: Fetcher;
  IMAGES: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
  NEXT_PUBLIC_CDN_URL?: string;
}

type CloudflareEnvWithoutBindings = Omit<CloudflareEnv, "ASSETS" | "IMAGES" | "WORKER_SELF_REFERENCE">;

declare global {
  interface CloudflareEnvironment extends CloudflareEnvWithoutBindings {}
}

export type {};
