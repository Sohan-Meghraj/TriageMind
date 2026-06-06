# TriageMind — Product Requirements Document (PRD)

> **One-line pitch:** TriageMind is a support agent that takes real actions, shows its reasoning, refuses to break policy, and comes with measured proof that it works.

- **Contest:** Microsoft Agents League @ AI Skills Fest
- **Track:** Reasoning Agents (built on Azure AI Foundry)
- **Author:** Sohan (solo)
- **Status:** Planning → Build
- **Key dates:** Registration closes **June 12, 2026** · Submit before **June 14, 2026, 11:59 PM PT**
- **Today:** June 6, 2026 (≈8 days)

---

## 1. Problem & Vision

### Problem
Support teams drown in repetitive complaints. Existing "AI support bots" fail in two ways:
1. **Overconfident** — they hallucinate wrong answers and promise things off-policy.
2. **Useless-cautious** — they punt everything to humans and save no time.

Both erode trust. Neither *reasons*, and neither *knows its own limits*.

### Vision
An agent that **handles the routine safely, escalates the hard cases with a full briefing, and is honest about what it doesn't know** — so humans start from a summary, not a blank page.

### Why this wins
It is designed around the judging rubric (see §3). The differentiators target the three most *ignored* scoring angles: real agency (tool-calling), proof (an evaluation harness), and safety (hard guardrails).

---

## 2. Goals & Non-Goals

### Goals (in scope)
- A working agent that processes a complaint through **6 visible reasoning steps**.
- **Confidence-gated escalation**: auto-resolve when confident, escalate when not.
- **Self-verification** (and self-correction loop) before acting.
- **Knowledge-base grounding** with **citations**.
- **Real tool-calling** (the agent takes actions, not just text).
- **Hard safety guardrails** (cannot promise off-policy).
- **An evaluation harness** with measured accuracy on a test set.
- A clean **glass-box UI** showing the reasoning unfold.
- Demo video, architecture diagram, polished README, public repo.

### Non-Goals (explicitly OUT — protect your time)
- ❌ User accounts / auth / multi-tenant
- ❌ A database of real tickets (use in-memory / mock data)
- ❌ Email/SMS sending, real payment/refund processing
- ❌ Mobile app, dark/light theming, i18n
- ❌ Reusing NexTicket code (this must be a NEW project)
- ❌ Anything not visible in the 5-minute demo

---

## 3. Success Metrics (mapped to the rubric)

| Judging criteria | Weight | How TriageMind targets it | Proof in submission |
|---|---|---|---|
| Accuracy & Relevance | 20% | RAG grounding + citations | Eval harness score |
| Reasoning & Multi-step | 20% | 6 visible reasoning steps | Live demo + UI |
| Reliability & Safety | 20% | Self-check + guardrails + confidence gate | Guardrail test cases |
| Creativity & Originality | 15% | "Honest AI that knows its limits" framing | README + video narrative |
| UX & Presentation | 15% | Animated glass-box UI + scripted video | The demo itself |
| Community (Discord) | 10% | Active in Discord + shareable clip | Engagement |

**North-star metric:** *"X% correct triage decisions on a 25-case test set"* — the single number that beats every competitor's unproven claims.

---

## 4. The Product — Feature Specs

### 4.1 The 6 Reasoning Steps (the core engine)

For each incoming complaint, the agent runs these steps **in order**, emitting each to the UI as it completes:

| # | Step | Input | Output |
|---|---|---|---|
| 1 | **Understand** | Raw complaint text | Extracted issues (list), customer intent, churn-risk flag |
| 2 | **Classify** | Issues | `severity` (LOW/MED/HIGH), `category[]`, `sentiment` |
| 3 | **Ground** | Issues + classification | Relevant KB passages + citations (via File Search tool) |
| 4 | **Decide** | All above | `action` = AUTO_RESOLVE \| ESCALATE, with `confidence` (0–1) + reason |
| 5 | **Draft** | Decision + KB | Customer reply (grounded, cited) OR human-briefing |
| 6 | **Self-check** | Draft | Pass/fail + issues found; if fail → self-correct loop (max 2 retries) → else escalate |

### 4.2 Confidence-gated escalation (X-factor)
- Agent outputs a `confidence` score at the Decide step.
- If `confidence >= THRESHOLD` (e.g. 0.75) **and** self-check passes → **AUTO_RESOLVE** (show drafted reply).
- Else → **ESCALATE** with a human briefing (issues + severity + KB refs + suggested action + *why escalated*).
- The UI shows the confidence meter and the routing decision explicitly.

