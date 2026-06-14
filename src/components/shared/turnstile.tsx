"use client";

import { useEffect, useRef, useState } from "react";

const TEST_SITE_KEY = "1x00000000000000000000AA";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile widget. Exposes the resulting token two ways:
 *  - a hidden input named `cf-turnstile-response` (picked up automatically by
 *    forms that submit via FormData, e.g. the checkout form)
 *  - the `onToken` callback (for flows that don't use FormData, e.g. login)
 */
export function Turnstile({
  onToken,
  className,
}: {
  onToken?: (token: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    let cancelled = false;

    function render() {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        callback: (t: string) => {
          setToken(t);
          onToken?.(t);
        },
        "error-callback": () => {
          setToken("");
          onToken?.("");
        },
        "expired-callback": () => {
          setToken("");
          onToken?.("");
        },
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", render);
      } else {
        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.addEventListener("load", render);
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          // widget already gone
        }
        widgetId.current = null;
      }
    };
    // onToken is intentionally excluded; callers pass a stable setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <div ref={ref} />
      <input type="hidden" name="cf-turnstile-response" value={token} />
    </div>
  );
}
