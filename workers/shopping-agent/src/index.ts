import { Agent, callable, routeAgentRequest } from "agents";
import { generateText, stepCountIs, tool } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";
import { and, eq, like } from "drizzle-orm";
import { getDb } from "../../../src/lib/db";
import { categories, products } from "../../../src/db/schema";

interface Env {
  DB: unknown;
  AI: unknown;
  AI_GATEWAY_ID?: string;
}

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatState = { messages: ChatMessage[] };

// Tool-calling capable Workers AI model.
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SYSTEM = `Sos el asistente de compras de Nook, una tienda argentina de decoración del hogar.
Ayudás a encontrar productos del catálogo y respondés en español rioplatense, breve y cálido.
Usá SIEMPRE las herramientas para consultar el catálogo real: no inventes productos, precios ni stock.
Si no hay resultados, ofrecé alternativas o sugerí categorías. Mencioná el precio en pesos y el nombre exacto del producto.`;

/**
 * Phase 3 — Stateful shopping assistant built on the Cloudflare Agents SDK
 * (a Durable Object with embedded SQLite). Conversation history lives in the
 * agent state; product knowledge comes from tools over the Nook D1 catalog.
 * Inference runs on Workers AI.
 */
export class ShoppingAgent extends Agent<Env, ChatState> {
  initialState: ChatState = { messages: [] };

  @callable()
  async ask(message: string): Promise<string> {
    const text = (message ?? "").trim();
    if (!text) return "Contame qué estás buscando 🙂";

    const db = getDb(this.env.DB);
    const workersai = createWorkersAI({ binding: this.env.AI as never });

    const history = this.state.messages.slice(-8);
    const messages = [...history, { role: "user" as const, content: text }];

    const tools = {
      searchCatalog: tool({
        description: "Busca productos activos del catálogo por nombre o palabra clave.",
        inputSchema: z.object({ query: z.string().describe("término de búsqueda") }),
        execute: async ({ query }) =>
          db
            .select({
              name: products.name,
              slug: products.slug,
              price: products.price,
              stock: products.stock,
              description: products.description,
            })
            .from(products)
            .where(and(eq(products.status, "active"), like(products.name, `%${query}%`)))
            .limit(6),
      }),
      getProduct: tool({
        description: "Devuelve el detalle de un producto por su slug.",
        inputSchema: z.object({ slug: z.string() }),
        execute: async ({ slug }) =>
          (await db
            .select({
              name: products.name,
              slug: products.slug,
              price: products.price,
              stock: products.stock,
              description: products.description,
            })
            .from(products)
            .where(and(eq(products.slug, slug), eq(products.status, "active")))
            .get()) ?? { error: "no encontrado" },
      }),
      listCategories: tool({
        description: "Lista las categorías activas de la tienda.",
        inputSchema: z.object({}),
        execute: async () =>
          db
            .select({ name: categories.name, slug: categories.slug })
            .from(categories)
            .where(eq(categories.isActive, true))
            .limit(20),
      }),
    };

    const result = await generateText({
      model: workersai(MODEL),
      system: SYSTEM,
      messages,
      tools,
      stopWhen: stepCountIs(5),
    });

    const reply = result.text?.trim() || "Disculpá, no pude generar una respuesta. Probá reformular.";
    this.setState({
      messages: [...messages, { role: "assistant", content: reply }].slice(-16),
    });
    return reply;
  }

  @callable()
  reset(): void {
    this.setState({ messages: [] });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return (
      (await routeAgentRequest(request, env as never)) ??
      new Response("Not found", { status: 404 })
    );
  },
};
