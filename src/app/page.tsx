import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Tags,
  BookOpen,
  GitBranch,
  PenLine,
  ShieldCheck,
  Gauge,
  Wrench,
  BarChart3,
  CheckCircle2,
  Camera,
  ArrowUpRight,
  Cpu,
  FileSearch,
  Eye,
  RotateCcw,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { HeroPreview } from "@/components/HeroPreview";
import { RouteBadge } from "@/components/RouteBadge";

const STEPS = [
  {
    icon: Brain,
    name: "Understand",
    desc: "Pulls out the real issues, the customer's intent, and whether they're about to churn.",
  },
  {
    icon: Tags,
    name: "Classify",
    desc: "Tags severity, category, and sentiment so the right cases get the right attention.",
  },
  {
    icon: BookOpen,
    name: "Ground",
    desc: "Looks up your actual policy docs and cites the passages it relies on.",
  },
  {
    icon: GitBranch,
    name: "Decide",
    desc: "Scores its own confidence, then routes the case: resolve, request evidence, or escalate.",
  },
  {
    icon: PenLine,
    name: "Draft",
    desc: "Writes a grounded, cited reply — or a clean briefing for the human taking over.",
  },
  {
    icon: ShieldCheck,
    name: "Self-check",
    desc: "Reviews its own draft against policy and fixes mistakes before anything ships.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: Gauge,
    title: "Knows its limits",
    desc: "Every decision carries a confidence score. It only auto-resolves when confidence ≥ 0.75 and its self-check passes — otherwise it asks for evidence or escalates.",
  },
  {
    icon: RotateCcw,
    title: "Catches its own mistakes",
    desc: "After drafting, it critiques its own reply against a checklist. If it slips, it rewrites and re-checks — up to twice — before anything ships.",
  },
  {
    icon: Quote,
    title: "Cites its sources",
    desc: "Answers are grounded in your real policy docs, and every factual claim links back to the passage it came from. No invented policy.",
  },
  {
    icon: Wrench,
    title: "Takes real actions",
    desc: "It doesn't just chat. It calls tools — look up an order, check refund eligibility, open a ticket — so the routine work actually gets done.",
  },
  {
    icon: ShieldCheck,
    title: "Can't break policy",
    desc: "Hard guardrails stop it from promising off-policy refunds, inventing compensation, or making claims your knowledge base doesn't support.",
  },
  {
    icon: BarChart3,
    title: "Proves it works",
    desc: "An evaluation harness runs the agent over a labeled test set and reports measured accuracy — a real number, not a marketing claim.",
  },
];

const ROUTES = [
  {
    action: "AUTO_RESOLVE" as const,
    icon: CheckCircle2,
    tone: "emerald",
    title: "Resolve",
    desc: "Confident and on-policy. It sends a grounded, cited reply automatically — the routine work is done, no human needed.",
  },
  {
    action: "REQUEST_EVIDENCE" as const,
    icon: Camera,
    tone: "sky",
    title: "Verify",
    desc: "A photographable damage claim worth real money? It politely asks for a photo first — framed as “help us find the cause,” not “prove it.”",
  },
  {
    action: "ESCALATE" as const,
    icon: ArrowUpRight,
    tone: "amber",
    title: "Escalate",
    desc: "Unsure, high-severity, or a churn risk? It hands a human a full briefing — issues, severity, citations, and why — instead of a blank page.",
  },
];

const TONE_RING: Record<string, string> = {
  emerald: "border-emerald-500/30 ring-emerald-500/10",
  sky: "border-sky-500/30 ring-sky-500/10",
  amber: "border-amber-500/30 ring-amber-500/10",
};

const TONE_ICON: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600",
  sky: "bg-sky-500/10 text-sky-600",
  amber: "bg-amber-500/10 text-amber-600",
};

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border/60">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-2 lg:pt-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Built on Azure AI Foundry · Microsoft Agents League
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Support AI that reasons in the open.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              Most support bots either lie confidently or punt everything to a
              human. TriageMind does neither — it resolves the routine, asks for
              proof when money&apos;s at stake, escalates the hard cases with a
              full briefing, and is honest about what it doesn&apos;t know.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/demo"
                className={cn(buttonVariants({ size: "lg" }), "px-5")}
              >
                Try the live demo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "px-5"
                )}
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="lg:pl-4">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Today&apos;s support bots fail in two ways. TriageMind fixes both.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ProblemCard
              tone="bad"
              title="Overconfident bots"
              desc="Hallucinate wrong answers and promise things that break policy. They erode trust fast."
            />
            <ProblemCard
              tone="bad"
              title="Useless-cautious bots"
              desc="Forward every ticket to a human and save no one any time. Why bother?"
            />
            <ProblemCard
              tone="good"
              title="TriageMind"
              desc="Reasons step by step, knows when it's unsure, and hands humans a summary instead of a blank page."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Six reasoning steps you can watch
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every complaint runs through the same transparent pipeline, streamed
            live to a glass-box UI — so you always see <em>why</em>, not just
            the answer.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.name}
              className="group relative rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{step.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Three routes */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              One decision, three honest outcomes
            </h2>
            <p className="mt-3 text-muted-foreground">
              Most bots only know how to answer or escalate. TriageMind has a
              third gear — it can ask for proof when a claim is risky, instead
              of guessing.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {ROUTES.map((r) => (
              <div
                key={r.action}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-6 ring-1",
                  TONE_RING[r.tone]
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    TONE_ICON[r.tone]
                  )}
                >
                  <r.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {r.desc}
                </p>
                <div className="mt-4">
                  <RouteBadge action={r.action} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it's different */}
      <section className="border-t border-border/60">
        <div className="mx-auto w-full max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              The X-factors
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Six things a friendly chatbot can&apos;t do
            </h2>
            <p className="mt-3 text-muted-foreground">
              Each one targets a way ordinary support bots lose your trust.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <d.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech band */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="size-4" />
              Built on Azure AI Foundry
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Real agent infrastructure, not a wrapper
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <TechItem
              icon={FileSearch}
              title="File Search grounding"
              desc="Policy docs in a managed vector store — answers cite real passages."
            />
            <TechItem
              icon={Wrench}
              title="Function tools"
              desc="The agent calls live functions to look up orders and check eligibility."
            />
            <TechItem
              icon={Eye}
              title="Glass-box reasoning"
              desc="Every step streams to the UI as it happens — nothing hidden."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          See it think for itself.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Drop in a messy customer complaint and watch the six steps unfold in
          real time.
        </p>
        <Link
          href="/demo"
          className={cn(buttonVariants({ size: "lg" }), "mt-7 px-5")}
        >
          Try the live demo
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>TriageMind — honest AI that knows its limits.</span>
          <span>© 2026 Sohan Meghraj · MIT Licensed</span>
        </div>
      </footer>
    </main>
  );
}

function TechItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Cpu;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-center">
      <span className="mx-auto flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function ProblemCard({
  tone,
  title,
  desc,
}: {
  tone: "good" | "bad";
  title: string;
  desc: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6",
        tone === "good"
          ? "border-primary/30 ring-1 ring-primary/20"
          : "border-border"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full",
            tone === "good" ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
