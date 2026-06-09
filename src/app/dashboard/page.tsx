import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import type { Action, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RouteBadge } from "@/components/RouteBadge";
import { SessionPanel } from "@/components/SessionPanel";

export const metadata = {
  title: "Dashboard — TriageMind",
  description: "Evaluation results and live session analytics.",
};

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

type Results = {
  generatedAt: string;
  total: number;
  classificationAccuracyPct: number;
  escalationAccuracyPct: number;
  guardrailViolations: number;
  avgConfidence: number;
  routeDistribution: Partial<Record<Action, number>>;
  severityDistribution: Partial<Record<Severity, number>>;
  cases: CaseResult[];
};

const ROUTE_BAR: Record<Action, string> = {
  AUTO_RESOLVE: "bg-emerald-500",
  REQUEST_EVIDENCE: "bg-sky-500",
  ESCALATE: "bg-amber-500",
};
const SEVERITY_BAR: Record<Severity, string> = {
  LOW: "bg-emerald-500",
  MED: "bg-amber-500",
  HIGH: "bg-red-500",
};

function loadResults(): Results {
  const raw = readFileSync(join(process.cwd(), "eval", "results.json"), "utf8");
  return JSON.parse(raw) as Results;
}

export default function Dashboard() {
  const r = loadResults();
  const routeOrder: Action[] = ["AUTO_RESOLVE", "REQUEST_EVIDENCE", "ESCALATE"];
  const sevOrder: Severity[] = ["LOW", "MED", "HIGH"];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <header className="mb-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          Evaluation
        </span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Performance dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Measured proof from the eval harness over {r.total} labeled cases — plus
          live analytics from your current session.{" "}
          <span className="text-xs">
            (generated {r.generatedAt.slice(0, 10)})
          </span>
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Classification accuracy"
          value={`${r.classificationAccuracyPct}%`}
          bar={r.classificationAccuracyPct}
        />
        <StatCard
          label="Escalation accuracy"
          value={`${r.escalationAccuracyPct}%`}
          bar={r.escalationAccuracyPct}
        />
        <StatCard
          label="Guardrail violations"
          value={`${r.guardrailViolations}`}
          tone={r.guardrailViolations === 0 ? "good" : "bad"}
          hint="target: 0"
        />
        <StatCard
          label="Avg confidence"
          value={`${Math.round(r.avgConfidence * 100)}%`}
          bar={Math.round(r.avgConfidence * 100)}
        />
      </section>

      {/* Distributions + live session */}
      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Route distribution</h3>
          <Segmented
            total={r.total}
            parts={routeOrder.map((a) => ({
              n: r.routeDistribution[a] ?? 0,
              color: ROUTE_BAR[a],
            }))}
          />
          <div className="mt-3 space-y-1.5">
            {routeOrder.map((a) => (
              <div key={a} className="flex items-center justify-between text-sm">
                <RouteBadge action={a} />
                <span className="font-mono text-muted-foreground">
                  {r.routeDistribution[a] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Severity distribution</h3>
          <Segmented
            total={r.total}
            parts={sevOrder.map((s) => ({
              n: r.severityDistribution[s] ?? 0,
              color: SEVERITY_BAR[s],
            }))}
          />
          <div className="mt-3 space-y-1.5">
            {sevOrder.map((s) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", SEVERITY_BAR[s])} />
                  {s}
                </span>
                <span className="font-mono text-muted-foreground">
                  {r.severityDistribution[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <SessionPanel />
      </section>

      {/* Per-case table */}
      <section className="mt-6 rounded-xl border border-border bg-card">
        <h3 className="border-b border-border px-6 py-4 font-semibold">
          Per-case results
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-6 py-2 font-medium">Case</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Route</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
                <th className="px-6 py-2 text-right font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {r.cases.map((c) => {
                const ok = c.sevOk && c.actOk;
                return (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-2 font-mono text-xs">{c.id}</td>
                    <td className="px-3 py-2">
                      <Mark ok={c.sevOk}>{c.actualSeverity}</Mark>
                    </td>
                    <td className="px-3 py-2">
                      <Mark ok={c.actOk}>
                        <RouteBadge action={c.actualAction} />
                      </Mark>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {Math.round(c.confidence * 100)}%
                    </td>
                    <td className="px-6 py-2 text-right">
                      {ok ? (
                        <Check className="ml-auto size-4 text-emerald-600" />
                      ) : (
                        <X className="ml-auto size-4 text-amber-600" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-xs text-muted-foreground">
        Numbers reflect the current stub baseline. Run{" "}
        <code className="font-mono">npm run eval</code> to regenerate after the
        Foundry agent is wired in.
      </p>
    </main>
  );
}

function StatCard({
  label,
  value,
  bar,
  tone,
  hint,
}: {
  label: string;
  value: string;
  bar?: number;
  tone?: "good" | "bad";
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-3xl font-bold tracking-tight",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-red-600",
        )}
      >
        {value}
      </div>
      {typeof bar === "number" && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Segmented({
  total,
  parts,
}: {
  total: number;
  parts: { n: number; color: string }[];
}) {
  return (
    <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
      {parts.map((p, i) => (
        <div
          key={i}
          className={p.color}
          style={{ width: `${total ? (p.n / total) * 100 : 0}%` }}
        />
      ))}
    </div>
  );
}

function Mark({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        !ok && "text-amber-700",
      )}
      title={ok ? "matches expected" : "differs from expected label"}
    >
      {children}
      {!ok && <span className="text-xs">≠</span>}
    </span>
  );
}
