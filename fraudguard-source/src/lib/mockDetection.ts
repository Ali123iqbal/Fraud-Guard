import type { AnalysisResult, InputKind, Language, RiskLevel, ThreatIndicator } from "./types";

/**
 * Detection model
 * ---------------
 * 1. "Safety advice" sentences ("Never share your PIN", "We will never ask you for a code") are
 *    removed first, so a genuine warning can never be mistaken for the scam it warns about.
 * 2. CRITICAL rules (those with a `floor`) are enough ON THEIR OWN to flag a message. A single
 *    credential request, fee demand, prize claim, account-block threat, scam delivery notice or
 *    shortened link sets a minimum score, no matter how few other signals appear.
 * 3. SUPPORTING rules (authority, urgency, generic payment/link words...) only add weight. They
 *    can reach MEDIUM/HIGH together, but one alone never flags a message.
 * 4. A genuine one-time-code delivery ("Your PIN is 964181 ... never share it") that contains no
 *    critical signal is reported as LOW, not as a scam.
 */

type IndicatorId = "authority" | "urgency" | "credential" | "payment" | "reward" | "link" | "none";

interface Rule {
  id: string;
  weight: number;
  /** Minimum score when this rule fires. Present = critical rule: flags a message by itself. */
  floor?: number;
  pattern: string;
  indicator: IndicatorId;
  reason: string;
  terms?: string[];
  regexes?: RegExp[];
}

interface Hit {
  rule: Rule;
  matched: string;
}

/* ───────────────────────────── rules ───────────────────────────── */

// Credential-type nouns. Used by the request detector (needs a request verb nearby).
const CRED_NOUNS = [
  "otp",
  "one time password",
  "one-time password",
  "pin",
  "pin code",
  "atm pin",
  "cvv",
  "password",
  "passcode",
  "verification code",
  "security code",
  "code",
  "cnic",
  "card number",
  "account number",
  "atm card",
  "او ٹی پی",
  "پاس ورڈ",
  "پن",
  "کوڈ",
  "شناختی کارڈ",
];

// Verbs that mean "hand it over to me".
const STRONG_CUES = [
  "share",
  "send",
  "tell",
  "give",
  "provide",
  "reply",
  "forward",
  "dictate",
  "read out",
  "read it",
  "text me",
  "batao",
  "batayen",
  "bataen",
  "bata do",
  "bata dein",
  "bhejo",
  "bhejain",
  "bhejein",
  "bhej do",
  "bhej dein",
  "dein",
  "de dein",
  "de do",
  "شیئر",
  "بتائیں",
  "بتاؤ",
  "بتا",
  "بھیج",
  "دیں",
];
// Verbs that only count when the message is NOT a normal "your code is 123456" delivery,
// because genuine OTP texts say "enter this code to verify".
const WEAK_CUES = ["confirm", "enter", "verify", "submit", "update", "تصدیق", "درج"];

const CREDENTIAL_REQUEST: Rule = {
  id: "credential_request",
  weight: 34,
  floor: 85,
  pattern: "Credential / OTP Harvesting",
  indicator: "credential",
  reason: "asks you to hand over a one-time password, PIN or other private credential",
};

const BRANDED_LINK: Rule = {
  id: "branded_link",
  weight: 12,
  floor: 48,
  pattern: "Suspicious Link / Callback",
  indicator: "link",
  reason: "sends you to a link while posing as a bank, courier or other trusted service",
};

