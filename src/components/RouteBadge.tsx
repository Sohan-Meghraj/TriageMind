// The routing decision, shown explicitly (§4.2).

import type { Action } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function RouteBadge({ action }: { action: Action }) {
  const isAuto = action === "AUTO_RESOLVE";
  return (
    <Badge
      className={
        isAuto
          ? "bg-emerald-600 hover:bg-emerald-600"
          : "bg-amber-600 hover:bg-amber-600"
      }
    >
      {isAuto ? "✓ Auto-resolve" : "↗ Escalate"}
    </Badge>
  );
}
