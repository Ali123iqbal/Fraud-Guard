import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MonitorPlay } from "lucide-react";
import { Scene3D } from "@/components/3d/Scene3D";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useScrollProgress, type DeviceCapabilities } from "@/hooks/useDeviceTier";

export function FinalCta({ caps }: { caps: DeviceCapabilities }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const enabled3d = caps.ready && caps.webgl && !caps.reducedMotion;

  return (
    <section ref={ref} className="relative isolate overflow-hidden py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 -z-10">
        <Scene3D variant="threat" tier={caps.tier} progress={Math.min(1, progress + 0.35)} enabled={enabled3d} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl px-5 text-center"
      >
        <h2 className="text-balance text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
          Before You Trust the Message, <span className="text-gradient">Trust the Detection.</span>
        </h2>
        <p className="mt-5 text-pretty text-base text-muted-foreground sm:text-lg">
          Detect scams. Understand the threat. Protect your money.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#detection">
            <MagneticButton size="lg">
              Try FraudGuard
              <ArrowRight className="size-4" aria-hidden="true" />
            </MagneticButton>
          </a>
          <Link to="/demo">
            <MagneticButton size="lg" variant="outline">
              <MonitorPlay className="size-4" aria-hidden="true" />
              View Demo
            </MagneticButton>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