### 4.3 Self-verification & self-correction loop (X-factor)
- After drafting, the agent critiques its own output against a checklist:
  - Did it address every extracted issue?
  - Did it promise anything outside policy? (guardrail)
  - Is every claim backed by a citation?
- If the check **fails**, the agent revises the draft and re-checks (max 2 loops). If still failing → escalate. Show the catch-and-fix in the UI.

### 4.4 Real tool-calling (X-factor)
The agent is given function tools it can call during reasoning:

| Tool | Signature | Returns (mock data) |
|---|---|---|
| `lookupOrder` | `(orderId or email)` | order status, billing history |
| `checkRefundEligibility` | `(orderId, reason)` | eligible: bool, max amount, policy ref |
| `createTicket` | `(summary, severity, category)` | ticket id |
| `searchKnowledgeBase` | `(query)` | (handled by File Search tool) |

Tools return **mock/in-memory data** — no real systems. The point is demonstrating *agentic action*, not real integrations.

### 4.5 Knowledge base + citations (X-factor)
- A small set of policy docs (markdown/PDF): Refund Policy, Billing FAQ, Known Issues, Escalation Policy, Tone Guide.
- Loaded into **Azure AI Foundry File Search** (built-in vector store — no custom DB needed).
- Every factual claim in the reply links to its source doc → shown as citations in the UI.

### 4.6 Hard safety guardrails (X-factor)
- System instructions + a post-draft validator enforce rules the agent **cannot** break:
  - Never promise a refund amount above `checkRefundEligibility` max.
  - Never invent compensation, dates, or policies not in the KB.
  - Never make legal/medical claims.
- If a draft violates a rule, the self-correction loop catches it; if unfixable → escalate.
- Keep a short list of "guardrail test cases" to demo in the video.

### 4.7 Evaluation harness (X-factor — the secret weapon)
- A `eval/` folder with `testset.json`: ~25 complaints, each with expected `severity`, `action`, and a note.
- A script (`npm run eval`) runs all cases through the agent and reports:
  - Classification accuracy (%)
  - Escalation-decision accuracy (%)
  - Guardrail violations (should be 0)
- Output a results table → paste the headline number into the README and video.

---

## 5. Tech Stack & Tools

> Chosen to **reuse your existing strengths** (Next.js / React / Tailwind / shadcn from NexTicket) while making the **agent core 100% Microsoft (Azure AI Foundry)** for track qualification.

| Layer | Choice | Why |
|---|---|---|
| **Agent runtime** | **Azure AI Foundry — Agent Service** | Required Microsoft tech; native tools, threads, runs |
| **Model** | `gpt-4o-mini` (dev) → `gpt-4o` (final demo) | mini = cheap/fast for iteration; 4o = best reasoning for the video |
| **Grounding/RAG** | Azure AI Foundry **File Search** tool | Built-in vector store — zero custom DB work |
| **Tool-calling** | Azure AI Foundry **Function tools** | The agentic-action X-factor |
| **SDK** | `@azure/ai-projects` + `@azure/ai-agents` (TypeScript) | Stay in your JS/TS comfort zone |
| **Auth to Azure** | `DefaultAzureCredential` (Entra) or API key in env | Keyless preferred; key is fine for a hackathon |
| **Frontend** | **Next.js 15 (App Router)** + React 19 | Your wheelhouse |
| **UI** | Tailwind + shadcn/ui | Reuse your taste; fast clean UI |
| **State/stream** | Server route streams step events to client (SSE / chunked) | Drives the animated glass-box UI |
| **Eval** | Node + TypeScript script + `testset.json` | Simple, measurable |
| **Hosting** | **Azure Static Web Apps** or **Azure App Service** (primary) · Vercel (fallback) | More Azure usage = stronger track fit |
| **Repo** | New PUBLIC GitHub repo, all June commits | Clean contest-period history |
| **Diagram** | Mermaid (in README) + exported PNG | Required submission artifact |

### Accounts/keys you need
1. **Hackathon registration** (the contest site) — before June 12.
2. **Azure free account** (~$200 credits, card for verification only).
3. **Azure AI Foundry project** + a deployed model (gpt-4o-mini).
4. **GitHub account** + new public repo.
5. (Optional) **Azure Static Web Apps / App Service** for deploy.

