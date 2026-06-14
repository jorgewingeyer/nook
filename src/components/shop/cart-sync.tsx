"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HOST = process.env.NEXT_PUBLIC_CART_SYNC_HOST;

/**
 * Phase 3 — subscribes to the cart-sync Durable Object over WebSocket and
 * refreshes the route when the cart changes in another tab/device. Renders
 * nothing; no-op unless NEXT_PUBLIC_CART_SYNC_HOST and a roomId are present.
 */
export function CartSync({ roomId }: { roomId: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (!HOST || !roomId) return;

    const base = HOST.startsWith("http") ? HOST : `https://${HOST}`;
    const wsUrl = base.replace(/^http/, "ws") + `/room/${roomId}/subscribe`;

    let ws: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(typeof e.data === "string" ? e.data : "");
          if (data?.type === "cart_update") router.refresh();
        } catch {
          // ignore non-JSON frames (e.g. "pong")
        }
      };
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          // ignore
        }
      };
    }

    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, [roomId, router]);

  return null;
}
