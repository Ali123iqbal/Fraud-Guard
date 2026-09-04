import type { AnalysisResult, InputKind, Language } from "./types";
import { mockAnalyze, INDICATOR_META } from "./mockDetection";

/**
 * Calls an external detection backend when configured. Credentials live only in
 * server-side environment variables and are never shipped to the browser.
 * Returns null when no backend is configured or the call fails, so the caller
 * can degrade to the on-device demo engine.
 */
export async function callDetectionBackend(
  message: string,
  language: Language,
  kind: InputKind,
): Promise<AnalysisResult | null> {
  const endpoint = process.env["FRAUDGUARD_API_URL"];
  const apiKey = process.env["FRAUDGUARD_API_KEY"];
  if (!endpoint) return null;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ message, language, kind }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Partial<AnalysisResult>;
    if (typeof data.risk_score !== "number") return null;

    const baseline = mockAnalyze(message, language, kind);
    const score = Math.max(0, Math.min(100, Math.round(data.risk_score)));

    return {
      risk_score: score,
      verdict: data.verdict ?? baseline.verdict,
      matched_pattern: data.matched_pattern ?? baseline.matched_pattern,
      reasoning: data.reasoning ?? baseline.reasoning,
      flagged_phrase: data.flagged_phrase ?? baseline.flagged_phrase,
      risk_level:
        data.risk_level ??
        (score >= 85 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 32 ? "MEDIUM" : "LOW"),
      indicators:
        data.indicators?.map((i) => ({
          ...i,
          label: i.label ?? INDICATOR_META[i.id]?.label ?? i.id,
        })) ?? baseline.indicators,
      language,
      source: "api",
    };
  } catch {
    return null;
  }
}
