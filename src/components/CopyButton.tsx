"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Small copy-to-clipboard button with a brief "Copied" confirmation. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <Button variant="ghost" size="xs" onClick={copy} aria-label={label}>
      {copied ? <Check className="text-emerald-600" /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}
