// Azure AI Foundry client factory. Builds a single AgentsClient from env and
// shares it across the triage engine, the KB-upload script, and the eval
// harness. Auth is keyless via Entra ID (DefaultAzureCredential) — run
// `az login` locally, or set service-principal env vars in CI.

import { AgentsClient } from "@azure/ai-agents";
import { DefaultAzureCredential } from "@azure/identity";

/** The Foundry project endpoint, e.g. https://<res>.services.ai.azure.com/api/projects/<name>. */
export const PROJECT_ENDPOINT = process.env.AZURE_AI_PROJECT_ENDPOINT ?? "";

/** The deployed model name (e.g. gpt-4o-mini). */
export const MODEL_DEPLOYMENT =
  process.env.AZURE_AI_MODEL_DEPLOYMENT ?? "gpt-4o-mini";

let client: AgentsClient | undefined;

/**
 * Returns a shared AgentsClient. Throws a clear error if the endpoint env var
 * is missing, so misconfiguration fails loud instead of as a vague 401 later.
 */
export function getAgentsClient(): AgentsClient {
  if (!PROJECT_ENDPOINT) {
    throw new Error(
      "AZURE_AI_PROJECT_ENDPOINT is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  if (!client) {
    client = new AgentsClient(PROJECT_ENDPOINT, new DefaultAzureCredential());
  }
  return client;
}
