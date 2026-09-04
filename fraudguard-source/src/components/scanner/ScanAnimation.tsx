import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  "Reading message content",
  "Tokenizing language patterns",
  "Matching known scam signatures",
  "Evaluating urgency & credential requests",
  "Calculating risk score",
];

export function ScanAnimation({ text, active }: { text: string; active: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setStage(0);
      return;
    }
    const id = setInterval(() => setStage((s) => Math.min(STAGES.length - 1, s + 1)), 520);
    return () => clearInterval(id);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-background/70 p-5"
          role="status"
          aria-live="polite"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] animate-scanline" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
                FraudGuard AI is analyzing…
              </p>
            </div>

            <p className="mt-4 max-h-28 overflow-hidden text-sm leading-relaxed text-muted-foreground">
              {text.slice(0, 260)}
              {text.length > 260 ? "…" : ""}
            </p>

            <ul className="mt-4 space-y-1.5">
              {STAGES.map((s, i) => (
                <li
                  key={s}
                  className={`flex items-center gap-2 font-mono text-[11px] transition-colors duration-300 ${
                    i <= stage ? "text-foreground" : "text-muted-foreground/45"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${i <= stage ? "bg-primary" : "bg-border"}`}
                  />
                  {s}
                  {i === stage && <span className="text-primary">…</span>}
                </li>
              ))}
            </ul>

            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full bg-[image:var(--gradient-primary)]"
                initial={{ width: "4%" }}
                animate={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
