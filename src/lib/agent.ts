// The triage engine. For the skeleton this is a STUB that produces the 6
// reasoning steps from simple heuristics + the real tool/guardrail functions,
// so the end-to-end pipeline (stream -> UI) works with zero Azure access.
//
// LATER: replace the body of `runTriage` with an Azure AI Foundry Agent run
// (create thread -> run with File Search + function tools -> map run steps to
// StepEvent). The signature and StepEvent contract stay the same, so the API
// route, UI, and eval harness do not change.

import {
  CONFIDENCE_THRESHOLD,
  EVIDENCE_THRESHOLD,
  type Action,
  type ClassifyStep,
  type Complaint,
  type DecideStep,
  type DraftStep,
  type GroundStep,
  type Reasoning,
  type RefundEligibility,
  type SelfCheckStep,
  type Severity,
  type StepEvent,
  type UnderstandStep,
} from "./types";
import { checkRefundEligibility, lookupOrder } from "./tools";
import { validateDraft } from "./guardrails";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const has = (text: string, words: string[]) =>
  words.some((w) => text.toLowerCase().includes(w));

function understand(text: string): UnderstandStep {
  const issues: string[] = [];
  if (has(text, ["refund", "money back", "charge"])) issues.push("Refund request");
  if (has(text, ["broken", "defective", "not working", "damaged", "dent"]))
    issues.push("Product defect");
  if (has(text, ["late", "delay", "still waiting", "never arrived"]))
    issues.push("Delivery delay");
  if (has(text, ["rude", "support", "no response", "ignored"]))
    issues.push("Service complaint");
  if (issues.length === 0) issues.push("General inquiry");

  const churnRisk = has(text, [
    "cancel",
    "never again",
    "switching",
    "competitor",
    "lawyer",
    "furious",
  ]);
  const intent = churnRisk
    ? "At-risk customer seeking resolution"
    : "Customer seeking help with an issue";
  return { issues, intent, churnRisk };
}

function classify(text: string, churnRisk: boolean): ClassifyStep {
  let severity: Severity = "LOW";
  if (has(text, ["broken", "charged twice", "fraud", "urgent"])) severity = "MED";
  if (churnRisk || has(text, ["lawyer", "furious", "unacceptable"]))
    severity = "HIGH";

  const category: string[] = [];
  if (has(text, ["refund", "charge", "billing", "payment"])) category.push("Billing");
  if (has(text, ["broken", "defective", "quality"])) category.push("Product");
  if (has(text, ["late", "delivery", "shipping"])) category.push("Shipping");
  if (category.length === 0) category.push("General");

  const sentiment = churnRisk
    ? "Negative / frustrated"
    : has(text, ["thanks", "please", "appreciate"])
      ? "Neutral / polite"
      : "Neutral";
  return { severity, category, sentiment };
}

function ground(issues: string[]): GroundStep {
  // Stub citations — real passages come from File Search later.
  const citations = [];
  if (issues.includes("Refund request")) {
    citations.push({
      doc: "refund-policy.md",
      snippet: "Standard refunds are available within 30 days of delivery.",
    });
  }
  if (issues.includes("Delivery delay")) {
    citations.push({
      doc: "known-issues.md",
      snippet: "Carrier delays in some regions may add 2–3 business days.",
    });
  }
  if (issues.includes("Product defect")) {
    citations.push({
      doc: "refund-policy.md",
      snippet:
        "For damage or defect claims, a photo of the item helps us verify the issue and prevent it from recurring.",
    });
  }
  citations.push({
    doc: "tone-guide.md",
    snippet: "Acknowledge the issue, apologize once, and state the next step.",
  });
  return { citations };
}

/** Has the customer already supplied a photo (flag or mentioned in the text)? */
function hasPhotoEvidence(complaint: Complaint): boolean {
  return complaint.hasPhoto || has(complaint.text, ["attach", "enclosed", "photo:"]);
}

/**
 * Risk-based verification gate. Photographable damage/defect refunds worth more
 * than EVIDENCE_THRESHOLD, with no photo on file, get a polite request for one
 * before we resolve — framed as "help us find the cause," not "prove it."
 * Cheap claims and non-photographable issues (e.g. delivery delays) skip this.
 */
function assessVerification(
  u: UnderstandStep,
  refund: RefundEligibility | undefined,
  hasPhoto: boolean,
): { needed: boolean; reason: string } {
  if (!u.issues.includes("Product defect"))
    return { needed: false, reason: "" };
  if (hasPhoto)
    return { needed: false, reason: "Customer already supplied photo evidence." };
  if (!refund?.eligible) return { needed: false, reason: "" };
  if (refund.maxAmount < EVIDENCE_THRESHOLD)
    return {
      needed: false,
      reason: `Low-value claim ($${refund.maxAmount}) — verification friction isn't worth it.`,
    };
  return {
    needed: true,
    reason: `Damage/defect refund of $${refund.maxAmount} (≥ $${EVIDENCE_THRESHOLD}) with no photo on file — request a photo before resolving.`,
  };
}

