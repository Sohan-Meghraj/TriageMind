// POST /api/triage — runs a complaint through the triage engine and streams
// each reasoning step back to the browser as Server-Sent Events (SSE). This
// drives the animated glass-box UI (§6 architecture).

import type { NextRequest } from "next/server";
import { runTriage } from "@/lib/agent";
import type { Complaint } from "@/lib/types";

// The agent uses Node APIs (and later the Azure SDK), so force the Node runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { text?: string; customerEmail?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "Missing complaint text" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const complaint: Complaint = {
    id: `c_${crypto.randomUUID()}`,
    text,
    customerEmail: body.customerEmail?.trim() || undefined,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      try {
        for await (const event of runTriage(complaint)) {
          send(event);
        }
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
