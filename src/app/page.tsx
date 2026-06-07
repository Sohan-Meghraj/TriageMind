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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { HeroPreview } from "@/components/HeroPreview";

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
    desc: "Scores its own confidence, then chooses to auto-resolve or escalate.",
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
    desc: "Every decision carries a confidence score. It only auto-resolves when confidence ≥ 0.75 and its self-check passes — otherwise it escalates with a full briefing.",
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

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        {/* subtle backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--muted)_0%,transparent_70%)]"
        />
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pt-16 pb-20 lg:grid-cols-2 lg:pt-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Microsoft Agents League · Reasoning Agents track
            </span>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Support AI that reasons in the open.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0">
              Most support bots either lie confidently or punt everything to a
              human. TriageMind does neither — it handles the routine safely,
              escalates the hard cases with a full briefing, and is honest about
              what it doesn&apos;t know.
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

      {/* Why it's different */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto w-full max-w-5xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              An agent that earns trust
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four things make TriageMind different from a chatbot with a
              friendly tone.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
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
