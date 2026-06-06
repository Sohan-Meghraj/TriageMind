// Shared contract for TriageMind. Everything (agent, tools, API, UI, eval)
// imports from here so the 6-step reasoning shape stays consistent.

/** Auto-resolve only when confidence is at/above this AND self-check passes (§4.2). */
export const CONFIDENCE_THRESHOLD = 0.75;

export type Severity = "LOW" | "MED" | "HIGH";
export type Action = "AUTO_RESOLVE" | "ESCALATE";

/** The 6 reasoning steps, in order (§4.1). */
export type StepName =
  | "understand"
  | "classify"
  | "ground"
  | "decide"
  | "draft"
  | "selfCheck";

export type Complaint = {
  id: string;
  text: string;
  customerEmail?: string;
};

export type Citation = { doc: string; snippet: string };

// --- Per-step output shapes (mirror PRD §6 data model) ---
export type UnderstandStep = {
  issues: string[];
  intent: string;
  churnRisk: boolean;
};
export type ClassifyStep = {
  severity: Severity;
  category: string[];
  sentiment: string;
};
export type GroundStep = { citations: Citation[] };
export type DecideStep = {
  action: Action;
  confidence: number; // 0..1
  reason: string;
};
export type DraftStep = { reply?: string; briefing?: string };
export type SelfCheckStep = {
  passed: boolean;
  issues: string[];
  retries: number;
};

export type Reasoning = {
  understand: UnderstandStep;
  classify: ClassifyStep;
  ground: GroundStep;
  decide: DecideStep;
  draft: DraftStep;
  selfCheck: SelfCheckStep;
};

export type Result = { complaint: Complaint; reasoning: Reasoning };

/**
 * Events streamed to the browser over SSE — one `step` event per reasoning
 * step as it completes, then a final `done` (or `error`). Drives the
 * animated glass-box UI.
 */
export type StepEvent =
  | { type: "step"; step: "understand"; data: UnderstandStep }
  | { type: "step"; step: "classify"; data: ClassifyStep }
  | { type: "step"; step: "ground"; data: GroundStep }
  | { type: "step"; step: "decide"; data: DecideStep }
  | { type: "step"; step: "draft"; data: DraftStep }
  | { type: "step"; step: "selfCheck"; data: SelfCheckStep }
  | { type: "done"; result: Result }
  | { type: "error"; message: string };

// --- Tool I/O types (§4.4) ---
export type Order = {
  orderId: string;
  customerEmail: string;
  status: string;
  amount: number;
  currency: string;
  placedAt: string;
  billingHistory: { date: string; description: string; amount: number }[];
};

export type RefundEligibility = {
  eligible: boolean;
  maxAmount: number;
  policyRef: string;
  reason: string;
};

export type Ticket = {
  ticketId: string;
  summary: string;
  severity: Severity;
  category: string;
};
