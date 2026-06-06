"use client";

import { useState } from "react";
import type { Reasoning, StepEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReasoningTrail } from "@/components/ReasoningTrail";

const SAMPLES = [
  {
    label: "Routine refund",
    text: "My order arrived but the box was dented. I'd like a refund please. My email is alex@example.com.",
  },
  {
    label: "Hard / churn-risk",
    text: "This is the third time my delivery is late and support ignored me. I'm furious and talking to a lawyer — cancel everything.",
  },
];

export default function Home() {
  const [text, setText] = useState("");
  const [reasoning, setReasoning] = useState<Partial<Reasoning>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!text.trim() || running) return;
    setRunning(true);
    setError(null);
    setReasoning({});

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as StepEvent;
          if (event.type === "step") {
            setReasoning((prev) => ({ ...prev, [event.step]: event.data }));
          } else if (event.type === "error") {
            setError(event.message);
          }
        }
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">TriageMind</h1>
        <p className="text-muted-foreground">
          A support agent that reasons in the open, knows its limits, and
          refuses to break policy.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New complaint</CardTitle>
          <CardDescription>
            Paste a customer complaint and watch the 6 reasoning steps stream in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. My order never arrived and support won't respond..."
            rows={4}
            disabled={running}
          />
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <Button
                key={s.label}
                variant="outline"
                size="sm"
                disabled={running}
                onClick={() => setText(s.text)}
              >
                {s.label}
              </Button>
            ))}
            <Button onClick={run} disabled={running || !text.trim()}>
              {running ? "Reasoning…" : "Triage"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <ReasoningTrail reasoning={reasoning} />
    </main>
  );
}
