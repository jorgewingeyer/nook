import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../src/lib/db";
import { processPaymentNotification, restoreOrderStock } from "../../../src/lib/payments";
import { orders } from "../../../src/db/schema";

interface Env {
  DB: unknown;
  MP_ACCESS_TOKEN?: string;
}

/**
 * Phase 2b — durable, multi-step post-payment reconciliation.
 * Each step.do result is checkpointed; if the worker is recycled the run
 * resumes at the last incomplete step. Triggered by the queue consumer (or
 * directly) with { paymentId }.
 */
export class OrderWorkflow extends WorkflowEntrypoint<Env, { paymentId: string }> {
  async run(event: WorkflowEvent<{ paymentId: string }>, step: WorkflowStep) {
    const { paymentId } = event.payload;

    const result = await step.do("process-payment", async () => {
      const db = getDb(this.env.DB);
      return processPaymentNotification(db, this.env.MP_ACCESS_TOKEN, paymentId);
    });

    if (result.lowStock && result.lowStock.length > 0) {
      await step.do("low-stock-alert", async () => {
        // Hook for Phase 3 notifications (email/Slack/Queue). For now, log.
        console.warn("[order-workflow] low stock detected", result.lowStock);
        return { notified: result.lowStock!.length };
      });
    }

    return result;
  }
}

/**
 * Phase 2b — pending-order expiry / abandoned checkout.
 * Stock is reserved at checkout; if a pending order is never paid, this
 * releases the reserved stock after a wait window. Triggered from
 * checkout.action.ts at order creation.
 */
export class PendingOrderExpiryWorkflow extends WorkflowEntrypoint<
  Env,
  { orderId: number; orderNumber: string }
> {
  async run(
    event: WorkflowEvent<{ orderId: number; orderNumber: string }>,
    step: WorkflowStep,
  ) {
    const { orderId, orderNumber } = event.payload;

    await step.sleep("await-payment-window", "24 hours");

    await step.do("expire-if-unpaid", async () => {
      const db = getDb(this.env.DB);
      const order = await db
        .select({ paymentStatus: orders.paymentStatus })
        .from(orders)
        .where(eq(orders.id, orderId))
        .get();

      if (!order) return { skipped: "not-found" };
      if (order.paymentStatus !== "pending") return { skipped: order.paymentStatus };

      await restoreOrderStock(db, orderId, orderNumber, "Pedido expirado sin pago");
      return { expired: true };
    });
  }
}

// Workers that only host Workflow classes still need a default export.
export default {
  async fetch(): Promise<Response> {
    return new Response("nook workflows", { status: 200 });
  },
};
