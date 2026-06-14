import { DurableObject } from "cloudflare:workers";

interface Env {
  CART_ROOM: DurableObjectNamespace;
  CART_SYNC_SECRET?: string;
}

/**
 * Phase 3 — real-time cart sync. One CartRoom Durable Object per cart (addressed
 * by a hashed session id). Browser tabs subscribe over a hibernatable WebSocket;
 * the Next app POSTs /publish after every cart mutation, and the room broadcasts
 * a `cart_update` ping so other tabs/devices re-fetch their cart. D1 stays the
 * source of truth — this only carries change notifications, never cart data.
 */
export class CartRoom extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") === "websocket") {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith("/publish")) {
      const sockets = this.ctx.getWebSockets();
      const payload = JSON.stringify({ type: "cart_update", ts: Date.now() });
      for (const ws of sockets) {
        try {
          ws.send(payload);
        } catch {
          // socket already gone
        }
      }
      return Response.json({ delivered: sockets.length });
    }

    return new Response("not found", { status: 404 });
  }

  // Keep-alive: clients may send "ping" to hold the connection.
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (message === "ping") {
      try {
        ws.send("pong");
      } catch {
        // ignore
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    try {
      ws.close(code);
    } catch {
      // ignore
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/room\/([A-Za-z0-9_-]+)\/(subscribe|publish)$/);
    if (!match) return new Response("not found", { status: 404 });

    const [, roomId, action] = match;

    if (
      action === "publish" &&
      env.CART_SYNC_SECRET &&
      request.headers.get("x-cart-secret") !== env.CART_SYNC_SECRET
    ) {
      return new Response("unauthorized", { status: 401 });
    }

    const stub = env.CART_ROOM.get(env.CART_ROOM.idFromName(roomId));
    return stub.fetch(request);
  },
};
