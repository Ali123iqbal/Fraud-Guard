import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SAMPLES } from "@/lib/samples";

export function DemoDeck({
  onSelect,
  compact = false,
}: {
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
      {SAMPLES.filter((s) => s.id !== "urdu").map((s, i) => (
        <motion.button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
        >
          <GlassCard tilt className="h-full p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                {s.category}
              </span>
              <PlayCircle className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-base font-bold tracking-tight">{s.title}</h3>
            <p
              dir={s.language === "urdu" ? "rtl" : "ltr"}
              className="mt-2 line-clamp-3 text-sm italic leading-relaxed text-muted-foreground"
            >
              “{s.text}”
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
              Load into scanner →
            </p>
          </GlassCard>
        </motion.button>
      ))}
    </div>
  );
}
