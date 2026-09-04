import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnalysisResultCard } from "./AnalysisResult";
import { analyzeMessage } from "@/lib/api";
import { recordAnalysis } from "@/lib/analysisLog";
import type { AnalysisResult, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

// The Web Speech API isn't in TypeScript's DOM lib yet (only its result/alternative
// sub-types are), so we declare the small surface we actually use rather than `any`.
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const LANG_OPTIONS: { value: Language; label: string; bcp47: string }[] = [
  { value: "english", label: "English", bcp47: "en-US" },
  { value: "urdu", label: "Urdu", bcp47: "ur-PK" },
];

// How long to wait after the speaker pauses before we send the transcript for scoring.
const SILENCE_ANALYZE_DELAY = 1600;

export function LiveVoiceScan() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState<Language>("english");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const listeningRef = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAnalyzed = useRef("");
  const lastLevel = useRef<AnalysisResult["risk_level"] | null>(null);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setSupported(Boolean(Ctor));
  }, []);

  const scheduleAnalysis = useCallback(
    (transcript: string) => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(async () => {
        const trimmed = transcript.trim();
        if (!trimmed || trimmed === lastAnalyzed.current) return;
        lastAnalyzed.current = trimmed;
        setAnalyzing(true);
        const analysis = await analyzeMessage(trimmed, language, "call");
        setAnalyzing(false);
        setResult(analysis);
        recordAnalysis({
          risk_level: analysis.risk_level,
          matched_pattern: analysis.matched_pattern,
          language,
        });
        if (analysis.risk_level !== lastLevel.current && analysis.risk_score >= 60) {
          toast.warning("Threat detected in live call", {
            description: `${analysis.verdict} — risk ${analysis.risk_score}/100`,
          });
        }
        lastLevel.current = analysis.risk_level;
      }, SILENCE_ANALYZE_DELAY);
    },
    [language],
  );

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setMicError(null);
    setFinalTranscript("");
    setInterimTranscript("");
    setResult(null);
    lastAnalyzed.current = "";
    lastLevel.current = null;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG_OPTIONS.find((l) => l.value === language)?.bcp47 ?? "en-US";

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res) continue;
        const alt = res[0];
        if (!alt) continue;
        if (res.isFinal) final += `${alt.transcript} `;
        else interim += alt.transcript;
      }
      if (final) {
        setFinalTranscript((prev) => {
          const next = `${prev} ${final}`.trim();
          scheduleAnalysis(next);
          return next;
        });
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone access was blocked. Allow mic permissions and try again.");
      } else if (event.error === "no-speech") {
        // benign — keep listening
      } else {
        setMicError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Chrome auto-ends after a long pause even in continuous mode; restart
      // transparently unless the user explicitly stopped.
      if (listeningRef.current) recognition.start();
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    recognition.start();
  }, [language, scheduleAnalysis]);

  useEffect(() => () => void stopListening(), [stopListening]);

  if (!supported) {
    return (
      <GlassCard className="flex flex-col items-center gap-3 p-8 text-center">
        <AlertCircle className="size-8 text-warning" aria-hidden="true" />
        <p className="text-lg font-bold tracking-tight">Live voice isn't supported here</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This browser doesn't support the Web Speech API. Open this page in a recent version of
          Chrome or Edge for the live voice demo, or use the paste-a-transcript scanner instead.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
      {/* MIC + TRANSCRIPT */}
      <GlassCard glow className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-full border border-border bg-background/50 p-1"
            role="tablist"
            aria-label="Recognition language"
          >
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.value}
                role="tab"
                aria-selected={language === l.value}
                disabled={listening}
                onClick={() => setLanguage(l.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                  language === l.value
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          <MagneticButton
            size="md"
            variant={listening ? "danger" : "primary"}
            magnetic={false}
            onClick={listening ? stopListening : startListening}
          >
            {listening ? (
              <>
                <MicOff className="size-4" aria-hidden="true" /> Stop Call
              </>
            ) : (
              <>
                <Mic className="size-4" aria-hidden="true" /> Start Live Call
              </>
            )}
          </MagneticButton>
        </div>

        <div className="mt-5 flex items-center justify-center py-4">
          <div className="relative grid size-20 place-items-center">
            {listening && (
              <span className="absolute size-20 animate-ping rounded-full bg-primary/25" />
            )}
            <span
              className={cn(
                "grid size-16 place-items-center rounded-full border transition-colors",
                listening
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground",
              )}
            >
              {listening ? (
                <Mic className="size-6" aria-hidden="true" />
              ) : (
                <MicOff className="size-6" aria-hidden="true" />
              )}
            </span>
          </div>
        </div>

        {micError && (
          <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-center text-xs text-destructive">
            {micError}
          </p>
        )}

        <div
          className="min-h-32 rounded-xl border border-border bg-background/60 p-4 text-sm leading-relaxed"
          aria-live="polite"
        >
          {!finalTranscript && !interimTranscript ? (
            <p className="text-muted-foreground">
              {listening
                ? "Listening… start speaking and the transcript will appear here."
                : "Press \u201cStart Live Call\u201d and speak — FraudGuard scores the call as it happens."}
            </p>
          ) : (
            <p>
              <span>{finalTranscript}</span>{" "}
              <span className="text-muted-foreground">{interimTranscript}</span>
            </p>
          )}
        </div>

        {analyzing && (
          <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Analyzing pause in speech…
          </p>
        )}
      </GlassCard>

      {/* RESULT */}
      <GlassCard className="relative min-h-[420px] p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {result && <AnalysisResultCard key="result" result={result} />}
          {!result && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[380px] flex-col items-center justify-center text-center"
            >
              <Mic className="size-9 text-primary" aria-hidden="true" />
              <p className="mt-5 text-lg font-bold tracking-tight">Call analysis will appear here</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                FraudGuard re-scores the conversation each time the speaker pauses, just like it
                would during a real scam call.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}