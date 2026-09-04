import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Languages, Radar } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";

const PILLARS = [
  {
    Icon: Radar,
    title: "REAL-TIME DETECTION",
    copy: "Messages are scored the moment they arrive, before a reply is ever sent.",
  },
  {
    Icon: Brain,
    title: "EXPLAINABLE WARNINGS",
    copy: "Every verdict names the pattern, the flagged phrase and the reasoning behind it.",
  },
  {
    Icon: Languages,
    title: "URDU + ROMAN URDU SUPPORT",
    copy: "Detection works in the script and transliteration people actually receive.",
  },
];

const FLOW = ["Detect", "Explain", "Educate", "Protect"];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1200);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

export function TrustSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="Impact"
        title="Protection That Builds Digital Trust."
        description="FraudGuard is built to make digital payments safer for people who are targeted most — by teaching, not just blocking."
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <GlassCard className="h-full p-6" tilt>
              <p.Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-foreground">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="mt-6 flex flex-wrap items-center justify-center gap-3 p-6 sm:gap-6">
        {FLOW.map((f, i) => (
          <div key={f} className="flex items-center gap-3 sm:gap-6">
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">{f}</span>
            {i < FLOW.length - 1 && (
              <span className="text-primary" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </GlassCard>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Scam patterns modelled", value: 6 },
          { label: "Languages supported", value: 3 },
          { label: "Signals per analysis", value: 5 },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border bg-surface/40 p-5 text-center"
          >
            <p className="text-3xl font-extrabold text-primary">
              <Counter to={m.value} />
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
