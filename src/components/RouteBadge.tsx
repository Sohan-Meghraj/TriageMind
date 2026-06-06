// The routing decision, shown explicitly (§4.2).

import type { Action } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const ROUTE_META: Record<Action, { className: string; label: string }> = {
  AUTO_RESOLVE: {
    className: "bg-emerald-600 hover:bg-emerald-600",
    label: "✓ Auto-resolve",
  },
  REQUEST_EVIDENCE: {
    className: "bg-sky-600 hover:bg-sky-600",
    label: "📷 Request evidence",
  },
  ESCALATE: {
    className: "bg-amber-600 hover:bg-amber-600",
    label: "↗ Escalate",
  },
};

export function RouteBadge({ action }: { action: Action }) {
  const { className, label } = ROUTE_META[action];
  return <Badge className={className}>{label}</Badge>;
}
