import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, PhoneCall, Play, Pause, RadioTower, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnalysisResultCard } from "./AnalysisResult";
import { analyzeMessage } from "@/lib/api";
import { recordAnalysis } from "@/lib/analysisLog";
import { SAMPLES } from "@/lib/samples";
import type { AnalysisResult, InputKind, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

// Fake senders so the feed reads like a real notification tray.
const SENDERS: Record<string, string> = {
  "bank-otp": "+92 300 111 2233",
  courier: "TCS-Courier",
  jazzcash: "+92 321 445 9981",
  easypaisa: "Easypaisa",
  lottery: "+92 333 776 2210",
  "roman-urdu": "+92 345 998 1120",
  urdu: "+92 302 556 7781",
  safe: "Daraz",
};

type FeedStatus = "incoming" | "scanning" | "done";

interface FeedItem {
  uid: string;
  sampleId: string;
  sender: string;
  kind: InputKind;
  language: Language;
  text: string;
  arrivedAt: number;
  status: FeedStatus;
  result: AnalysisResult | null;
}

// Skip the "safe" control message most of the time so the feed feels dangerous,
// but still let a clean message through occasionally to prove FraudGuard doesn't
// just flag everything.
function pickNextSample() {
  const scams = SAMPLES.filter((s) => s.id !== "safe");
  const useSafe = Math.random() < 0.2;
  const pool = useSafe ? SAMPLES : scams;
  return pool[Math.floor(Math.random() * pool.length)] ?? SAMPLES[0]!;
}

export function LiveInbox() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runAnalysis = useCallback(async (item: FeedItem) => {
    const analysis = await analyzeMessage(item.text, item.language, item.kind);
    setItems((prev) =>
      prev.map((it) => (it.uid === item.uid ? { ...it, status: "done", result: analysis } : it)),
    );
    setSelectedUid((current) => current ?? item.uid);
    recordAnalysis({
      risk_level: analysis.risk_level,
      matched_pattern: analysis.matched_pattern,
      language: item.language,
    });
  }, []);

  const spawnItem = useCallback(() => {
    const sample = pickNextSample();
    const uid = `${sample.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: FeedItem = {
      uid,
      sampleId: sample.id,
      sender: SENDERS[sample.id] ?? "Unknown",
      kind: sample.kind,
      language: sample.language,
      text: sample.text,
      arrivedAt: Date.now(),
      status: "incoming",
      result: null,
    };
    setItems((prev) => [item, ...prev].slice(0, 12));

    // brief "incoming" flash before the scan kicks in, mirrors a real notification
    setTimeout(() => {
      setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, status: "scanning" } : it)));
      void runAnalysis(item);
    }, 500);
  }, [runAnalysis]);

  useEffect(() => {
    if (!running) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    const scheduleNext = () => {
      const delay = 3200 + Math.random() * 2200;
      timeoutRef.current = setTimeout(() => {
        spawnItem();
        scheduleNext();
      }, delay);
    };
    spawnItem();
    scheduleNext();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const selected = items.find((it) => it.uid === selectedUid) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      {/* FEED */}
      <GlassCard glow className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              {running && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  running ? "bg-primary" : "bg-muted-foreground/40",
                )}
              />
            </span>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {running ? "Live Inbox — Monitoring" : "Live Inbox — Paused"}
            </p>
          </div>
          <MagneticButton
            size="sm"
            variant={running ? "ghost" : "primary"}
            magnetic={false}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? (
              <>
                <Pause className="size-4" aria-hidden="true" /> Pause
              </>
            ) : (
              <>
                <Play className="size-4" aria-hidden="true" /> Start Monitoring
              </>
            )}
          </MagneticButton>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Simulates messages and calls arriving on a phone in real time. Each one is scanned by
          FraudGuard the instant it lands — no manual paste needed.
        </p>

        <ul className="mt-5 space-y-2.5" aria-live="polite">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.uid}
                initial={{ opacity: 0, y: -12, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedUid(item.uid)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedUid === item.uid ? "border-primary/50 bg-primary/8" : "border-border bg-background/50",
                  )}
                >
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary/60">
                    {item.kind === "call" ? (
                      <PhoneCall className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <MessageSquare className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{item.sender}</span>
                      <StatusPill item={item} />
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {item.text}
                    </span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <li className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <RadioTower className="size-6" aria-hidden="true" />
              Press "Start Monitoring" to simulate incoming messages and calls.
            </li>
          )}
        </ul>
      </GlassCard>

      {/* DETAIL */}
      <GlassCard className="relative min-h-[420px] p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {selected?.status === "done" && selected.result && (
            <AnalysisResultCard key={selected.uid} result={selected.result} />
          )}
          {selected?.status === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[380px] flex-col items-center justify-center gap-3 text-center"
            >
              <ShieldAlert className="size-8 animate-pulse text-primary" aria-hidden="true" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                Scanning incoming {selected.kind === "call" ? "call" : "message"}…
              </p>
            </motion.div>
          )}
          {!selected && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[380px] flex-col items-center justify-center text-center"
            >
              <RadioTower className="size-9 text-primary" aria-hidden="true" />
              <p className="mt-5 text-lg font-bold tracking-tight">Waiting for activity</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Select any item from the inbox feed to see its full risk breakdown here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}

function StatusPill({ item }: { item: FeedItem }) {
  if (item.status === "incoming") {
    return (
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        New
      </span>
    );
  }
  if (item.status === "scanning") {
    return (
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-primary">
        Scanning…
      </span>
    );
  }
  const level = item.result?.risk_level ?? "LOW";
  const cls =
    level === "LOW"
      ? "text-success"
      : level === "MEDIUM"
        ? "text-warning"
        : "text-destructive";
  return (
    <span className={cn("shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider", cls)}>
      {level}
    </span>
  );
}