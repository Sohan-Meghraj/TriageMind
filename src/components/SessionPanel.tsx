"use client";

import { useEffect, useState } from "react";
import type { Action, Severity } from "@/lib/types";
import { RouteBadge } from "./RouteBadge";

export type SessionRecord = {
  action: Action;
  severity: Severity;
  confidence: number;
  at: number;
};

const KEY = "triagemind:sessions";

/** Append a triage outcome to this browser session's history (called by the demo). */
export function recordSession(rec: SessionRecord) {
  if (typeof window === "undefined") return;
  try {
    const prev = JSON.parse(localStorage.getItem(KEY) || "[]") as SessionRecord[];
    prev.push(rec);
    localStorage.setItem(KEY, JSON.stringify(prev));
    window.dispatchEvent(new Event("triagemind:session"));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

const ROUTES: Action[] = ["AUTO_RESOLVE", "REQUEST_EVIDENCE", "ESCALATE"];

/** Live "this session" analytics — populated as you run triages in the demo. */
export function SessionPanel() {
  const [recs, setRecs] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        setRecs(JSON.parse(localStorage.getItem(KEY) || "[]"));
      } catch {
        setRecs([]);
      }
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener("triagemind:session", load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("triagemind:session", load);
    };
  }, []);

  const n = recs.length;
  const avgConf = n ? recs.reduce((s, r) => s + r.confidence, 0) / n : 0;
  const counts = ROUTES.map((a) => ({
    action: a,
    count: recs.filter((r) => r.action === a).length,
  }));

  function clear() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("triagemind:session"));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">This session</h3>
        {n > 0 && (
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {n === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No triages yet. Run one in the{" "}
          <a href="/demo" className="text-primary underline-offset-4 hover:underline">
            live demo
          </a>{" "}
          and it shows up here.
        </p>
      ) : (
        <>
          <div className="mt-4 flex gap-6">
            <div>
              <div className="text-2xl font-bold tracking-tight">{n}</div>
              <div className="text-xs text-muted-foreground">triaged</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">
                {Math.round(avgConf * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">avg confidence</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {counts.map(({ action, count }) => (
              <div key={action} className="flex items-center justify-between text-sm">
                <RouteBadge action={action} />
                <span className="font-mono text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
