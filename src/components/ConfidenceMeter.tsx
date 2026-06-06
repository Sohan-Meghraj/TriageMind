// Shows the Decide-step confidence as a meter, colored by whether it clears
// the auto-resolve threshold (§4.2).

import { CONFIDENCE_THRESHOLD } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export function ConfidenceMeter({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const clears = confidence >= CONFIDENCE_THRESHOLD;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Confidence</span>
        <span className={clears ? "text-emerald-600" : "text-amber-600"}>
          {pct}%
        </span>
      </div>
      <Progress value={pct} />
      <p className="text-xs text-muted-foreground">
        Threshold {Math.round(CONFIDENCE_THRESHOLD * 100)}% —{" "}
        {clears ? "clears (auto-resolve eligible)" : "below (escalate)"}
      </p>
    </div>
  );
}