export async function* runTriage(
  complaint: Complaint,
): AsyncGenerator<StepEvent> {
  const text = complaint.text;

  // Step 1 — Understand
  await delay(350);
  const u = understand(text);
  yield { type: "step", step: "understand", data: u };

  // Step 2 — Classify
  await delay(350);
  const c = classify(text, u.churnRisk);
  yield { type: "step", step: "classify", data: c };

  // Step 3 — Ground (RAG + citations)
  await delay(350);
  const g = ground(u.issues);
  yield { type: "step", step: "ground", data: g };

  // (Tool call) — look up the order + refund eligibility when relevant.
  const order = complaint.customerEmail
    ? lookupOrder(complaint.customerEmail)
    : null;
  const refund =
    u.issues.includes("Refund request") && order
      ? checkRefundEligibility(order.orderId, u.issues.join(", "))
      : undefined;

  const verification = assessVerification(u, refund, hasPhotoEvidence(complaint));

  // Step 4 — Decide (confidence-gated, §4.2; then verification-gated)
  await delay(350);
  let confidence = 0.9;
  if (c.severity === "MED") confidence -= 0.2;
  if (c.severity === "HIGH") confidence -= 0.45;
  if (u.churnRisk) confidence -= 0.1;
  confidence = Math.max(0.1, Math.min(0.99, confidence));

  // Escalation takes priority — a furious/at-risk customer goes to a human, not
  // a photo request. Otherwise, verifiable damage claims request evidence first.
  let action: Action;
  let reason: string;
  if (confidence < CONFIDENCE_THRESHOLD) {
    action = "ESCALATE";
    reason = `Severity ${c.severity}${u.churnRisk ? " + churn risk" : ""} lowers confidence below the ${CONFIDENCE_THRESHOLD} threshold.`;
  } else if (verification.needed) {
    action = "REQUEST_EVIDENCE";
    reason = verification.reason;
  } else {
    action = "AUTO_RESOLVE";
    reason = "High confidence and low severity — routine case, safe to auto-resolve.";
  }
  const d: DecideStep = { action, confidence, reason };
  yield { type: "step", step: "decide", data: d };

  // Step 5 — Draft (grounded reply OR human briefing)
  await delay(350);
  let draft: DraftStep;
  if (d.action === "AUTO_RESOLVE") {
    draft = {
      reply: `Hi, thanks for reaching out — sorry for the trouble with ${u.issues.join(
        " and ",
      )}. Per our policy [refund-policy.md], here's how we'll make it right. Let me know if anything else comes up.`,
    };
  } else if (d.action === "REQUEST_EVIDENCE") {
    draft = {
      evidenceRequest: `Hi, I'm really sorry your order arrived damaged — that's not the experience we want for you. So we can find out exactly what went wrong and make sure it doesn't happen again, could you reply with a quick photo of the damage (and the packaging too, if you still have it)? As soon as I have that, I'll get your refund sorted right away. Thanks for helping us put this right.`,
    };
  } else {
    draft = {
      briefing: [
        `Issues: ${u.issues.join(", ")}`,
        `Severity: ${c.severity} | Sentiment: ${c.sentiment} | Churn risk: ${u.churnRisk ? "yes" : "no"}`,
        `KB refs: ${g.citations.map((x) => x.doc).join(", ")}`,
        order ? `Order: ${order.orderId} (${order.status})` : "Order: not found",
        refund
          ? `Refund: eligible=${refund.eligible}, max=$${refund.maxAmount}`
          : "Refund: n/a",
        `Why escalated: ${d.reason}`,
      ].join("\n"),
    };
  }
  yield { type: "step", step: "draft", data: draft };

  // Step 6 — Self-check (+ self-correction loop, §4.3)
  await delay(350);
  const gr = validateDraft(draft, {
    refundEligibility: refund,
    citationsCount: g.citations.length,
  });
  const selfCheck: SelfCheckStep = {
    passed: gr.passed,
    issues: gr.issues,
    retries: 0,
  };
  yield { type: "step", step: "selfCheck", data: selfCheck };

  const reasoning: Reasoning = {
    understand: u,
    classify: c,
    ground: g,
    decide: d,
    draft,
    selfCheck,
  };
  yield { type: "done", result: { complaint, reasoning } };
}
