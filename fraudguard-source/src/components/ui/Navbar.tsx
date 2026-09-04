import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Radar, X } from "lucide-react";
import { Logo } from "./Logo";
import { MagneticButton } from "./MagneticButton";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Detection", href: "#detection" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Protection", href: "#protection" },
];

export function Navbar({ compact = false }: { compact?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (compact) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
          scrolled
            ? "glass glow-border shadow-[var(--shadow-glow)]"
            : "border border-transparent bg-transparent",
        )}
      >
        <Link to="/" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/demo"
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Demo
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <a href="#detection" className="hidden sm:block">
            <MagneticButton size="sm">
              <Radar className="size-4" aria-hidden="true" />
              Launch Scanner
            </MagneticButton>
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 md:hidden">
          <ul className="flex flex-col">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/demo"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              >
                Demo
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
