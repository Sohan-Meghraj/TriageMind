// Post-draft validator — the hard safety layer (§4.6). The agent's draft must
// pass this before it can be sent. If it fails, the self-correction loop
// revises and re-checks; if still failing, the case escalates.
//
// These are STUB rules for the skeleton — the full rule set (no invented
// compensation/dates/policies, no legal/medical claims) is a later step.

import type { DraftStep, RefundEligibility } from "./types";

export type GuardrailContext = {
  /** From checkRefundEligibility, if a refund was discussed. */
  refundEligibility?: RefundEligibility;
  /** How many KB citations back the draft (every claim should be grounded). */
  citationsCount: number;
};

export type GuardrailResult = { passed: boolean; issues: string[] };

const MONEY_RE = /\$\s?(\d+(?:\.\d{1,2})?)/g;

/**
 * Validate a drafted customer reply against policy. Returns the list of
 * violations found (empty list = passed).
 */
export function validateDraft(
  draft: DraftStep,
  ctx: GuardrailContext,
): GuardrailResult {
  const issues: string[] = [];
  const text = draft.reply ?? "";

  // Briefings (escalation path) skip customer-facing checks.
  if (!draft.reply) {
    return { passed: true, issues };
  }

  // Rule 1: never promise a refund above the eligible max.
  if (ctx.refundEligibility) {
    const { eligible, maxAmount } = ctx.refundEligibility;
    let m: RegExpExecArray | null;
    while ((m = MONEY_RE.exec(text)) !== null) {
      const promised = Number(m[1]);
      if (!eligible && promised > 0) {
        issues.push(
          `Promises $${promised} but order is not refund-eligible.`,
        );
      } else if (eligible && promised > maxAmount) {
        issues.push(
          `Promises $${promised}, above the eligible max of $${maxAmount}.`,
        );
      }
    }
  }

  // Rule 2: factual claims should be grounded in the KB.
  if (ctx.citationsCount === 0) {
    issues.push("Reply has no KB citations backing its claims.");
  }

  // Rule 3: no legal/medical claims (stub keyword check).
  if (/\b(guarantee|lawsuit|liable|diagnos|prescri)/i.test(text)) {
    issues.push("Contains a potential legal/medical claim.");
  }

  return { passed: issues.length === 0, issues };
}
