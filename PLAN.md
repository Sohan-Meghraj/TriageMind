# TriageMind — Build & Submission Plan

> Living checklist. Tick items as we go. Full spec lives in [docs/PRD.md](docs/PRD.md).

- **Contest:** Microsoft Agents League @ AI Skills Fest — **Reasoning Agents** track (Azure AI Foundry)
- **Account:** sohanmeghraj4444@gmail.com (Azure + contest)
- **Hard gates:** ✅ Registered · **Submit before Jun 14, 2026, 11:59 PM PT**
- **Owners:** 🧑 = Sohan (browser / interactive) · 🤖 = Claude (code)

---

## Status snapshot (as of Jun 8)

### ✅ Done
- [x] Register for the contest (Reasoning Agents track)
- [x] Skeleton pipeline: 6 steps, 3 routes (resolve / verify / escalate), guardrails validator, mock tools — **stubbed (heuristics, no Azure)**
- [x] Glass-box demo UI at `/demo` with live SSE streaming
- [x] Landing page at `/` (hero, problem, 6 steps, 3 routes, 6 X-factors, Azure tech band)
- [x] Azure client factory + smoke test written (`src/lib/azure.ts`, `scripts/smoke.ts`) — **untested**
- [x] Azure CLI 2.87.0 installed locally
- [x] 5 knowledge-base docs exist (content needs a polish pass)
- [x] Eval harness: **27 labeled cases**, stub baseline 70%/70%, **0 guardrail violations**
- [x] Input-side **prompt-injection guardrail** (regex layer) + 2 eval cases — tested

### ❌ Remaining (the spine)
- [ ] Azure subscription + Foundry project + deployed `gpt-4o-mini` + endpoint
- [ ] Real 6-step agent (replace the stub)
- [ ] File Search grounding + real citations
- [ ] Real function tool-calling (agent invokes tools during a run)
- [ ] Confidence gate + self-check/self-correction working on real output
- [ ] Guardrails hardened + scripted test cases
- [ ] ~25-case eval set + headline accuracy number
- [ ] Deploy to a public URL
- [ ] README (screenshot + number), architecture diagram, demo video
- [ ] Submit + Discord clip

**Critical path:** Azure setup → real agent → grounding/tools → eval number → video → submit.
**Blocker right now:** Azure Day 1 (below). Nothing "real" starts until `npm run smoke` is green.

---

