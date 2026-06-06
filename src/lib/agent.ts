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
  type ClassifyStep,
  type Complaint,
  type DecideStep,
  type DraftStep,
  type GroundStep,
  type Reasoning,
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
  if (has(text, ["broken", "defective", "not working", "damaged"]))
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
  citations.push({
    doc: "tone-guide.md",
    snippet: "Acknowledge the issue, apologize once, and state the next step.",
  });
  return { citations };
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

  // Step 4 — Decide (confidence-gated, §4.2)
  await delay(350);
  let confidence = 0.9;
  if (c.severity === "MED") confidence -= 0.2;
  if (c.severity === "HIGH") confidence -= 0.45;
  if (u.churnRisk) confidence -= 0.1;
  confidence = Math.max(0.1, Math.min(0.99, confidence));
  const willAutoResolve = confidence >= CONFIDENCE_THRESHOLD;
  const d: DecideStep = {
    action: willAutoResolve ? "AUTO_RESOLVE" : "ESCALATE",
    confidence,
    reason: willAutoResolve
      ? "High confidence and low severity — routine case, safe to auto-resolve."
      : `Severity ${c.severity}${u.churnRisk ? " + churn risk" : ""} lowers confidence below the ${CONFIDENCE_THRESHOLD} threshold.`,
  };
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
