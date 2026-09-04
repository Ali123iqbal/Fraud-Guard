import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LANGUAGE_EXAMPLES } from "@/lib/samples";
import { mockAnalyze } from "@/lib/mockDetection";
import { cn } from "@/lib/utils";

export function LanguageSection() {
  const [index, setIndex] = useState(0);
  const example = LANGUAGE_EXAMPLES[index]!;
  const preview = mockAnalyze(example.text, example.language);

  return (
    <section id="languages" className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="Language-aware fraud detection"
        title="Scams Don't Always Speak English."
        description="FraudGuard understands the language and phrasing scammers actually use — including Urdu script and the Roman Urdu people really type."
      />

      <GlassCard className="mx-auto mt-10 max-w-3xl p-5 sm:p-7">
        <div
          className="inline-flex rounded-full border border-border bg-background/50 p-1"
          role="tablist"
          aria-label="Example language"
        >
          {LANGUAGE_EXAMPLES.map((l, i) => (
            <button
              key={l.language}
              role="tab"
              aria-selected={index === i}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                index === i
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={example.language}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-5"
          >
            <p
              dir={example.dir}
              lang={example.language === "urdu" ? "ur" : "en"}
              className="rounded-xl border border-destructive/25 bg-destructive/8 p-5 text-lg leading-relaxed"
            >
              {example.text}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                <Languages className="size-3.5" aria-hidden="true" />
                {preview.matched_pattern}
              </span>
              <span className="font-mono text-sm font-bold text-destructive">
                Risk {preview.risk_score}/100 · {preview.risk_level}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{preview.reasoning}</p>
          </motion.div>
        </AnimatePresence>
      </GlassCard>
    </section>
  );
}
