// Function tools the agent can call during reasoning (§4.4).
// These return mock/in-memory data — the point is demonstrating agentic
// action, not real integrations. `searchKnowledgeBase` is handled by the
// Azure AI Foundry File Search tool, so it lives with the agent, not here.

import { MOCK_ORDERS } from "./mockData";
import type { Order, RefundEligibility, Severity, Ticket } from "./types";

/** Look up an order by id or customer email. */
export function lookupOrder(idOrEmail: string): Order | null {
  const q = idOrEmail.trim().toLowerCase();
  return (
    MOCK_ORDERS.find(
      (o) =>
        o.orderId.toLowerCase() === q || o.customerEmail.toLowerCase() === q,
    ) ?? null
  );
}

/**
 * Mock refund-policy check. The guardrail layer (§4.6) will enforce that the
 * agent never promises an amount above `maxAmount`.
 */
export function checkRefundEligibility(
  orderId: string,
  reason: string,
): RefundEligibility {
  const order = lookupOrder(orderId);
  if (!order) {
    return {
      eligible: false,
      maxAmount: 0,
      policyRef: "refund-policy.md#unknown-order",
      reason: "Order not found.",
    };
  }
  // Skeleton rule: delivered/shipped orders are refundable up to the charge
  // amount; everything else routes to a human. Real policy logic comes later.
  const eligible = order.status === "DELIVERED" || order.status === "SHIPPED";
  return {
    eligible,
    maxAmount: eligible ? order.amount : 0,
    policyRef: "refund-policy.md#standard",
    reason: eligible
      ? `Eligible under standard policy for status ${order.status} (reason: ${reason}).`
      : `Not auto-eligible for status ${order.status}; needs review.`,
  };
}

let ticketSeq = 4200;

/** Create a (mock) support ticket and return its id. */
export function createTicket(
  summary: string,
  severity: Severity,
  category: string,
): Ticket {
  ticketSeq += 1;
  return {
    ticketId: `TKT-${ticketSeq}`,
    summary,
    severity,
    category,
  };
}
