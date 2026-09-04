import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MonitorPlay, Presentation } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Scanner } from "@/components/scanner/Scanner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LanguageSection } from "@/components/sections/LanguageSection";
import { ThreatVisualization } from "@/components/sections/ThreatVisualization";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ScamCategories } from "@/components/sections/ScamCategories";
import { TrustSection } from "@/components/sections/TrustSection";
import { DemoDeck } from "@/components/sections/DemoDeck";
import { FinalCta } from "@/components/sections/FinalCta";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Logo } from "@/components/ui/Logo";
import { useDeviceCapabilities } from "@/hooks/useDeviceTier";

const TITLE = "FraudGuard — AI Detection for Phone & SMS Scams";
const DESCRIPTION =
  "FraudGuard detects scam calls and SMS in English, Urdu and Roman Urdu, scores the risk, and explains exactly why a message is dangerous.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const caps = useDeviceCapabilities();
  const [preset, setPreset] = useState<string | null>(null);
  const clearPreset = useCallback(() => setPreset(null), []);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <Hero caps={caps} />

        <section id="detection" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
          <SectionHeading
            eyebrow="Live fraud scanner"
            title="Analyse a Message in Seconds"
            description="Paste a suspicious SMS or call transcript. FraudGuard scores the risk, names the pattern, and explains the reasoning in plain language."
          />
          <div className="mt-10">
            <Scanner presetId={preset} onPresetConsumed={clearPreset} />
          </div>
        </section>

        <LanguageSection />
        <ThreatVisualization caps={caps} />
        <HowItWorks />
        <ScamCategories onTry={setPreset} />

        <section id="demo-mode" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24">
          <SectionHeading
            eyebrow="Hackathon demo mode"
            title="Preloaded Scam Scenarios"
            description="Pick a scenario to populate the scanner instantly. Everything runs offline with the on-device engine if the API is unavailable."
          />
          <div className="mt-8 flex justify-center">
            <Link to="/demo">
              <MagneticButton size="lg">
                <Presentation className="size-4" aria-hidden="true" />
                Open Demo Mode
              </MagneticButton>
            </Link>
          </div>
          <div className="mt-10">
            <DemoDeck onSelect={setPreset} />
          </div>
        </section>

        <TrustSection />
        <FinalCta caps={caps} />
      </main>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-center text-xs text-muted-foreground">
            Prototype built for a university hackathon. Example scam messages are illustrative.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <MonitorPlay className="size-3.5" aria-hidden="true" />
            Demo mode
          </Link>
        </div>
      </footer>
    </div>
  );
}
