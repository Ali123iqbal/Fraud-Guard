import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import { Scene3D } from "@/components/3d/Scene3D";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useScrollProgress, type DeviceCapabilities } from "@/hooks/useDeviceTier";

export function Hero({ caps }: { caps: DeviceCapabilities }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const enabled3d = caps.ready && caps.webgl && !caps.reducedMotion;

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="grid-backdrop pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            AI scam detection for calls & SMS
          </p>
          <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Stop Scams Before They <span className="text-gradient">Cost You.</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            FraudGuard uses AI to detect suspicious calls and messages in real time — and explains
            exactly why they may be dangerous.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#detection">
              <MagneticButton size="lg">
                Try FraudGuard
                <ArrowRight className="size-4" aria-hidden="true" />
              </MagneticButton>
            </a>
            <a href="#how-it-works">
              <MagneticButton size="lg" variant="outline">
                <PlayCircle className="size-4" aria-hidden="true" />
                See How It Works
              </MagneticButton>
            </a>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              ["Real-time", "Detection"],
              ["Explainable", "Warnings"],
              ["EN · UR · Roman", "Language aware"],
            ].map(([a, b]) => (
              <div key={b}>
                <dt className="text-sm font-bold tracking-tight">{a}</dt>
                <dd className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {b}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <div className="relative h-[380px] w-full sm:h-[520px] lg:h-[620px]">
          <Scene3D variant="hero" tier={caps.tier} progress={progress} enabled={enabled3d} />
        </div>
      </div>
    </section>
  );
}
