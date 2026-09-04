import { useRef } from "react";
import { motion } from "framer-motion";
import { Scene3D } from "@/components/3d/Scene3D";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useScrollProgress, type DeviceCapabilities } from "@/hooks/useDeviceTier";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Communication", copy: "A call or SMS reaches the device." },
  { label: "Detection", copy: "FraudGuard reads the content on arrival." },
  { label: "Analysis", copy: "Language patterns are matched against scam signatures." },
  { label: "Warning", copy: "A risk score and reason are produced." },
  { label: "Protection", copy: "The shield blocks the request before money moves." },
];

export function ThreatVisualization({ caps }: { caps: DeviceCapabilities }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const active = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length));
  const enabled3d = caps.ready && caps.webgl && !caps.reducedMotion;

  return (
    <section id="protection" ref={ref} className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Live threat visualisation"
          title="See a Scam Being Stopped"
          description="Scroll through the interception: an incoming signal is read, analysed, scored, and deflected by the FraudGuard shield."
        />

        <div className="relative mt-12 h-[460px] w-full sm:h-[560px]">
          <Scene3D variant="threat" tier={caps.tier} progress={progress} enabled={enabled3d} />
        </div>

        <ol className="relative mt-8 grid gap-3 sm:grid-cols-5">
          {STAGES.map((s, i) => (
            <motion.li
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className={cn(
                "rounded-xl border p-4 transition-colors duration-500",
                i <= active
                  ? "border-primary/40 bg-primary/8"
                  : "border-border bg-secondary/25 opacity-70",
              )}
            >
              <p
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.2em]",
                  i <= active ? "text-primary" : "text-muted-foreground",
                )}
              >
                0{i + 1} · {s.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
