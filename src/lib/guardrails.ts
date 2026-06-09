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

export type InjectionResult = { detected: boolean; reason: string };

// Patterns that signal an attempt to manipulate the agent rather than a genuine
// complaint (prompt injection / jailbreak). A real Foundry build pairs this
// with Azure Content Safety Prompt Shields; the regex layer is a cheap,
// deterministic first line that also makes the defense demoable offline.
const INJECTION_PATTERNS: { re: RegExp; label: string }[] = [
  {
    re: /ignore\s+(?:the\s+|all\s+|your\s+|these\s+|any\s+)?(?:previous\s+|prior\s+|above\s+|earlier\s+)?(?:instructions|prompts?|rules|directions)/i,
    label: "asks the agent to ignore its instructions",
  },
  {
    re: /disregard\s+(?:the\s+|all\s+|your\s+)?(?:previous\s+|prior\s+)?(?:instructions|rules|policy|policies)/i,
    label: "asks the agent to disregard policy",
  },
  {
    re: /\b(?:developer|admin|administrator|god|jailbreak|dan)\s*mode\b/i,
    label: "invokes a fake privileged mode",
  },
  {
    re: /(?:^|\b)(?:system|assistant)\s*:|\[\s*system\s*\]|<\s*system\s*>/i,
    label: "injects a fake system/role message",
  },
  {
    re: /\b(?:override|bypass|turn\s+off|disable)\b.{0,30}\b(?:policy|policies|rules?|guardrails?|instructions|checks?|safety)\b/i,
    label: "tries to override or disable the rules",
  },
  {
    re: /\bI\s*am\s+(?:the|your|a)\s+(?:developer|admin|administrator|engineer|owner|ceo)\b/i,
    label: "falsely claims privileged authority",
  },
  {
    re: /\b(?:pretend|act)\s+(?:to\s+be|as)\b|\byou\s+are\s+now\b/i,
    label: "tries to redefine the agent's role",
  },
];

/**
 * Scan an incoming complaint for manipulation attempts. Input-side guardrail:
 * a positive hit must route to a human (never auto-resolve) so an attacker
 * can't talk the agent past policy.
 */
export function detectPromptInjection(text: string): InjectionResult {
  for (const { re, label } of INJECTION_PATTERNS) {
    if (re.test(text)) {
      return { detected: true, reason: `Message ${label}.` };
    }
  }
  return { detected: false, reason: "" };
}

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
  const text = draft.reply ?? draft.evidenceRequest ?? "";

  // Briefings (escalation path) are internal — skip customer-facing checks.
  if (!draft.reply && !draft.evidenceRequest) {
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

  // Rule 2: a resolving reply makes factual claims that must be grounded. An
  // evidence request makes no such claims, so it's exempt.
  if (draft.reply && ctx.citationsCount === 0) {
    issues.push("Reply has no KB citations backing its claims.");
  }

  // Rule 3: no legal/medical claims (stub keyword check).
  if (/\b(guarantee|lawsuit|liable|diagnos|prescri)/i.test(text)) {
    issues.push("Contains a potential legal/medical claim.");
  }

  return { passed: issues.length === 0, issues };
}
