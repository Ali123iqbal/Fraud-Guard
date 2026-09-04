import { createFileRoute } from "@tanstack/react-router";
import { ImpactDashboard } from "@/components/dashboard/ImpactDashboard";

export const Route = createFileRoute("/impact")({
  component: ImpactPage,
});

function ImpactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Impact</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Detection Coverage & Impact
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Live stats from every scan run across the scanner, live inbox, and live call demos.
        </p>
      </div>
      <div className="mt-10">
        <ImpactDashboard />
      </div>
    </main>
  );
}