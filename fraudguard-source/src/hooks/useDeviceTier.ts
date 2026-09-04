import { useEffect, useState } from "react";

export type DeviceTier = "high" | "medium" | "low";

export interface DeviceCapabilities {
  tier: DeviceTier;
  webgl: boolean;
  reducedMotion: boolean;
  ready: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>({
    tier: "high",
    webgl: true,
    reducedMotion: false,
    ready: false,
  });

  useEffect(() => {
    const width = window.innerWidth;
    const cores = navigator.hardwareConcurrency ?? 4;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tier: DeviceTier = width < 768 || cores <= 4 ? "low" : width < 1280 ? "medium" : "high";
    setCaps({ tier, webgl: detectWebGL(), reducedMotion, ready: true });
  }, []);

  return caps;
}

/** Normalized page scroll progress (0 → 1) for a given element. */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const total = rect.height + window.innerHeight;
        const p = (window.innerHeight - rect.top) / total;
        setProgress(Math.max(0, Math.min(1, p)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  return progress;
}
