import { lazy, Suspense } from "react";
import type { DeviceTier } from "@/hooks/useDeviceTier";

const HeroScene = lazy(() => import("./HeroScene"));
const ThreatScene = lazy(() => import("./ThreatScene"));

interface Scene3DProps {
  variant: "hero" | "threat";
  tier: DeviceTier;
  progress: number;
  enabled: boolean;
}

/** 2D fallback used when WebGL is unavailable or motion is reduced. */
export function SceneFallback({ progress = 0 }: { progress?: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="grid-backdrop absolute inset-0 opacity-60" />
      <div className="relative">
        <div className="absolute inset-0 -m-24 rounded-full bg-primary/10 blur-3xl" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 animate-pulse-ring"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
        <div className="glow-border relative flex h-72 w-40 flex-col gap-2 rounded-3xl border border-border bg-surface/80 p-3 shadow-[var(--shadow-glow)] animate-float">
          <div className="h-2 w-10 self-center rounded-full bg-muted" />
          <div className="mt-2 h-6 rounded-md bg-primary/20" />
          <div className="h-6 rounded-md bg-destructive/25" />
          <div className="h-6 rounded-md bg-primary/15" />
          <div className="mt-auto h-10 rounded-md bg-primary/10" />
          <div
            className="pointer-events-none absolute inset-x-3 top-6 h-8 rounded-md bg-primary/20 blur-sm"
            style={{ transform: `translateY(${progress * 120}px)` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Scene3D({ variant, tier, progress, enabled }: Scene3DProps) {
  if (!enabled) return <SceneFallback progress={progress} />;
  const Scene = variant === "hero" ? HeroScene : ThreatScene;
  return (
    <Suspense fallback={<SceneFallback progress={progress} />}>
      <Scene tier={tier} progress={progress} />
    </Suspense>
  );
}