## Day 1 — Jun 8 (TODAY): Unblock Azure
- [ ] 🧑 Create Azure **free subscription** (https://azure.microsoft.com/free — card for ID verification, not charged)
- [ ] 🧑 Create **AI Foundry project** (https://ai.azure.com → Create project; region with gpt-4o-mini, e.g. East US 2)
- [ ] 🧑 **Deploy `gpt-4o-mini`** (Models + endpoints → Deploy); note the deployment name
- [ ] 🧑 Copy the **project endpoint**; run `az login` → `az account show` lists the subscription
- [ ] 🤖 Put endpoint in `.env.local`; run `npm run smoke`; fix any auth/role errors
- [x] 🧑 ~~Register for the contest~~ ✅ done

**Done =** `npm run smoke` prints a hello from the real agent.

## Day 2 — Jun 9: Real 6-step agent
- [ ] 🤖 Replace `runTriage` stub with a real Azure AI Foundry agent that emits all 6 steps as structured JSON (keep the `StepEvent` contract so UI + eval are untouched)
- [ ] 🤖 Preserve the 3-route + confidence logic on real model output
- [ ] 🤖 Verify in `/demo` end-to-end

**Done =** a pasted complaint streams 6 real reasoning steps in the browser.

## Day 3 — Jun 10: Grounding + tools
- [ ] 🤖 KB-upload script → vector store → File Search tool; **Ground** step returns real citations
- [ ] 🤖 Register `lookupOrder` / `checkRefundEligibility` / `createTicket` as function tools; handle `requires_action`
- [ ] 🧑 Polish the 5 KB docs so citations read cleanly

**Done =** the agent grounds answers in real docs **and** calls a tool during a run.

## Day 4 — Jun 11: Reliability + safety
- [ ] 🤖 Confidence gate + self-check/self-correction loop working on real output
- [ ] 🤖 Harden guardrails validator (no off-policy promises; catch/fix or escalate)
- [ ] 🤖 + 🧑 Assemble 3–4 scripted guardrail test cases for the video

**Done =** resolve/verify/escalate behaves correctly on real runs; guardrail cases pass.

## Day 5 — Jun 12: Eval + deploy ⚠️
- [ ] ⚠️ 🧑 Confirm registration is fully complete (last safe day)
- [ ] 🤖 + 🧑 Expand `testset.json` 3 → ~25 labeled cases
- [ ] 🤖 Run `npm run eval` against the real agent → capture headline accuracy %
- [ ] 🤖 Deploy to Azure App Service (server app w/ SSE + secrets); Vercel as fallback

**Done =** `npm run eval` prints a measured % ; app live on a public URL.

## Day 6 — Jun 13: README, diagram, video
- [ ] 🤖 README: screenshot/GIF at top + eval number + setup steps; confirm LICENSE
- [ ] 🤖 Export architecture diagram → `docs/architecture.png`
- [ ] 🧑 Record demo video ≤5 min: hook → live triage + self-check catch → escalation → guardrail + eval number → architecture/close (2–3 takes)
- [ ] 🧑 Upload video (YouTube/Vimeo, unlisted ok)

**Done =** video uploaded; README submission-ready.

## Day 7 — Jun 14: Final + SUBMIT
- [ ] 🤖 Final commit; verify public repo + live URL + video link all work
- [ ] 🧑 **Submit before 11:59 PM PT**
- [ ] 🧑 Post a clip in Discord + engage (10% community score)

**Done =** Submitted ✅

---

## Submission checklist (mirror of PRD §11)
- [x] Registered (Reasoning Agents track)
- [ ] Public GitHub repo, all commits in contest window
- [ ] Deployed app (public URL)
- [ ] Demo video ≤5 min
- [ ] Architecture diagram image
- [ ] Project description
- [ ] README with screenshot + eval number + setup
- [x] LICENSE (MIT)
- [ ] `npm run eval` prints a measured accuracy number
- [ ] Guardrail test cases documented
- [ ] Submitted before Jun 14, 11:59 PM PT
- [ ] Discord clip posted + engaged

## Foundry-native enhancements (from contest research, Jun 8)
> Confirmed: Reasoning track **requires Microsoft Foundry** — GitHub Models would disqualify, so real Foundry access (Founders Hub, no card) is **mandatory**, not optional. Rubric matches our PRD exactly.

- [x] Input-side **prompt-injection guardrail** + 2 eval cases (`detectPromptInjection` in `src/lib/guardrails.ts`; t26/t27) — Reliability/Safety 20%
- [ ] Azure **Content Safety / Prompt Shields** behind the regex guardrail (needs Foundry)
- [ ] **Agent tracing/observability** (OpenTelemetry → App Insights) — screenshot a trace; Reasoning 20%
- [ ] **Foundry built-in evaluators** (Rubric/agent/safety) run alongside our custom harness — Accuracy 20%
- [ ] Architecture diagram explicitly showing **Foundry Agent Service + File Search + tools**

## Submission requirements (corrected from official rules)
- [ ] Submit via a **GitHub issue** using the `project.yml` template in `microsoft/agentsleague` (NOT Devpost)
- [ ] README must include **team details + Microsoft Learn username**
- [ ] **Architecture diagram is a required deliverable** (must show Microsoft Foundry usage)
- [ ] Project description: features, problem solved, technologies
- [ ] Demo video ≤5 min on YouTube/Vimeo (entrant's own work)
- [ ] Check the official **Reasoning Agents starter kit** for expected structure
- Limits: 3 entries/challenge, 9 total. Entry period closes **Jun 14, 11:59 PM PT**; register by **Jun 12**.

## Buffer rule
If a day slips, cut **polish first** (animations, extra eval cases, fancy deploy) — never the real agent, the eval number, or the video. The agent core must stay on **Azure AI Foundry** for track qualification.
