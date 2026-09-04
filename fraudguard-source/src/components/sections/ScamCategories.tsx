import { motion } from "framer-motion";
import { Banknote, Package, Trophy, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MagneticButton } from "@/components/ui/MagneticButton";

const CATEGORIES = [
  {
    id: "bank-otp",
    title: "Bank OTP Scams",
    Icon: Banknote,
    example: "Your account will be blocked. Share the OTP to verify your account.",
  },
  {
    id: "courier",
    title: "Courier Scams",
    Icon: Package,
    example: "Your parcel is held at customs. Pay a clearance fee immediately.",
  },
  {
    id: "jazzcash",
    title: "Wallet Impersonation",
    Icon: Wallet,
    example: "Your JazzCash/Easypaisa account requires verification. Send your OTP.",
  },
  {
    id: "lottery",
    title: "Lottery Scams",
    Icon: Trophy,
    example: "You have won Rs 25,00,000. Send a processing fee to claim the prize.",
  },
];

export function ScamCategories({ onTry }: { onTry: (id: string) => void }) {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="Pattern library"
        title="The Scams Targeting Pakistani Users"
        description="Every phrase below is an illustrative example, not a real message. Load any of them straight into the scanner."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col rounded-2xl border border-border bg-surface/50 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="grid size-12 place-items-center rounded-xl border border-primary/30 bg-primary/8 transition-transform duration-500 group-hover:rotate-6">
              <c.Icon className="size-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm italic leading-relaxed text-muted-foreground">
              “{c.example}”
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Example only
            </p>
            <MagneticButton
              variant="outline"
              size="sm"
              magnetic={false}
              className="mt-4 w-full"
              onClick={() => onTry(c.id)}
            >
              Scan this example
            </MagneticButton>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
