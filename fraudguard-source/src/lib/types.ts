export type Language = "english" | "urdu" | "roman-urdu";
export type InputKind = "sms" | "call";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ThreatIndicator {
  id: string;
  label: string;
  description: string;
  present: boolean;
}

export interface AnalysisResult {
  risk_score: number;
  verdict: string;
  matched_pattern: string;
  reasoning: string;
  flagged_phrase: string;
  risk_level: RiskLevel;
  indicators: ThreatIndicator[];
  language: Language;
  source: "api" | "demo";
}
