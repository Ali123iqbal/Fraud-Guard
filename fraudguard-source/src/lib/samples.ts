import type { InputKind, Language } from "./types";

export interface SampleScam {
  id: string;
  title: string;
  category: string;
  language: Language;
  kind: InputKind;
  text: string;
}

export const SAMPLES: SampleScam[] = [
  {
    id: "bank-otp",
    title: "Bank OTP Scam",
    category: "Bank impersonation",
    language: "english",
    kind: "sms",
    text: "Dear customer, your bank account will be blocked within 30 minutes due to a security check. Share the OTP to verify your account immediately.",
  },
  {
    id: "courier",
    title: "Courier Clearance Scam",
    category: "Advance fee",
    language: "english",
    kind: "sms",
    text: "Your parcel is held at customs. Pay a clearance fee of Rs 1,750 immediately or the shipment will be returned. Click here: http://bit.ly/parcel-clear",
  },
  {
    id: "jazzcash",
    title: "JazzCash Impersonation",
    category: "Wallet impersonation",
    language: "english",
    kind: "call",
    text: "Assalam o alaikum, I am calling from JazzCash customer care. Your account requires verification urgently. Please tell me the verification code you just received, otherwise your wallet will be closed today.",
  },
  {
    id: "easypaisa",
    title: "Easypaisa Impersonation",
    category: "Wallet impersonation",
    language: "english",
    kind: "sms",
    text: "Easypaisa alert: your account is temporarily suspended. To restore it right now, reply with your CNIC and the 6 digit one time password sent to this number.",
  },
  {
    id: "lottery",
    title: "Lottery Scam",
    category: "Prize bait",
    language: "english",
    kind: "sms",
    text: "Congratulations! You have won Rs 25,00,000 in the lucky draw. To claim the prize, send a processing fee of Rs 5,000 and share your OTP with the agent.",
  },
  {
    id: "roman-urdu",
    title: "Roman Urdu Scam",
    category: "Roman Urdu",
    language: "roman-urdu",
    kind: "sms",
    text: "Apka bank account band hone wala hai, foran OTP share karein warna account block ho jaye ga. Helpline se call aye gi.",
  },
  {
    id: "urdu",
    title: "Urdu Bank Scam",
    category: "Urdu",
    language: "urdu",
    kind: "sms",
    text: "آپ کا بینک اکاؤنٹ بند ہونے والا ہے، فوری طور پر OTP شیئر کریں۔",
  },
  {
    id: "safe",
    title: "Legitimate Message",
    category: "Safe control",
    language: "english",
    kind: "sms",
    text: "Your order #48213 has shipped and will arrive Tuesday. Track it in the app. We will never ask you for a code or payment over SMS.",
  },
];

export const LANGUAGE_EXAMPLES = [
  {
    language: "english" as Language,
    label: "English",
    text: "Your bank account will be blocked. Share your OTP immediately.",
    dir: "ltr" as const,
  },
  {
    language: "urdu" as Language,
    label: "اردو",
    text: "آپ کا بینک اکاؤنٹ بند ہونے والا ہے، فوری طور پر OTP شیئر کریں۔",
    dir: "rtl" as const,
  },
  {
    language: "roman-urdu" as Language,
    label: "Roman Urdu",
    text: "Apka bank account band hone wala hai, foran OTP share karein.",
    dir: "ltr" as const,
  },
];
