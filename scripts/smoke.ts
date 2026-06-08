// Connection smoke test: proves we can reach Azure AI Foundry, create an
// agent, run it, and read its reply — then cleans up. Run with:
//   npm run smoke
// (which loads .env.local and requires `az login` to have been done).

import { getAgentsClient, MODEL_DEPLOYMENT, PROJECT_ENDPOINT } from "../src/lib/azure";

async function main() {
  console.log(`Endpoint: ${PROJECT_ENDPOINT}`);
  console.log(`Model:    ${MODEL_DEPLOYMENT}\n`);

  const client = getAgentsClient();

  console.log("Creating agent…");
  const agent = await client.createAgent(MODEL_DEPLOYMENT, {
    name: "triagemind-smoke",
    instructions: "You are a terse assistant. Answer in one short sentence.",
  });
  console.log(`  agent id: ${agent.id}`);

  try {
    const thread = await client.threads.create();
    await client.messages.create(
      thread.id,
      "user",
      "Say hello and name the service you're running on.",
    );

    console.log("Running…");
    const run = await client.runs.createAndPoll(thread.id, agent.id, {
      pollingOptions: { intervalInMs: 1500 },
    });
    console.log(`  run status: ${run.status}`);
    if (run.status !== "completed") {
      throw new Error(
        `Run did not complete: ${run.status} ${JSON.stringify(run.lastError ?? {})}`,
      );
    }

    const messages = await client.messages.list(thread.id, { order: "desc" });
    for await (const m of messages) {
      if (m.role !== "assistant") continue;
      const text = m.content.find((c) => c.type === "text");
      if (text && "text" in text) {
        console.log(`\n✅ Assistant: ${text.text.value}`);
        break;
      }
    }
  } finally {
    await client.deleteAgent(agent.id);
    console.log("\nCleaned up agent.");
  }
}

main().catch((err) => {
  console.error("\n❌ Smoke test failed:\n", err);
  process.exit(1);
});
