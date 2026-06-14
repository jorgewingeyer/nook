"use client";

import { useState } from "react";
import { useAgent } from "agents/react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

const AGENT_HOST = process.env.NEXT_PUBLIC_AGENT_HOST;

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Phase 3 — floating shopping assistant powered by the Cloudflare Agents SDK.
 * Renders only when NEXT_PUBLIC_AGENT_HOST points at the deployed agent worker,
 * so the storefront is unaffected until the agent is provisioned.
 */
export function ShoppingAssistant() {
  if (!AGENT_HOST) return null;
  return <ShoppingAssistantInner host={AGENT_HOST} />;
}

function ShoppingAssistantInner({ host }: { host: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const agent = useAgent({ agent: "ShoppingAgent", host });

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const reply = (await (agent.stub as { ask: (m: string) => Promise<string> }).ask(text)) ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Hubo un problema. Probá de nuevo." }]);
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir asistente de compras"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-cream shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-sand/60 bg-warm-white shadow-xl">
      <header className="flex items-center justify-between border-b border-sand/60 bg-espresso px-4 py-3">
        <span className="flex items-center gap-2 font-medium text-cream">
          <Sparkles className="h-4 w-4 text-gold-light" strokeWidth={1.5} />
          Asistente Nook
        </span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="text-cream/80 hover:text-cream">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-warm-gray">
            Hola 👋 Contame qué buscás y te ayudo a encontrarlo en el catálogo.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-gold/20 text-espresso"
                : "mr-auto bg-parchment text-espresso"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="mr-auto flex items-center gap-2 rounded-lg bg-parchment px-3 py-2 text-sm text-warm-gray">
            <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-sand/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Buscar un regalo, una lámpara…"
          className="flex-1 rounded-lg border border-sand/60 bg-cream px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Enviar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-espresso text-cream disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