---

## 6. Architecture

```
                        ┌──────────────────────────────────────┐
                        │            Browser (Next.js)          │
                        │   Glass-box UI: steps stream in,      │
                        │   confidence meter, citations, route  │
                        └───────────────┬──────────────────────┘
                                        │  POST /api/triage  (SSE stream back)
                                        ▼
                        ┌──────────────────────────────────────┐
                        │   Next.js API route (server)          │
                        │   - creates a thread + run            │
                        │   - streams step events to client     │
                        │   - runs guardrail validator          │
                        └───────────────┬──────────────────────┘
                                        │  @azure/ai-agents SDK
                                        ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                Azure AI Foundry — Agent Service                 │
        │                                                                 │
        │   Model: gpt-4o(-mini)                                          │
        │   Instructions: the 6-step reasoning + guardrails               │
        │                                                                 │
        │   ┌─────────────┐   ┌──────────────────┐   ┌────────────────┐  │
        │   │ File Search │   │  Function tools  │   │  Self-check /   │  │
        │   │ (KB + cite) │   │ lookupOrder...   │   │  correction     │  │
        │   └─────────────┘   └──────────────────┘   └────────────────┘  │
        └───────────────────────────────────────────────────────────────┘
                                        │
                            confidence >= threshold &&
                              self-check passed ?
                        ┌───────────────┴───────────────┐
                        ▼ yes                            ▼ no
                 AUTO_RESOLVE                       ESCALATE
              (grounded, cited reply)        (human briefing + reason)
```

### Data model (in-memory / JSON — no DB)
```ts
type Complaint   = { id: string; text: string; customerEmail?: string }
type Reasoning   = {
  understand: { issues: string[]; intent: string; churnRisk: boolean }
  classify:   { severity: 'LOW'|'MED'|'HIGH'; category: string[]; sentiment: string }
  ground:     { citations: { doc: string; snippet: string }[] }
  decide:     { action: 'AUTO_RESOLVE'|'ESCALATE'; confidence: number; reason: string }
  draft:      { reply?: string; briefing?: string }
  selfCheck:  { passed: boolean; issues: string[]; retries: number }
}
type Result      = { complaint: Complaint; reasoning: Reasoning }
```

---

## 7. Repository Structure

```
triagemind/
├── README.md                 # landing-page-quality, screenshot at top
├── LICENSE                   # MIT
├── docs/
│   ├── architecture.png      # exported diagram
│   └── PRD.md                # this file
├── knowledge-base/           # policy docs fed to File Search
│   ├── refund-policy.md
│   ├── billing-faq.md
│   ├── known-issues.md
│   ├── escalation-policy.md
│   └── tone-guide.md
├── src/
│   ├── app/
│   │   ├── page.tsx          # the glass-box UI
│   │   └── api/triage/route.ts  # creates run, streams steps
│   ├── lib/
│   │   ├── agent.ts          # Azure AI Foundry client + agent setup
│   │   ├── tools.ts          # lookupOrder, checkRefundEligibility, createTicket
│   │   ├── guardrails.ts     # post-draft validator
│   │   └── mockData.ts       # fake orders/customers
│   └── components/
│       ├── ReasoningTrail.tsx
│       ├── ConfidenceMeter.tsx
│       └── RouteBadge.tsx
├── eval/
│   ├── testset.json          # ~25 labeled complaints
│   └── run-eval.ts           # npm run eval -> accuracy report
├── .env.example
└── package.json
```

---

## 8. Build Plan — Day by Day (a few hrs/day)

| Day | Date | Tasks | Done = |
|---|---|---|---|
| **1** | Jun 6–7 | Register for hackathon. Create Azure free account + AI Foundry project, deploy `gpt-4o-mini`. Create new public GitHub repo + push skeleton. | Agent says "hello" from a script |
| **2** | Jun 8 | Build agent instructions for the 6 steps. Get a complaint → structured reasoning JSON back. | Steps 1–5 produce JSON |
| **3** | Jun 9 | Add File Search (upload KB docs) + citations. Add function tools (mock data). | Agent grounds + calls a tool |
| **4** | Jun 10 | Add Decide/confidence + self-check + self-correction loop + guardrails validator. | Auto-resolve vs escalate works |
| **5** | Jun 11 | Build the Next.js glass-box UI: streaming steps, confidence meter, citations, route badge. | End-to-end demo in browser |
| **6** | Jun 12 | ⚠️ **Confirm registration done.** Build eval harness + run it → record the number. Deploy to Azure. | `npm run eval` prints accuracy; app is live |
| **7** | Jun 13 | Write README (screenshot/GIF) + LICENSE + architecture.png. Record demo video (≤5 min). | Video uploaded to YouTube/Vimeo |
| **8** | Jun 14 | Final polish, final commit, push public, **submit before 11:59 PM PT.** Post clip in Discord. | Submitted ✅ |

