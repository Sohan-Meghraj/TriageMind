# TriageMind

> A support agent that takes real actions, shows its reasoning, refuses to break policy, and comes with measured proof that it works.

Built for the **Microsoft Agents League @ AI Skills Fest** — Reasoning Agents track (Azure AI Foundry).

Most "AI support bots" either lie confidently or punt everything to a human. TriageMind does neither: it **handles the routine safely, escalates the hard cases with a full briefing, and is honest about what it doesn't know**.

## How it works — 6 visible reasoning steps

Every complaint runs through six steps, each streamed live to a glass-box UI:

1. **Understand** — extract issues, intent, churn risk
2. **Classify** — severity, category, sentiment
3. **Ground** — pull KB passages + citations (Azure File Search)
4. **Decide** — auto-resolve vs escalate, with a confidence score
5. **Draft** — a grounded, cited reply *or* a human briefing
6. **Self-check** — validate against policy; self-correct or escalate

Auto-resolve happens only when **confidence ≥ 0.75 and self-check passes**; otherwise the case escalates with a briefing.

## Tech stack

- **Agent core:** Azure AI Foundry Agent Service (File Search + function tools)
- **Model:** `gpt-4o-mini` (dev) → `gpt-4o` (demo)
- **App:** Next.js (App Router) + React + Tailwind + shadcn/ui
- **Streaming:** SSE from a Next.js route → animated UI
- **Eval:** Node + TypeScript harness over a labeled test set

## Status

🚧 **Skeleton** — the full pipeline runs end-to-end on a **stubbed** agent (no Azure calls yet). The Azure AI Foundry agent, real KB content, full guardrails, and the ~25-case eval set are being wired in next. See [docs/PRD.md](docs/PRD.md) for the full plan.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Azure values (later)
npm run dev                  # http://localhost:3000
npm run eval                 # prints the accuracy report
```

## License

[MIT](LICENSE) © 2026 Sohan Meghraj
