import type { AnalysisResult, InputKind, Language, RiskLevel, ThreatIndicator } from "./types";

interface Rule {
  id: string;
  weight: number;
  pattern: string;
  indicator: "authority" | "urgency" | "credential" | "payment" | "reward" | "link";
  terms: string[];
}

const RULES: Rule[] = [
  {
    id: "credential",
    weight: 34,
    pattern: "Credential / OTP Harvesting",
    indicator: "credential",
    terms: [
      "otp",
      "one time password",
      "one-time password",
      "pin code",
      "atm pin",
      "cvv",
      "password",
      "verification code",
      "code share",
      "share the code",
      "او ٹی پی",
      "پاس ورڈ",
      "کوڈ",
      "pin",
      "otp share",
      "code batao",
      "code bhejain",
      "code bhejein",
    ],
  },
  {
    id: "authority",
    weight: 26,
    pattern: "Authority Impersonation",
    indicator: "authority",
    terms: [
      "bank",
      "state bank",
      "hbl",
      "meezan",
      "ubl",
      "jazzcash",
      "jazz cash",
      "easypaisa",
      "easy paisa",
      "customs",
      "fbr",
      "police",
      "helpline",
      "customer care",
      "official",
      "بینک",
      "اسٹیٹ بینک",
      "کسٹمز",
      "ہیلپ لائن",
    ],
  },
  {
    id: "urgency",
    weight: 20,
    pattern: "Manufactured Urgency",
    indicator: "urgency",
    terms: [
      "immediately",
      "urgent",
      "within 30 minutes",
      "right now",
      "will be blocked",
      "will be closed",
      "last warning",
      "final notice",
      "expires",
      "فوری",
      "فوری طور پر",
      "بند ہونے والا",
      "آخری",
      "foran",
      "jaldi",
      "abhi",
      "band ho jaye",
      "band hone wala",
    ],
  },
  {
    id: "payment",
    weight: 22,
    pattern: "Advance Fee / Clearance Payment",
    indicator: "payment",
    terms: [
      "clearance fee",
      "customs duty",
      "delivery charges",
      "pay rs",
      "transfer rs",
      "processing fee",
      "send money",
      "paisay bhejain",
      "paisay bhejein",
      "فیس",
      "رقم",
      "ادائیگی",
    ],
  },
  {
    id: "reward",
    weight: 18,
    pattern: "Prize / Lottery Bait",
    indicator: "reward",
    terms: [
      "you have won",
      "lucky draw",
      "lottery",
      "prize",
      "winner",
      "congratulations you",
      "inaam",
      "انعام",
      "قرعہ اندازی",
      "لاٹری",
      "mubarak ho",
    ],
  },
  {
    id: "link",
    weight: 12,
    pattern: "Suspicious Link / Callback",
    indicator: "link",
    terms: ["http://", "https://", "bit.ly", "tinyurl", "click here", "link par", "لنک"],
  },
];

export const INDICATOR_META: Record<string, { label: string; description: string }> = {
  authority: {
    label: "AUTHORITY IMPERSONATION",
    description: "Claims to represent a bank or payment service.",
  },
  urgency: {
    label: "URGENCY",
    description: "Creates pressure to act immediately.",
  },
  credential: {
    label: "CREDENTIAL REQUEST",
    description: "Requests an OTP, PIN, password, or other sensitive information.",
  },
  payment: {
    label: "PAYMENT DEMAND",
    description: "Asks for an upfront fee or money transfer.",
  },
  reward: {
    label: "PRIZE BAIT",
    description: "Promises a prize or winnings that were never entered for.",
  },
  link: {
    label: "UNTRUSTED LINK",
    description: "Directs to an external link or callback number.",
  },
};

function levelFor(score: number): RiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 32) return "MEDIUM";
  return "LOW";
}

function verdictFor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL":
      return "Almost Certainly a Scam";
    case "HIGH":
      return "Likely Scam";
    case "MEDIUM":
      return "Suspicious — Verify First";
    default:
      return "No Strong Scam Signals";
  }
}

function findPhrase(text: string, term: string): string | null {
  const idx = text.toLowerCase().indexOf(term);
  if (idx === -1) return null;
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, idx - 22)));
  const rawEnd = idx + term.length + 34;
  const end = rawEnd >= text.length ? text.length : text.indexOf(" ", rawEnd);
  return text.slice(start, end === -1 ? text.length : end).trim();
}

/** Deterministic on-device heuristic engine — the offline fallback for the demo. */
export function mockAnalyze(
  message: string,
  language: Language,
  kind: InputKind = "sms",
): AnalysisResult {
  const text = message.toLowerCase();
  let score = 0;
  const hits: { rule: Rule; term: string }[] = [];

  for (const rule of RULES) {
    const term = rule.terms.find((t) => text.includes(t));
    if (term) {
      score += rule.weight;
      hits.push({ rule, term });
    }
  }

  if (hits.length >= 3) score += 8;
  if (kind === "call" && hits.some((h) => h.rule.id === "credential")) score += 6;
  score = Math.max(hits.length ? 22 : 6, Math.min(97, score));

  const level = levelFor(score);
  const primary = hits.slice().sort((a, b) => b.rule.weight - a.rule.weight)[0];
  const flagged = primary ? (findPhrase(message, primary.term) ?? primary.term) : "";

  const indicators: ThreatIndicator[] = ["authority", "urgency", "credential", "payment", "reward"]
    .map((id) => ({
      id,
      label: INDICATOR_META[id]!.label,
      description: INDICATOR_META[id]!.description,
      present: hits.some((h) => h.rule.indicator === id),
    }))
    .filter((i) => i.present || ["authority", "urgency", "credential"].includes(i.id));

  const reasonParts: string[] = [];
  if (hits.some((h) => h.rule.indicator === "authority"))
    reasonParts.push("impersonates a financial institution or official body");
  if (hits.some((h) => h.rule.indicator === "urgency"))
    reasonParts.push("manufactures urgency so the recipient reacts before thinking");
  if (hits.some((h) => h.rule.indicator === "credential"))
    reasonParts.push("requests a one-time password or other private credential");
  if (hits.some((h) => h.rule.indicator === "payment"))
    reasonParts.push("demands an upfront fee before any service is delivered");
  if (hits.some((h) => h.rule.indicator === "reward"))
    reasonParts.push("dangles a prize that the recipient never entered for");

  const reasoning = reasonParts.length
    ? `This ${kind === "call" ? "call transcript" : "message"} ${reasonParts.join(", ")}. Legitimate banks and wallet services never ask customers to share an OTP, PIN, or password, and never require a fee to release funds or parcels.`
    : `No known scam pattern matched this ${kind === "call" ? "call transcript" : "message"}. Stay cautious anyway: never share an OTP or PIN, even if the caller sounds official.`;

  return {
    risk_score: score,
    verdict: verdictFor(level),
    matched_pattern: primary ? primary.rule.pattern : "No Known Pattern",
    reasoning,
    flagged_phrase: flagged,
    risk_level: level,
    indicators,
    language,
    source: "demo",
  };
}
