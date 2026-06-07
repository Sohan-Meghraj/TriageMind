// A static, presentational taste of the glass-box UI for the landing hero.
// Reuses the real ConfidenceMeter and RouteBadge so the preview matches the
// actual product.

import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { RouteBadge } from "@/components/RouteBadge";

export function HeroPreview() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/5">
      {/* fake window chrome */}
      <div className="flex items-center gap-1.5 pb-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="ml-2 text-xs text-muted-foreground">triagemind / live</span>
      </div>

      {/* the complaint */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <span className="text-xs font-medium text-muted-foreground">Customer</span>
        <p className="mt-1">
          “My order arrived dented and I&apos;d like a refund — order #4821.”
        </p>
      </div>

      {/* mini reasoning trail */}
      <div className="mt-3 space-y-2.5">
        <PreviewStep n={1} label="Understand">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">damaged item</Badge>
            <Badge variant="secondary">refund request</Badge>
          </div>
        </PreviewStep>

        <PreviewStep n={4} label="Decide">
          <div className="space-y-2">
            <RouteBadge action="AUTO_RESOLVE" />
            <ConfidenceMeter confidence={0.91} />
          </div>
        </PreviewStep>

        <PreviewStep n={6} label="Self-check">
          <Badge className="bg-emerald-600 hover:bg-emerald-600">✓ Passed</Badge>
        </PreviewStep>
      </div>
    </div>
  );
}

function PreviewStep({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.7rem] text-primary-foreground">
          {n}
        </span>
        {label}
      </div>
      {children}
    </div>
  );
}
