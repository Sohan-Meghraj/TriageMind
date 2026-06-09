// The glass-box: renders the 6 reasoning steps as they stream in. Each step
// becomes a card the moment its data arrives (§4.1).

import { FileText } from "lucide-react";
import type { Reasoning } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { RouteBadge } from "./RouteBadge";
import { CopyButton } from "./CopyButton";

const STEP_META: { key: keyof Reasoning; n: number; label: string }[] = [
  { key: "understand", n: 1, label: "Understand" },
  { key: "classify", n: 2, label: "Classify" },
  { key: "ground", n: 3, label: "Ground" },
  { key: "decide", n: 4, label: "Decide" },
  { key: "draft", n: 5, label: "Draft" },
  { key: "selfCheck", n: 6, label: "Self-check" },
];

export function ReasoningTrail({
  reasoning,
}: {
  reasoning: Partial<Reasoning>;
}) {
  return (
    <div className="space-y-3">
      {STEP_META.map(({ key, n, label }) => {
        const data = reasoning[key];
        if (!data) return null;
        return (
          <Card key={key} className="animate-in fade-in slide-in-from-bottom-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {n}
                </span>
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <StepBody stepKey={key} reasoning={reasoning} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StepBody({
  stepKey,
  reasoning,
}: {
  stepKey: keyof Reasoning;
  reasoning: Partial<Reasoning>;
}) {
  switch (stepKey) {
    case "understand": {
      const s = reasoning.understand!;
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {s.issues.map((i) => (
              <Badge key={i} variant="secondary">
                {i}
              </Badge>
            ))}
          </div>
          <p className="text-muted-foreground">Intent: {s.intent}</p>
          {s.churnRisk && (
            <Badge className="bg-red-600 hover:bg-red-600">⚠ Churn risk</Badge>
          )}
        </div>
      );
    }
    case "classify": {
      const s = reasoning.classify!;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Severity: {s.severity}</Badge>
          {s.category.map((c) => (
            <Badge key={c} variant="secondary">
              {c}
            </Badge>
          ))}
          <span className="text-muted-foreground">{s.sentiment}</span>
        </div>
      );
    }
    case "ground": {
      const s = reasoning.ground!;
      return (
        <ul className="space-y-2">
          {s.citations.map((c, i) => (
            <li
              key={i}
              className="rounded-md border border-border bg-muted/40 p-2.5"
            >
              <span className="inline-flex items-center gap-1.5 rounded bg-background px-1.5 py-0.5 font-mono text-xs text-primary ring-1 ring-border">
                <FileText className="size-3" />
                {c.doc}
              </span>
              <p className="mt-1.5 text-muted-foreground">{c.snippet}</p>
            </li>
          ))}
        </ul>
      );
    }
    case "decide": {
      const s = reasoning.decide!;
      return (
        <div className="space-y-3">
          <RouteBadge action={s.action} />
          <ConfidenceMeter confidence={s.confidence} />
          <p className="text-muted-foreground">{s.reason}</p>
        </div>
      );
    }
    case "draft": {
      const s = reasoning.draft!;
      const content = s.reply ?? s.evidenceRequest ?? s.briefing ?? "";
      const kind = s.reply
        ? "Customer reply"
        : s.evidenceRequest
          ? "Evidence request"
          : "Human briefing";
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {kind}
            </span>
            <CopyButton text={content} />
          </div>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-sm">
            {content}
          </pre>
        </div>
      );
    }
    case "selfCheck": {
      const s = reasoning.selfCheck!;
      return (
        <div className="space-y-2">
          <Badge
            className={
              s.passed
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-amber-600 hover:bg-amber-600"
            }
          >
            {s.passed ? "✓ Passed" : "✗ Failed"}
          </Badge>
          {s.issues.length > 0 && (
            <ul className="list-disc pl-5 text-muted-foreground">
              {s.issues.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}
          {s.retries > 0 && (
            <p className="text-xs text-muted-foreground">
              Self-corrected after {s.retries} retr
              {s.retries === 1 ? "y" : "ies"}.
            </p>
          )}
        </div>
      );
    }
  }
}
