import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { className, tilt = false, glow = false, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "glass glow-border rounded-2xl",
        glow && "shadow-[var(--shadow-glow)]",
        tilt &&
          "transition-transform duration-300 will-change-transform hover:-translate-y-1 hover:rotate-[0.35deg]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
