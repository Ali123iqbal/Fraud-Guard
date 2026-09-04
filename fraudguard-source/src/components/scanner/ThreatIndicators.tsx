import { motion } from "framer-motion";
import { AlertTriangle, KeyRound, Landmark, ShieldCheck, Timer, Trophy, Wallet } from "lucide-react";
import type { ThreatIndicator } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Landmark> = {
  authority: Landmark,
  urgency: Timer,
  credential: KeyRound,
  payment: Wallet,
  reward: Trophy,
};

export function ThreatIndicators({ indicators }: { indicators: ThreatIndicator[] }) {
  return (
    <section aria-labelledby="why-flagged" className="mt-8">
      <h3
        id="why-flagged"
        className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground"
      >
        Why FraudGuard Flagged This
      </h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {indicators.map((ind, i) => {
          const Icon = ICONS[ind.id] ?? AlertTriangle;
          return (
            <motion.li
              key={ind.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "rounded-xl border p-4",
                ind.present
                  ? "border-destructive/35 bg-destructive/8"
                  : "border-border bg-secondary/30",
              )}
            >
              <div className="flex items-center gap-2">
                {ind.present ? (
                  <Icon className="size-4 text-destructive" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-[0.16em]",
                    ind.present ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {ind.label}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {ind.description}
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {ind.present ? "Detected" : "Not detected"}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
