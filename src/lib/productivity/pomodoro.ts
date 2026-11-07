export type PomodoroMode = "focus" | "short" | "long";
export interface PomodoroSettings {
  focus: number;
  short: number;
  long: number;
  longEvery: number;
}
export const DEFAULT_POMODORO: PomodoroSettings = { focus: 25, short: 5, long: 15, longEvery: 4 };

export const clampMinutes = (n: number) => Math.min(120, Math.max(1, Math.round(n)));

export function remainingMs(endAt: number, now: number): number {
  return Math.max(0, endAt - now);
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** After a finished session: which mode comes next. `completedFocus` includes the one just finished. */
export function nextMode(mode: PomodoroMode, completedFocus: number, longEvery: number): PomodoroMode {
  if (mode !== "focus") return "focus";
  return completedFocus > 0 && completedFocus % longEvery === 0 ? "long" : "short";
}

export function parseSettings(raw: unknown): PomodoroSettings {
  if (typeof raw !== "object" || raw === null) return DEFAULT_POMODORO;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? clampMinutes(v) : fallback);
  return {
    focus: num(r.focus, DEFAULT_POMODORO.focus),
    short: num(r.short, DEFAULT_POMODORO.short),
    long: num(r.long, DEFAULT_POMODORO.long),
    longEvery: typeof r.longEvery === "number" && r.longEvery >= 2 && r.longEvery <= 10 ? Math.round(r.longEvery) : DEFAULT_POMODORO.longEvery,
  };
}
