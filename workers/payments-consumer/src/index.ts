import { getDb } from "../../../src/lib/db";
import { processPaymentNotification } from "../../../src/lib/payments";

interface Env {
  DB: unknown;
  MP_ACCESS_TOKEN?: string;
  // Optional: delegate to the durable workflow when bound.
  ORDER_WORKFLOW?: { create: (opts: { params: unknown }) => Promise<unknown> };
}

interface PaymentMessage {
  paymentId: string;
}

interface QueueMessage<T> {
  body: T;
  ack: () => void;
  retry: () => void;
}

interface MessageBatch<T> {
  messages: QueueMessage<T>[];
}

/**
 * Phase 2a — standalone consumer for the `nook-payments` queue.
 * The Next app webhook enqueues `{ paymentId }`; this worker reconciles each
 * payment with retries + a dead-letter queue (configured in wrangler.jsonc).
 *
 * Deploy: from workers/payments-consumer/ run `wrangler deploy`, after
 * `wrangler secret put MP_ACCESS_TOKEN`.
 */
export default {
  async queue(batch: MessageBatch<PaymentMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const { paymentId } = message.body;
      try {
        if (env.ORDER_WORKFLOW?.create) {
          await env.ORDER_WORKFLOW.create({ params: { paymentId } });
          message.ack();
          continue;
        }

        const db = getDb(env.DB);
        const result = await processPaymentNotification(db, env.MP_ACCESS_TOKEN, paymentId);
        if (result.status >= 500) {
          message.retry();
        } else {
          message.ack();
        }
      } catch (err) {
        console.error("[payments-consumer] processing failed", paymentId, err);
        message.retry();
      }
    }
  },
};
