import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-xl border border-primary/35 bg-primary/10">
        <svg viewBox="0 0 24 24" className="size-5" role="img" aria-label="FraudGuard logo">
          <path
            d="M12 2.5 4.5 5.5v6.2c0 4.6 3.2 8.3 7.5 9.8 4.3-1.5 7.5-5.2 7.5-9.8V5.5L12 2.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="text-primary"
          />
          <rect
            x="9.4"
            y="8"
            width="5.2"
            height="8"
            rx="1.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            className="text-primary-glow"
          />
          <path
            d="M7 12h2M15 12h2M12 6.6v1.2M12 16v1.4"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            className="text-primary/70"
          />
          <circle cx="7" cy="12" r="0.9" className="fill-primary" />
          <circle cx="17" cy="12" r="0.9" className="fill-primary" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Fraud<span className="text-gradient">Guard</span>
      </span>
    </span>
  );
}
