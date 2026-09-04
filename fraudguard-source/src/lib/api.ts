import { analyzeMessageFn } from "./analyze.functions";
import { mockAnalyze } from "./mockDetection";
import type { AnalysisResult, InputKind, Language } from "./types";

/**
 * Single entry point for fraud analysis.
 * Tries the server-backed detection API first; falls back to the deterministic
 * on-device engine so the demo always works offline (flagged as "Demo Analysis").
 */
export async function analyzeMessage(
  message: string,
  language: Language,
  kind: InputKind = "sms",
): Promise<AnalysisResult> {
  try {
    const { result } = await analyzeMessageFn({ data: { message, language, kind } });
    if (result) return result;
  } catch {
    // network/server unavailable — fall through to the offline engine
  }
  return mockAnalyze(message, language, kind);
}
