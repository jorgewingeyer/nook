// Phase 2c — semantic catalog search + related products via Workers AI
// (embeddings) and Vectorize. All functions feature-detect their bindings and
// no-op (returning null) when AI/VECTORIZE are not provisioned, so the app
// keeps working on the SQL search path locally.

const EMBED_MODEL = "@cf/baai/bge-m3"; // multilingual (es), 1024 dimensions

interface AiBinding {
  run: (model: string, inputs: unknown, options?: unknown) => Promise<any>;
}

interface VectorizeMatch {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, unknown>;
}

interface VectorizeBinding {
  upsert: (
    vectors: { id: string; values: number[]; metadata?: Record<string, unknown> }[],
  ) => Promise<unknown>;
  query: (
    vector: number[],
    opts: { topK?: number; returnMetadata?: boolean | "all" | "none"; returnValues?: boolean },
  ) => Promise<{ matches: VectorizeMatch[] }>;
  deleteByIds: (ids: string[]) => Promise<unknown>;
  getByIds: (ids: string[]) => Promise<VectorizeMatch[]>;
}

export interface IndexableProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  tags?: string | null;
  categoryName?: string | null;
  status?: string;
}

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function productText(p: IndexableProduct): string {
  return [p.name, p.categoryName ?? "", p.description ?? "", parseTags(p.tags).join(", ")]
    .filter(Boolean)
    .join(". ");
}

function gateway(env: any) {
  return env?.AI_GATEWAY_ID ? { gateway: { id: env.AI_GATEWAY_ID } } : undefined;
}

export async function embedText(env: any, text: string): Promise<number[] | null> {
  const ai = env?.AI as AiBinding | undefined;
  if (!ai?.run || !text.trim()) return null;
  try {
    const res = await ai.run(EMBED_MODEL, { text: [text] }, gateway(env));
    const vec = res?.data?.[0];
    return Array.isArray(vec) ? (vec as number[]) : null;
  } catch (e) {
    console.error("[search] embed failed", e);
    return null;
  }
}

/** Upsert (or remove, if not active) a product's embedding in Vectorize. */
export async function indexProduct(env: any, product: IndexableProduct): Promise<void> {
  const vectorize = env?.VECTORIZE as VectorizeBinding | undefined;
  if (!vectorize?.upsert) return;

  if (product.status && product.status !== "active") {
    await removeProductFromIndex(env, product.id);
    return;
  }

  const vector = await embedText(env, productText(product));
  if (!vector) return;

  try {
    await vectorize.upsert([
      { id: String(product.id), values: vector, metadata: { productId: product.id, slug: product.slug } },
    ]);
  } catch (e) {
    console.error("[search] upsert failed", e);
  }
}

export async function removeProductFromIndex(env: any, productId: number): Promise<void> {
  const vectorize = env?.VECTORIZE as VectorizeBinding | undefined;
  if (!vectorize?.deleteByIds) return;
  try {
    await vectorize.deleteByIds([String(productId)]);
  } catch (e) {
    console.error("[search] delete failed", e);
  }
}

/** Returns product ids ranked by semantic similarity, or null if unavailable. */
export async function semanticProductIds(
  env: any,
  query: string,
  topK = 24,
): Promise<number[] | null> {
  const vectorize = env?.VECTORIZE as VectorizeBinding | undefined;
  if (!vectorize?.query) return null;

  const vector = await embedText(env, query);
  if (!vector) return null;

  try {
    const res = await vectorize.query(vector, { topK, returnMetadata: "all" });
    return res.matches
      .map((m) => Number(m.metadata?.productId ?? m.id))
      .filter((n) => !Number.isNaN(n));
  } catch (e) {
    console.error("[search] query failed", e);
    return null;
  }
}

/** Returns related product ids for a given product, or null if unavailable. */
export async function relatedProductIds(
  env: any,
  productId: number,
  topK = 6,
): Promise<number[] | null> {
  const vectorize = env?.VECTORIZE as VectorizeBinding | undefined;
  if (!vectorize?.query || !vectorize?.getByIds) return null;

  try {
    const stored = await vectorize.getByIds([String(productId)]);
    const vector = stored?.[0]?.values;
    if (!vector) return null;

    const res = await vectorize.query(vector, { topK: topK + 1, returnMetadata: "all" });
    return res.matches
      .map((m) => Number(m.metadata?.productId ?? m.id))
      .filter((n) => !Number.isNaN(n) && n !== productId)
      .slice(0, topK);
  } catch (e) {
    console.error("[search] related query failed", e);
    return null;
  }
}
