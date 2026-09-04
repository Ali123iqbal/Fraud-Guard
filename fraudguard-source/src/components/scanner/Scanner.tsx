import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, PhoneCall, Radar, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScanAnimation } from "./ScanAnimation";
import { AnalysisResultCard } from "./AnalysisResult";
import { analyzeMessage } from "@/lib/api";
import { recordAnalysis } from "@/lib/analysisLog";
import { SAMPLES } from "@/lib/samples";
import type { AnalysisResult, InputKind, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "urdu", label: "Urdu" },
  { value: "roman-urdu", label: "Roman Urdu" },
];

const QUICK_TESTS = ["bank-otp", "courier", "jazzcash", "lottery"];

export interface ScannerHandle {
  load: (text: string, language: Language, kind: InputKind) => void;
}

interface ScannerProps {
  large?: boolean;
  presetId?: string | null;
  onPresetConsumed?: () => void;
}

export function Scanner({ large = false, presetId, onPresetConsumed }: ScannerProps) {
  const [kind, setKind] = useState<InputKind>("sms");
  const [language, setLanguage] = useState<Language>("english");
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const loadSample = useCallback((id: string) => {
    const s = SAMPLES.find((x) => x.id === id);
    if (!s) return;
    setText(s.text);
    setLanguage(s.language);
    setKind(s.kind);
    setResult(null);
  }, []);

  useEffect(() => {
    if (presetId) {
      loadSample(presetId);
      onPresetConsumed?.();
      document.getElementById("detection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [presetId, loadSample, onPresetConsumed]);

  const analyze = async () => {
    if (!text.trim()) {
      toast.error("Add a message first", {
        description: "Paste an SMS or call transcript, or load one of the examples.",
      });
      return;
    }
    setScanning(true);
    setResult(null);
    const started = Date.now();
    const analysis = await analyzeMessage(text, language, kind);
    const wait = Math.max(0, 2600 - (Date.now() - started));
    timer.current = setTimeout(() => {
      setResult(analysis);
      setScanning(false);
      recordAnalysis({
        risk_level: analysis.risk_level,
        matched_pattern: analysis.matched_pattern,
        language,
      });
      toast[analysis.risk_score >= 60 ? "warning" : "success"](
        analysis.risk_score >= 60 ? "Threat detected" : "Analysis complete",
        { description: `${analysis.verdict} — risk ${analysis.risk_score}/100` },
      );
    }, wait);
  };

  const reset = () => {
    setText("");
    setResult(null);
    setScanning(false);
  };

  const isUrdu = language === "urdu";

  return (
    <div className={cn("grid gap-5", large ? "lg:grid-cols-[1fr_1.15fr]" : "lg:grid-cols-2")}>
      {/* INPUT */}
      <GlassCard glow className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-full border border-border bg-background/50 p-1"
            role="tablist"
            aria-label="Input type"
          >
            {(
              [
                { v: "sms" as const, label: "SMS", Icon: MessageSquare },
                { v: "call" as const, label: "Call Transcript", Icon: PhoneCall },
              ]
            ).map(({ v, label, Icon }) => (
              <button
                key={v}
                role="tab"
                aria-selected={kind === v}
                onClick={() => setKind(v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  kind === v
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="sr-only sm:not-sr-only">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              aria-label="Message language"
              className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label htmlFor="scanner-input" className="sr-only">
          {kind === "sms" ? "Suspicious SMS" : "Phone call transcript"}
        </label>
        <textarea
          id="scanner-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          dir={isUrdu ? "rtl" : "ltr"}
          rows={large ? 9 : 7}
          placeholder={
            kind === "sms" ? "Paste a suspicious SMS here…" : "Paste a phone call transcript here…"
          }
          className={cn(
            "mt-4 w-full resize-none rounded-xl border border-input bg-background/60 p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            large && "text-base",
          )}
        />

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Example quick tests
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_TESTS.map((id) => {
              const s = SAMPLES.find((x) => x.id === id)!;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => loadSample(id)}
                  className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Try {s.title.replace(" Scam", "")} Scam
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => loadSample("roman-urdu")}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Roman Urdu
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <MagneticButton onClick={analyze} loading={scanning} disabled={scanning} size={large ? "lg" : "md"}>
            <Radar className="size-4" aria-hidden="true" />
            {scanning ? "Analyzing…" : "Analyze Message"}
          </MagneticButton>
          <MagneticButton variant="ghost" size="sm" magnetic={false} onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Clear
          </MagneticButton>
        </div>
      </GlassCard>

      {/* OUTPUT */}
      <GlassCard className="relative min-h-[420px] p-5 sm:p-6">
        <ScanAnimation text={text} active={scanning} />
        <AnimatePresence mode="wait">
          {!scanning && result && <AnalysisResultCard key="result" result={result} />}
          {!scanning && !result && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[380px] flex-col items-center justify-center text-center"
            >
              <div className="relative grid size-24 place-items-center">
                <span className="absolute size-24 rounded-full border border-primary/20 animate-pulse-ring" />
                <ShieldCheck className="size-9 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-5 text-lg font-bold tracking-tight">Scanner ready</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Paste a message or pick an example. FraudGuard returns a risk score, the matched
                scam pattern, and a plain-language explanation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}