const RULES: Rule[] = [
  {
    id: "account_threat",
    weight: 30,
    floor: 62,
    pattern: "Account Suspension Threat",
    indicator: "urgency",
    reason: "threatens to block or close your account unless you act",
    regexes: [
      /\b(?:will|may|shall|going to|about to)\s+(?:be\s+)?(?:blocked|suspended|closed|deactivated|terminated|disconnected|frozen|barred|deleted)\b/,
      /\b(?:blocked|suspended|deactivated|frozen)\b[^.\n]{0,60}\b(?:restore|reactivate|re-activate|unblock|unlock|reopen)\b/,
      /\bband\s+hone\s+wal[aie]\b|\bband\s+ho\s+(?:jaye|jayega|jaega|jaiga|jae)\b|\bblock\s+ho\s+(?:jaye|jayega|jaega|jaiga|jae)\b|\bsuspend\s+ho\b/,
      /بند ہونے والا|بلاک ہو|معطل/,
    ],
  },
  {
    id: "fee_demand",
    weight: 30,
    floor: 70,
    pattern: "Advance Fee / Clearance Payment",
    indicator: "payment",
    reason: "demands an upfront fee before any service is delivered",
    terms: [
      "clearance fee",
      "customs duty",
      "customs charges",
      "processing fee",
      "re-delivery fee",
      "redelivery fee",
      "re delivery fee",
      "release fee",
      "fee pay",
      "fee jama",
      "fee bhejain",
      "fee bhejein",
    ],
  },
  {
    id: "prize_claim",
    weight: 30,
    floor: 62,
    pattern: "Prize / Lottery Bait",
    indicator: "reward",
    reason: "dangles a prize that the recipient never entered for",
    terms: [
      "you have won",
      "you've won",
      "you won",
      "lucky draw",
      "lottery",
      "congratulations you",
      "claim your prize",
      "claim the prize",
      "لاٹری",
      "قرعہ اندازی",
      "انعام جیت",
    ],
  },
  {
    id: "delivery_scam",
    weight: 26,
    floor: 62,
    pattern: "Fake Courier / Delivery Notice",
    indicator: "authority",
    reason: "invents a parcel problem to pull you into confirming details or paying",
    terms: [
      "delivery failed",
      "delivery attempt failed",
      "delivery unsuccessful",
      "deliver nahi",
      "deliver na ho",
      "delivery nahi",
      "delivery bachaane",
      "address mukammal nahi",
      "address update",
      "address darust",
      "address confirm",
      "confirm your address",
      "update your address",
      "held at customs",
      "parcel is held",
      "parcel on hold",
      "package on hold",
    ],
  },
  {
    id: "short_link",
    weight: 20,
    floor: 60,
    pattern: "Suspicious Link / Callback",
    indicator: "link",
    reason: "pushes you to open a shortened or click-bait link instead of the official app or website",
    terms: ["bit.ly", "tinyurl", "goo.gl", "cutt.ly", "is.gd", "rb.gy", "shorturl", "click here"],
  },
  {
    id: "authority",
    weight: 26,
    pattern: "Authority Impersonation",
    indicator: "authority",
    reason: "impersonates a bank, courier or official body",
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
    id: "delivery_generic",
    weight: 18,
    pattern: "Fake Courier / Delivery Notice",
    indicator: "authority",
    reason: "uses a courier or parcel pretext",
    terms: [
      "courier",
      "parcel",
      "your delivery",
      "tcs",
      "leopards",
      "pakistan post",
      "کوریئر",
      "پارسل",
      "ڈلیوری",
    ],
  },
  {
    id: "urgency",
    weight: 20,
    pattern: "Manufactured Urgency",
    indicator: "urgency",
    reason: "manufactures urgency so the recipient reacts before thinking",
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
      "ghante ke andar",
      "ghantay ke andar",
      "ghanty ke andar",
      "ghante mein",
      "within 24 hours",
      "within 2 hours",
      "within 1 hour",
      "within 12 hours",
      "warna",
      "otherwise your",
      "گھنٹے کے اندر",
      "گھنٹوں میں",
    ],
  },
  {
    id: "payment_generic",
    weight: 22,
    pattern: "Advance Fee / Clearance Payment",
    indicator: "payment",
    reason: "asks you to send money",
    terms: [
      "pay rs",
      "transfer rs",
      "send money",
      "delivery charges",
      "delivery fee",
      "paisay bhejain",
      "paisay bhejein",
      "pay karein",
      "pay karen",
      "pay kar do",
      "payment karein",
      "فیس",
      "رقم",
      "ادائیگی",
    ],
  },
  {
    id: "prize_generic",
    weight: 18,
    pattern: "Prize / Lottery Bait",
    indicator: "reward",
    reason: "dangles a prize or reward",
    terms: ["prize", "winner", "inaam", "mubarak ho", "انعام"],
  },
  {
    id: "link",
    weight: 12,
    pattern: "Suspicious Link / Callback",
    indicator: "link",
    reason: "contains a link or callback",
    terms: ["http://", "https://", "www.", "link par", "لنک"],
  },
  {
    id: "credential_mention",
    weight: 10,
    pattern: "Sensitive Credential Mentioned",
    indicator: "none",
    reason: "mentions a PIN, OTP or password",
    terms: [
      "otp",
      "one time password",
      "one-time password",
      "pin",
      "pin code",
      "atm pin",
      "cvv",
      "password",
      "passcode",
      "verification code",
      "security code",
      "cnic",
      "او ٹی پی",
      "پاس ورڈ",
      "کوڈ",
    ],
  },
];

