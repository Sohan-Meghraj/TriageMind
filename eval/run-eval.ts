// Evaluation harness (§4.7). Runs every labeled complaint through the triage
// engine and reports classification accuracy, escalation-decision accuracy,
// and guardrail violations. The headline number goes in the README + video.
//
//   npm run eval
//
// Skeleton version: scores against the ~2 placeholder cases in testset.json
// using the stubbed agent. Expand testset.json to ~25 cases later.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runTriage } from "../src/lib/agent";
import type { Action, Reasoning, Severity } from "../src/lib/types";

type TestCase = {
  id: string;
  text: string;
  customerEmail?: string;
  hasPhoto?: boolean;
  expected: { severity: Severity; action: Action };
  note?: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const testset: TestCase[] = JSON.parse(
  readFileSync(join(here, "testset.json"), "utf8"),
);

async function triage(tc: TestCase): Promise<Reasoning> {
  const reasoning: Partial<Reasoning> = {};
  for await (const ev of runTriage({
    id: tc.id,
    text: tc.text,
    customerEmail: tc.customerEmail,
    hasPhoto: tc.hasPhoto,
  })) {
    if (ev.type === "step") {
      // @ts-expect-error — step name keys Reasoning; data matches by construction.
      reasoning[ev.step] = ev.data;
    }
  }
  return reasoning as Reasoning;
}

type CaseResult = {
  id: string;
  expectedSeverity: Severity;
  actualSeverity: Severity;
  sevOk: boolean;
  expectedAction: Action;
  actualAction: Action;
  actOk: boolean;
  confidence: number;
  passed: boolean;
};

async function main() {
  let sevCorrect = 0;
  let actCorrect = 0;
  let guardrailViolations = 0;
  const rows: string[] = [];
  const cases: CaseResult[] = [];

  for (const tc of testset) {
    const r = await triage(tc);
    const sevOk = r.classify.severity === tc.expected.severity;
    const actOk = r.decide.action === tc.expected.action;
    if (sevOk) sevCorrect++;
    if (actOk) actCorrect++;
    if (!r.selfCheck.passed) guardrailViolations++;
    cases.push({
      id: tc.id,
      expectedSeverity: tc.expected.severity,
      actualSeverity: r.classify.severity,
      sevOk,
      expectedAction: tc.expected.action,
      actualAction: r.decide.action,
      actOk,
      confidence: r.decide.confidence,
      passed: r.selfCheck.passed,
    });
    rows.push(
      `${tc.id}\t${r.classify.severity}${sevOk ? "✓" : "✗"}\t${r.decide.action}${actOk ? "✓" : "✗"}\tconf=${r.decide.confidence.toFixed(2)}`,
    );
  }

  const n = testset.length;
  const pct = (x: number) => `${Math.round((x / n) * 100)}%`;
  const tally = <T extends string>(xs: T[]): Record<T, number> =>
    xs.reduce(
      (acc, x) => ((acc[x] = (acc[x] ?? 0) + 1), acc),
      {} as Record<T, number>,
    );

  console.log("\nTriageMind — Eval Results");
  console.log("=========================");
  console.log("id\tseverity\taction\tconfidence");
  rows.forEach((r) => console.log(r));
  console.log("-------------------------");
  console.log(`Classification accuracy: ${pct(sevCorrect)} (${sevCorrect}/${n})`);
  console.log(`Escalation accuracy:     ${pct(actCorrect)} (${actCorrect}/${n})`);
  console.log(`Guardrail violations:    ${guardrailViolations} (target: 0)`);
  console.log("");

  // Structured results for the dashboard to render.
  const results = {
    generatedAt: new Date().toISOString(),
    total: n,
    classificationAccuracyPct: Math.round((sevCorrect / n) * 100),
    escalationAccuracyPct: Math.round((actCorrect / n) * 100),
    guardrailViolations,
    avgConfidence: Number(
      (cases.reduce((s, c) => s + c.confidence, 0) / n).toFixed(2),
    ),
    routeDistribution: tally(cases.map((c) => c.actualAction)),
    severityDistribution: tally(cases.map((c) => c.actualSeverity)),
    cases,
  };
  writeFileSync(
    join(here, "results.json"),
    JSON.stringify(results, null, 2) + "\n",
    "utf8",
  );
  console.log("Wrote eval/results.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
