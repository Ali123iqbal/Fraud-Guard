import type { AnalysisResult, Language } from "./types";

export interface LoggedAnalysis {
  risk_level: AnalysisResult["risk_level"];
  matched_pattern: string;
  language: Language;
  at: number;
}

type Listener = () => void;

const STORAGE_KEY = "fraudguard:analysis-log";
const MAX_ENTRIES = 200;

let log: LoggedAnalysis[] = [];
const listeners = new Set<Listener>();

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    log = raw ? (JSON.parse(raw) as LoggedAnalysis[]) : [];
  } catch {
    log = [];
  }
}
load();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX_ENTRIES)));
  } catch {
    // ignore storage quota/availability errors — in-memory log still works for this session
  }
}

/** Called by the scanner UIs whenever an analysis completes. */
export function recordAnalysis(entry: Omit<LoggedAnalysis, "at">) {
  log.push({ ...entry, at: Date.now() });
  if (log.length > MAX_ENTRIES) log = log.slice(-MAX_ENTRIES);
  persist();
  listeners.forEach((l) => l());
}

export function getAnalysisLog(): LoggedAnalysis[] {
  return log;
}

export function subscribeAnalysisLog(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearAnalysisLog() {
  log = [];
  persist();
  listeners.forEach((l) => l());
}