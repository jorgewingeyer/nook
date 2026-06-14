# Nook standalone workers (Phase 2)

These are deployed independently of the Next app (OpenNext worker). They share
the same D1 database and import pure logic from `../src/lib`. Set each
`database_id` to the real Nook D1 id before deploying.

## payments-consumer (Phase 2a — Queues)

Consumes the `nook-payments` queue and reconciles MercadoPago payments with
retries + a dead-letter queue. The Next app enqueues `{ paymentId }` from the
webhook when `QUEUE_PAYMENTS` is bound.

```bash
# one-time provisioning
wrangler queues create nook-payments
wrangler queues create nook-payments-dlq

cd workers/payments-consumer
wrangler secret put MP_ACCESS_TOKEN
wrangler deploy
```

## order-workflow (Phase 2b — Workflows)

Hosts `OrderWorkflow` (durable post-payment pipeline) and
`PendingOrderExpiryWorkflow` (releases reserved stock for orders left unpaid).
The Next app references these via `script_name: "nook-workflows"` (see the
commented `workflows` block in the root `wrangler.jsonc`).

```bash
cd workers/order-workflow
wrangler secret put MP_ACCESS_TOKEN
wrangler deploy
```

## shopping-agent (Phase 3 — Agents SDK)

A stateful AI shopping assistant: `ShoppingAgent` (a Durable Object with embedded
SQLite) answers catalog questions using Workers AI + tools over D1. The storefront
chat widget (`src/components/shop/shopping-assistant.tsx`) connects via
`agents/react` when `NEXT_PUBLIC_AGENT_HOST` is set.

```bash
cd workers/shopping-agent
wrangler deploy
# then point the app at it:
#   NEXT_PUBLIC_AGENT_HOST=nook-shopping-agent.<account>.workers.dev
```

Needs the Workers Paid plan (Durable Objects + Workers AI). Optionally set
`AI_GATEWAY_ID` (already in its wrangler.jsonc) and create the gateway for
caching/limits.

## Type-checking (optional)

These workers use the workerd runtime (`cloudflare:workers`, queue/workflow
globals). To type-check locally:

```bash
pnpm add -D @cloudflare/workers-types
npx tsc -p workers/tsconfig.json --noEmit
```
