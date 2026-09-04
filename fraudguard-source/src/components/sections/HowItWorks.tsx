import { motion } from "framer-motion";
import { BrainCircuit, Gauge, MessageSquareText, ScanLine, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  { n: "01", title: "Message Arrives", copy: "An SMS or call transcript lands on the device.", Icon: MessageSquareText },
  { n: "02", title: "FraudGuard Reads It", copy: "Content is normalised across English, Urdu and Roman Urdu.", Icon: ScanLine },
  { n: "03", title: "AI Detects Patterns", copy: "Authority, urgency and credential signals are extracted.", Icon: BrainCircuit },
  { n: "04", title: "Risk Is Calculated", copy: "Weighted signals produce a 0–100 risk score and level.", Icon: Gauge },
  { n: "05", title: "User Gets an Explanation", copy: "The exact flagged phrase and reasoning are shown.", Icon: Sparkles },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="Process"
        title="How It Works"
        description="Five steps from an incoming message to a decision the user actually understands."
      />

      <div className="relative mt-12">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-9 hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--primary)_55%,transparent),transparent)] lg:block"
        />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur transition-colors hover:border-primary/45"
            >
              <div className="relative mx-auto grid size-16 place-items-center rounded-2xl border border-primary/30 bg-primary/8 transition-transform duration-300 group-hover:-translate-y-1">
                <s.Icon className="size-7 text-primary" aria-hidden="true" />
                <span className="absolute -right-2 -top-2 rounded-full border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-4 text-center text-base font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
                {s.copy}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