**Buffer rule:** if a day slips, cut Tier-3 polish (§ TriageMind features), never the spine or the eval harness.

---

## 9. Day-1 Setup Guide (exact steps)

1. **Register:** go to the hackathon registration page, sign up, activate via email, select the **Reasoning Agents** challenge.
2. **Azure account:** azure.microsoft.com → *Start free* → sign in / create Microsoft account → verify with card (not charged) → get ~$200 credits.
3. **Azure AI Foundry:** ai.azure.com → create a **Project** (creates a hub + resources) → **Deployments** → deploy model `gpt-4o-mini` → copy the **project endpoint/connection string** + key.
4. **Local project:**
   ```bash
   npx create-next-app@latest triagemind --typescript --tailwind --app
   cd triagemind
   npm i @azure/ai-projects @azure/ai-agents @azure/identity
   npx shadcn@latest init
   ```
5. **Env:** create `.env.local`:
   ```
   AZURE_AI_PROJECT_ENDPOINT=...
   AZURE_AI_MODEL_DEPLOYMENT=gpt-4o-mini
   # plus auth (key or DefaultAzureCredential)
   ```
6. **GitHub:** create a new **public** repo `triagemind`, `git init`, first commit, push.

---

## 10. Demo Video Script (≤5 min)

1. **0:00–0:30 — Hook:** "Support bots either lie confidently or are useless. TriageMind does neither." State the pitch.
2. **0:30–2:30 — Live demo:** paste a messy complaint → watch the 6 steps stream in → confidence meter → it calls a tool → drafts a cited reply → **show the self-check catching a mistake and fixing it.**
3. **2:30–3:30 — The escalation case:** paste a hard/ambiguous complaint → confidence drops → it **escalates with a briefing** ("honest about its limits").
4. **3:30–4:15 — Safety + proof:** show a guardrail blocking an off-policy promise; show the **eval harness number** ("94% correct on 25 cases").
5. **4:15–5:00 — Architecture + close:** 10s on the Azure AI Foundry architecture, restate pitch, thank you.

> The video is ~50% of the UX/Presentation score. Script it, do 2–3 takes, keep it tight.

---

## 11. Submission Checklist

- [ ] Registered for the contest (before Jun 12) — Reasoning Agents track
- [ ] Public GitHub repo, all commits dated in the contest window
- [ ] Working/deployed app (Azure)
- [ ] Demo video (≤5 min, YouTube/Vimeo, made by you)
- [ ] Architecture diagram (image)
- [ ] Project description
- [ ] README with screenshot + eval number + setup steps
- [ ] LICENSE (MIT)
- [ ] `npm run eval` produces a measured accuracy number
- [ ] Guardrail test cases documented
- [ ] Submitted before Jun 14, 11:59 PM PT
- [ ] Posted a clip in Discord + engaged for the 10% community vote

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Azure access/setup eats a day | Do it Day 1; gpt-4o-mini is cheap; keep credits for the final 4o demo |
| Scope creep | Build the recommended stack only (spine + tool-calling + eval + guardrails); cut Tier-3 first |
| Streaming UI is fiddly | Fallback: render steps after completion (still shows the trail) |
| Pre-existing-project doubt | New repo, all-June commits; optionally email hackathonsupport@microsoft.com to confirm |
| Run out of time for video | Reserve Day 7 entirely; a complete simple demo > an unfinished ambitious one |

---

## 13. Honesty & Eligibility Notes

- Eligibility: 22, working professional, not a Microsoft employee, not in a void region — OK (self-confirm).
- This is a **brand-new project** built during the contest window — clean and honest. Do **not** reuse NexTicket code or backdate commits.
- The **demo video must be entirely your own work** (filming, editing).
- AI-assisted coding (e.g. GitHub Copilot / Claude) is allowed; just disclose normally.

---

*End of PRD. Keep this open while building. Update the checklist as you go.*
