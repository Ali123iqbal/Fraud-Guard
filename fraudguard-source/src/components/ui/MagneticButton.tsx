import { forwardRef, useRef, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110",
  outline:
    "border border-primary/40 bg-primary/5 text-foreground hover:bg-primary/12 hover:border-primary/70",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
  danger: "bg-[image:var(--gradient-danger)] text-destructive-foreground hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    { className, variant = "primary", size = "md", magnetic = true, loading, children, ...props },
    ref,
  ) {
    const inner = useRef<HTMLSpanElement>(null);

    const onMove = (e: MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !inner.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      inner.current.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    };

    const onLeave = () => {
      if (inner.current) inner.current.style.transform = "translate(0,0)";
    };

    return (
      <button
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight",
          "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-55",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        aria-busy={loading || undefined}
        {...props}
      >
        <span
          ref={inner}
          className="inline-flex items-center gap-2 transition-transform duration-200 ease-out"
        >
          {loading && (
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          )}
          {children}
        </span>
      </button>
    );
  },
);
