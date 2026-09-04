import { useEffect, useState, useSyncExternalStore } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";
import { LanguagesIcon, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SAMPLES } from "@/lib/samples";
import { clearAnalysisLog, getAnalysisLog, subscribeAnalysisLog } from "@/lib/analysisLog";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<string, string> = {
  LOW: "var(--success)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--destructive)",
  CRITICAL: "var(--destructive)",
};

const LANG_LABEL: Record<string, string> = {
  english: "English",
  urdu: "Urdu",
  "roman-urdu": "Roman Urdu",
};

const riskChartConfig = {
  count: { label: "Scans" },
  LOW: { label: "Low", color: "var(--success)" },
  MEDIUM: { label: "Medium", color: "var(--warning)" },
  HIGH: { label: "High", color: "var(--destructive)" },
  CRITICAL: { label: "Critical", color: "var(--destructive)" },
} satisfies ChartConfig;

const langChartConfig = {
  count: { label: "Coverage", color: "var(--primary)" },
} satisfies ChartConfig;

export function ImpactDashboard() {
  const log = useSyncExternalStore(subscribeAnalysisLog, getAnalysisLog, getAnalysisLog);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Baseline coverage from the built-in sample library so the charts have shape
  // even before anyone has run a live scan this session.
  const baselineByCategory = SAMPLES.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const baselineLanguages = new Set(SAMPLES.map((s) => s.language)).size;

  const totalScans = log.length;
  const highRisk = log.filter((l) => l.risk_level === "HIGH" || l.risk_level === "CRITICAL").length;
  const languagesSeen = new Set(log.map((l) => l.language));
  const languagesCovered = mounted && log.length > 0 ? languagesSeen.size : baselineLanguages;

  const riskCounts = (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((level) => ({
    level,
    count: log.filter((l) => l.risk_level === level).length,
  }));
  const hasLiveRisk = riskCounts.some((r) => r.count > 0);

  const languageCounts = Object.entries(LANG_LABEL).map(([key, label]) => {
    const liveCount = log.filter((l) => l.language === key).length;
    const baselineCount = SAMPLES.filter((s) => s.language === key).length;
    return { language: label, count: mounted && totalScans > 0 ? liveCount : baselineCount };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ShieldCheck}
          label="Scans this session"
          value={mounted ? totalScans : "—"}
          hint="Across Scanner, Live Inbox & Live Call"
        />
        <StatCard
          icon={ShieldAlert}
          label="High-risk caught"
          value={mounted ? highRisk : "—"}
          hint="HIGH or CRITICAL verdicts"
          tone="danger"
        />
        <StatCard
          icon={LanguagesIcon}
          label="Languages covered"
          value={languagesCovered}
          hint="English, Urdu, Roman Urdu"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Risk Level Breakdown
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasLiveRisk ? "From analyses run this session." : "Run a scan to populate this live."}
          </p>
          <ChartContainer config={riskChartConfig} className="mx-auto mt-4 aspect-square max-h-64">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={hasLiveRisk ? riskCounts.filter((r) => r.count > 0) : riskCounts}
                dataKey="count"
                nameKey="level"
                innerRadius={55}
                outerRadius={90}
                strokeWidth={2}
              >
                {(hasLiveRisk ? riskCounts.filter((r) => r.count > 0) : riskCounts).map((entry) => (
                  <Cell key={entry.level} fill={RISK_COLOR[entry.level]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Language Coverage
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Local-language detection is FraudGuard's core differentiator.
          </p>
          <ChartContainer config={langChartConfig} className="mt-4 max-h-64 w-full">
            <BarChart data={languageCounts}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="language" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={6} />
            </BarChart>
          </ChartContainer>
        </GlassCard>
      </div>

      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-xs text-muted-foreground">
          {mounted && totalScans > 0
            ? `${totalScans} live scan${totalScans === 1 ? "" : "s"} logged this session.`
            : "Category and language charts start from the built-in scam library and switch to live data once you run a scan."}
        </p>
        {mounted && totalScans > 0 && (
          <MagneticButton size="sm" variant="ghost" magnetic={false} onClick={() => clearAnalysisLog()}>
            <Trash2 className="size-3.5" aria-hidden="true" /> Reset session stats
          </MagneticButton>
        )}
      </GlassCard>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "danger";
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4", tone === "danger" ? "text-destructive" : "text-primary")}
          aria-hidden="true"
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 font-mono text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </GlassCard>
  );
}
