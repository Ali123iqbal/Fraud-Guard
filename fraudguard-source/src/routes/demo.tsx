import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PhoneCall, RadioTower } from "lucide-react";
import { LiveInbox } from "@/components/scanner/LiveInbox";
import { LiveVoiceScan } from "@/components/scanner/LiveVoiceScan";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

type Mode = "inbox" | "voice";

function DemoPage() {
  const [mode, setMode] = useState<Mode>("voice");

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Live Mode</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Real-Time Detection Demo
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          FraudGuard scores messages and calls the instant they happen — no copy-pasting required.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div
          className="inline-flex rounded-full border border-border bg-background/50 p-1"
          role="tablist"
          aria-label="Demo mode"
        >
          <button
            role="tab"
            aria-selected={mode === "voice"}
            onClick={() => setMode("voice")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === "voice"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <PhoneCall className="size-4" aria-hidden="true" /> Live Voice Call
          </button>
          <button
            role="tab"
            aria-selected={mode === "inbox"}
            onClick={() => setMode("inbox")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === "inbox"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <RadioTower className="size-4" aria-hidden="true" /> Simulated Inbox
          </button>
        </div>
      </div>

      <div className="mt-10">{mode === "voice" ? <LiveVoiceScan /> : <LiveInbox />}</div>
    </main>
  );
}