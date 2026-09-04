import { motion } from "framer-motion";
import { FlaskConical, Quote, ShieldAlert, Sparkles } from "lucide-react";
import { RiskGauge } from "./RiskGauge";
import { ThreatIndicators } from "./ThreatIndicators";
import type { AnalysisResult as Result } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_STYLES = {
  LOW: "border-success/40 bg-success/10 text-success",
  MEDIUM: "border-warning/40 bg-warning/10 text-warning",
  HIGH: "border-destructive/40 bg-destructive/10 text-destructive",
  CRITICAL: "border-destructive/60 bg-destructive/15 text-destructive",
} as const;

export function AnalysisResultCard({ result }: { result: Result }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
      className="rounded-2xl border border-border bg-background/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em]",
            LEVEL_STYLES[result.risk_level],
          )}
        >
          <ShieldAlert className="size-3.5" aria-hidden="true" />
          {result.risk_level} RISK
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {result.source === "demo" ? (
            <>
              <FlaskConical className="size-3" aria-hidden="true" /> Demo Analysis
            </>
          ) : (
            <>
              <Sparkles className="size-3" aria-hidden="true" /> Live API
            </>
          )}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <RiskGauge score={result.risk_score} level={result.risk_level} />
        <dl className="flex-1 space-y-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Verdict
            </dt>
            <dd className="text-xl font-bold tracking-tight">{result.verdict}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Matched Pattern
            </dt>
            <dd className="text-base font-semibold text-primary">{result.matched_pattern}</dd>
          </div>
          {result.flagged_phrase && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Flagged Phrase
              </dt>
              <dd className="mt-1 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-sm italic leading-relaxed">
                <Quote className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
                <span>{result.flagged_phrase}</span>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-secondary/25 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Reasoning
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{result.reasoning}</p>
      </div>

      <ThreatIndicators indicators={result.indicators} />
    </motion.article>
  );
}
