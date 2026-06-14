// Phase 2d — admin content generation via Workers AI, routed through AI Gateway
// (caching, rate-limit, spend caps). Feature-detects the AI binding and returns
// null when not provisioned.

const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";

interface AiBinding {
  run: (model: string, inputs: unknown, options?: unknown) => Promise<any>;
}

function gateway(env: any) {
  return env?.AI_GATEWAY_ID ? { gateway: { id: env.AI_GATEWAY_ID } } : undefined;
}

export interface ProductCopyInput {
  name: string;
  category?: string | null;
  attributes?: string | null;
}

function attributesHint(attributes?: string | null): string {
  if (!attributes) return "";
  try {
    const obj = JSON.parse(attributes) as Record<string, unknown>;
    const parts = Object.entries(obj).map(([k, v]) => `${k}: ${v}`);
    return parts.length ? ` Atributos: ${parts.join(", ")}.` : "";
  } catch {
    return "";
  }
}

/** Generate a warm, concise Spanish (rioplatense) product description. */
export async function generateProductDescription(
  env: any,
  p: ProductCopyInput,
): Promise<string | null> {
  const ai = env?.AI as AiBinding | undefined;
  if (!ai?.run) return null;

  const user = `Producto: ${p.name}${p.category ? `, categoría: ${p.category}` : ""}.${attributesHint(p.attributes)}`;
  try {
    const res = await ai.run(
      TEXT_MODEL,
      {
        messages: [
          {
            role: "system",
            content:
              "Sos redactor de e-commerce de Nook, una tienda argentina de decoración del hogar. Escribí una descripción cálida y atractiva en español rioplatense, máximo 60 palabras. No inventes materiales, medidas ni precios. Respondé solo con la descripción, sin comillas ni encabezados.",
          },
          { role: "user", content: user },
        ],
        max_tokens: 220,
      },
      gateway(env),
    );
    const text = String(res?.response ?? "").trim();
    return text || null;
  } catch (e) {
    console.error("[ai] description generation failed", e);
    return null;
  }
}

/** Generate 4-8 lowercase tags. Returns an array or null. */
export async function generateProductTags(
  env: any,
  p: ProductCopyInput,
): Promise<string[] | null> {
  const ai = env?.AI as AiBinding | undefined;
  if (!ai?.run) return null;

  const user = `Producto: ${p.name}${p.category ? `, categoría: ${p.category}` : ""}.${attributesHint(p.attributes)}`;
  try {
    const res = await ai.run(
      TEXT_MODEL,
      {
        messages: [
          {
            role: "system",
            content:
              "Generás etiquetas de búsqueda para un producto de decoración. Devolvé entre 4 y 8 etiquetas en español, en minúsculas, separadas por comas, sin numeración ni texto extra.",
          },
          { role: "user", content: user },
        ],
        max_tokens: 80,
      },
      gateway(env),
    );
    const text = String(res?.response ?? "");
    const tags = text
      .split(/[,\n]/)
      .map((t) => t.replace(/^[\s\-•\d.]+/, "").trim().toLowerCase())
      .filter((t) => t.length > 1 && t.length < 30);
    return tags.length ? Array.from(new Set(tags)).slice(0, 8) : null;
  } catch (e) {
    console.error("[ai] tag generation failed", e);
    return null;
  }
}

/** Generate alt text for a product image (accessibility/SEO). */
export async function generateAltText(env: any, imageBytes: ArrayBuffer): Promise<string | null> {
  const ai = env?.AI as AiBinding | undefined;
  if (!ai?.run) return null;

  try {
    const res = await ai.run(
      VISION_MODEL,
      {
        image: Array.from(new Uint8Array(imageBytes)),
        prompt:
          "Describí esta imagen de producto en una frase corta en español para usar como texto alternativo accesible. Sé concreto y conciso.",
        max_tokens: 80,
      },
      gateway(env),
    );
    const text = String(res?.description ?? res?.response ?? "").trim();
    return text || null;
  } catch (e) {
    console.error("[ai] alt-text generation failed", e);
    return null;
  }
}
