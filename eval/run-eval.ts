// Evaluation harness (§4.7). Runs every labeled complaint through the triage
// engine and reports classification accuracy, escalation-decision accuracy,
// and guardrail violations. The headline number goes in the README + video.
//
//   npm run eval
//
// Skeleton version: scores against the ~2 placeholder cases in testset.json
// using the stubbed agent. Expand testset.json to ~25 cases later.

import { readFileSync } from "node:fs";
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

async function main() {
  let sevCorrect = 0;
  let actCorrect = 0;
  let guardrailViolations = 0;
  const rows: string[] = [];

  for (const tc of testset) {
    const r = await triage(tc);
    const sevOk = r.classify.severity === tc.expected.severity;
    const actOk = r.decide.action === tc.expected.action;
    if (sevOk) sevCorrect++;
    if (actOk) actCorrect++;
    if (!r.selfCheck.passed) guardrailViolations++;
    rows.push(
      `${tc.id}\t${r.classify.severity}${sevOk ? "✓" : "✗"}\t${r.decide.action}${actOk ? "✓" : "✗"}\tconf=${r.decide.confidence.toFixed(2)}`,
    );
  }

  const n = testset.length;
  const pct = (x: number) => `${Math.round((x / n) * 100)}%`;

  console.log("\nTriageMind — Eval Results");
  console.log("=========================");
  console.log("id\tseverity\taction\tconfidence");
  rows.forEach((r) => console.log(r));
  console.log("-------------------------");
  console.log(`Classification accuracy: ${pct(sevCorrect)} (${sevCorrect}/${n})`);
  console.log(`Escalation accuracy:     ${pct(actCorrect)} (${actCorrect}/${n})`);
  console.log(`Guardrail violations:    ${guardrailViolations} (target: 0)`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
