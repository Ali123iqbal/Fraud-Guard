import { useEffect, useRef, useState } from "react";
import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const LEVEL_CLASS: Record<RiskLevel, { stroke: string; text: string }> = {
  LOW: { stroke: "stroke-success", text: "text-success" },
  MEDIUM: { stroke: "stroke-warning", text: "text-warning" },
  HIGH: { stroke: "stroke-destructive", text: "text-destructive" },
  CRITICAL: { stroke: "stroke-destructive", text: "text-destructive" },
};

export function RiskGauge({
  score,
  level,
  size = 190,
}: {
  score: number;
  level: RiskLevel;
  size?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (score - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [score]);

  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c * 0.75;

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${score} out of 100, ${level} risk`}
    >
      <svg width={size} height={size} className="-rotate-[218deg]" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="fill-none stroke-border"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={cn("fill-none transition-[stroke] duration-500", LEVEL_CLASS[level].stroke)}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c}`}
          strokeDashoffset={offset - c * 0.25}
          style={{ filter: "drop-shadow(0 0 10px currentColor)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-mono text-5xl font-extrabold tabular-nums", LEVEL_CLASS[level].text)}>
          {display}
        </span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}