export const INDICATOR_META: Record<string, { label: string; description: string }> = {
  authority: {
    label: "AUTHORITY IMPERSONATION",
    description: "Claims to represent a bank, courier or payment service.",
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

/* ─────────────────────── text helpers ─────────────────────── */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const termRegexCache = new Map<string, RegExp | null>();

/**
 * Latin terms match on word boundaries so "pin" never fires inside "shipping" or "opinion".
 * Terms of 4 chars or fewer must match whole words; longer ones may take a suffix (prize → prizes).
 * Anything else (Urdu script, URLs, dots) falls back to plain substring search.
 */
function termRegex(term: string): RegExp | null {
  const cached = termRegexCache.get(term);
  if (cached !== undefined) return cached;
  let re: RegExp | null = null;
  if (/^[a-z0-9][a-z0-9' \-]*$/.test(term)) {
    const body = escapeRe(term);
    re = new RegExp(term.length <= 4 ? `\\b${body}\\b` : `\\b${body}`);
  }
  termRegexCache.set(term, re);
  return re;
}

function indexOfTerm(haystack: string, term: string): number {
  const re = termRegex(term);
  if (re) {
    const m = re.exec(haystack);
    return m ? m.index : -1;
  }
  return haystack.indexOf(term);
}

const hasTerm = (haystack: string, terms: string[]) =>
  terms.find((t) => indexOfTerm(haystack, t) !== -1) ?? null;

const SENTENCE_SPLIT = /(?<=[.!?۔])\s+|\n+/;

// A sentence is "safety advice" when it NEGATES sharing/asking ("never share", "we will not ask").
const ADVICE_PATTERNS: RegExp[] = [
  /\b(?:never|not|don'?t|dont|won'?t|cannot|can'?t)\s+(?:\w+\s+){0,3}?(?:share|disclose|give|tell|reveal|provide|send|ask|request|call|demand|require|need)\b/,
  /\b(?:share|batain|batayen|bataen|bhejain|bhejein|bhejen|dein|den)\s+(?:na|mat)\b/,
  /\bkisi\s+(?:se|ko|ke\s+sath|ke\s+saath)\b[^.\n]*\b(?:na|mat)\b/,
  /\bkabhi\b[^.\n]*\b(?:nahi|nahin|na)\b/,
  /(?:نہ|مت|کبھی نہیں)[^۔.\n]*(?:شیئر|بتا|بھیج|دیں|مانگ)|(?:شیئر|بتا|بھیج|دیں|مانگ)[^۔.\n]*(?:نہ|مت)/,
];
// "never share it with anyone EXCEPT our agent" is a scam, not advice.
const ADVICE_EXCEPTION = /\b(?:except|unless|other than|apart from)\b|ماسوائے|سوائے/;

const isAdvice = (sentence: string) =>
  !ADVICE_EXCEPTION.test(sentence) && ADVICE_PATTERNS.some((p) => p.test(sentence));

function stripAdvice(text: string): string {
  return text
    .split(SENTENCE_SPLIT)
    .filter((s) => s && !isAdvice(s))
    .join(". ");
}

// "Your PIN is 964181", "123456 is your OTP", "Use this code to log in" (with a code present).
const DIGITS = /\b\d{4,8}\b/;
const OTP_DELIVERY: RegExp[] = [
  /\b(?:otp|pin|code|passcode|password|verification code|security code)\b[^\n.\d]{0,30}?\b\d{4,8}\b/,
  /\b\d{4,8}\b\s+(?:is|as)\s+(?:your|the)\b[^\n.]{0,40}\b(?:otp|pin|code|passcode|password)\b/,
  /\b(?:use|enter)\s+(?:this\s+)?(?:otp|pin|code|passcode)\b[^\n.]{0,50}?\b(?:to|for)\s+(?:log\s?in|login|sign\s?in|verify|register|complete|confirm|authori[sz]e)/,
  /\b(?:aap\s?ka|apka)\s+(?:otp|pin|code)\b[^\n.\d]{0,15}\d{4,8}/,
  /(?:کوڈ|او ٹی پی|پن|otp)[^\n.\d]{0,25}\d{4,8}/,
];

const isOtpDelivery = (lower: string) => DIGITS.test(lower) && OTP_DELIVERY.some((p) => p.test(lower));

const PRONOUN_REF = /\b(?:it|this|that|these|isay|ise|yeh|ye)\b/;

/** Credential noun + a "hand it over" verb in the same sentence. */
function findCredentialRequest(clean: string, delivery: boolean): string | null {
  const cues = delivery ? STRONG_CUES : [...STRONG_CUES, ...WEAK_CUES];
  for (const sentence of clean.split(SENTENCE_SPLIT)) {
    if (!sentence) continue;
    const noun = hasTerm(sentence, CRED_NOUNS);
    if (noun && hasTerm(sentence, cues)) return noun;
    // In a message that already contains a code, "share IT / this with our agent" refers to that code.
    if (delivery && PRONOUN_REF.test(sentence)) {
      const cue = hasTerm(sentence, STRONG_CUES);
      if (cue) return cue;
    }
  }
  return null;
}

function matchRule(rule: Rule, text: string): string | null {
  const term = rule.terms && hasTerm(text, rule.terms);
  if (term) return term;
  for (const re of rule.regexes ?? []) {
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}

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
  const idx = indexOfTerm(text.toLowerCase(), term);
  if (idx === -1) return null;
  const start = Math.max(0, text.lastIndexOf(" ", Math.max(0, idx - 22)));
  const rawEnd = idx + term.length + 34;
  const end = rawEnd >= text.length ? text.length : text.indexOf(" ", rawEnd);
  return text.slice(start, end === -1 ? text.length : end).trim();
}

/* ─────────────────────────── engine ─────────────────────────── */

/** Deterministic on-device heuristic engine — the offline fallback for the demo. */
export function mockAnalyze(
  message: string,
  language: Language,
  kind: InputKind = "sms",
): AnalysisResult {
  const lower = message.toLowerCase();
  const clean = stripAdvice(lower);
  const delivery = isOtpDelivery(lower);
  const noun = kind === "call" ? "call transcript" : "message";
  const hits: Hit[] = [];

  const credTerm = findCredentialRequest(clean, delivery);
  if (credTerm) hits.push({ rule: CREDENTIAL_REQUEST, matched: credTerm });

  for (const rule of RULES) {
    const matched = matchRule(rule, clean);
    if (matched) hits.push({ rule, matched });
  }

  // A trusted-brand pretext plus any link is suspicious even without other signals.
  const ids = new Set(hits.map((h) => h.rule.id));
  const brand = ["authority", "delivery_generic", "delivery_scam"].some((i) => ids.has(i));
  const linkHit = hits.find((h) => h.rule.id === "short_link" || h.rule.id === "link");
  if (brand && linkHit) hits.push({ rule: BRANDED_LINK, matched: linkHit.matched });

  // Genuine one-time-code delivery with nothing critical in it → not a scam.
  const SAFE_WITH_OTP = new Set(["authority", "urgency", "credential_mention", "delivery_generic"]);
  if (delivery && hits.every((h) => SAFE_WITH_OTP.has(h.rule.id))) {
    return {
      risk_score: 5,
      verdict: "Looks Like a Genuine OTP Message",
      matched_pattern: "Legitimate OTP / Verification Message",
      reasoning: `This ${noun} delivers a one-time code and warns you not to share it, and it does not ask you for anything, demand a payment or push a link. That is how genuine services send codes. It only becomes dangerous if someone asks you to read it out, forward it or type it into a link, so never give this code to anyone.`,
      flagged_phrase: "",
      risk_level: "LOW",
      indicators: ["authority", "urgency", "credential"].map((id) => ({
        id,
        label: INDICATOR_META[id]!.label,
        description: INDICATOR_META[id]!.description,
        present: false,
      })),
      language,
      source: "demo",
    };
  }

  const floor = Math.max(0, ...hits.map((h) => h.rule.floor ?? 0));
  const sum = hits.reduce((a, h) => a + h.rule.weight, 0);
  let score = Math.max(floor, sum);
  if (hits.filter((h) => h.rule.floor).length >= 2) score += 8;
  if (hits.length >= 3) score += 6;
  if (kind === "call" && credTerm) score += 6;
  score = Math.max(hits.length ? 22 : 6, Math.min(97, score));

  const level = levelFor(score);
  const primary = hits
    .slice()
    .sort(
      (a, b) =>
        (b.rule.floor ?? 0) - (a.rule.floor ?? 0) || b.rule.weight - a.rule.weight,
    )[0];
  const flagged = primary ? (findPhrase(message, primary.matched) ?? primary.matched) : "";

  const present = (id: string) => hits.some((h) => h.rule.indicator === id);
  const indicators: ThreatIndicator[] = ["authority", "urgency", "credential", "payment", "reward", "link"]
    .map((id) => ({
      id,
      label: INDICATOR_META[id]!.label,
      description: INDICATOR_META[id]!.description,
      present: present(id),
    }))
    .filter((i) => i.present || ["authority", "urgency", "credential"].includes(i.id));

  const reasonParts = [...new Set(hits.map((h) => h.rule.reason))];
  const reasoning = reasonParts.length
    ? `This ${noun} ${reasonParts.join(", ")}. Legitimate banks, wallets and couriers never ask customers to share an OTP, PIN, or password, and never ask for a fee by SMS link to release funds or parcels.`
    : `No known scam pattern matched this ${noun}. Stay cautious anyway: never share an OTP or PIN, even if the caller sounds official.`;

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
