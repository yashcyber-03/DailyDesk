"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Field, NumberInput } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  clampMinutes, DEFAULT_POMODORO, formatClock, nextMode, parseSettings, remainingMs,
  type PomodoroMode, type PomodoroSettings,
} from "@/lib/productivity/pomodoro";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dailydesk:pomodoro";
const labels: Record<PomodoroMode, string> = { focus: "Focus", short: "Short break", long: "Long break" };

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.1;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => void ctx.close();
  } catch {
    // sound is optional
  }
}

function NumberSetting({ id, label, value, min, max, onCommit }: { id: string; label: string; value: number; min: number; max: number; onCommit: (n: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <Field label={label} htmlFor={id}>
      <NumberInput
        id={id}
        min={min}
        max={max}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n)) onCommit(n);
        }}
        onBlur={() => setText(String(value))}
      />
    </Field>
  );
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO);
  const [mode, setMode] = useState<PomodoroMode>("focus");
  const [remaining, setRemaining] = useState(DEFAULT_POMODORO.focus * 60_000);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [sound, setSound] = useState(true);
  const [announce, setAnnounce] = useState("");

  const endAt = useRef(0);
  const live = useRef({ mode, settings, completed, sound });
  live.current = { mode, settings, completed, sound };

  useEffect(() => {
    try {
      const s = parseSettings(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null"));
      setSettings(s);
      setRemaining(s.focus * 60_000);
    } catch {
      // keep defaults
    }
  }, []);

  const minutesFor = (m: PomodoroMode, s: PomodoroSettings) => (m === "focus" ? s.focus : m === "short" ? s.short : s.long);

  const finish = useCallback(() => {
    const { mode: m, settings: s, completed: done, sound: withSound } = live.current;
    const doneFocus = m === "focus" ? done + 1 : done;
    const next = nextMode(m, doneFocus, s.longEvery);
    if (withSound) beep();
    setRunning(false);
    setCompleted(doneFocus);
    setMode(next);
    setRemaining(minutesFor(next, s) * 60_000);
    setAnnounce(`${labels[m]} finished. Next: ${labels[next]}.`);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = remainingMs(endAt.current, Date.now());
      setRemaining(left);
      if (left <= 0) finish();
    }, 250);
    return () => window.clearInterval(id);
  }, [running, finish]);

  useEffect(() => {
    const original = document.title;
    if (running) document.title = `${formatClock(remaining)} - ${labels[mode]}`;
    return () => {
      document.title = original;
    };
  }, [running, remaining, mode]);

  function start() {
    setAnnounce("");
    endAt.current = Date.now() + remaining;
    setRunning(true);
  }
  function pause() {
    setRemaining(remainingMs(endAt.current, Date.now()));
    setRunning(false);
  }
  function selectMode(m: PomodoroMode) {
    setRunning(false);
    setMode(m);
    setRemaining(minutesFor(m, settings) * 60_000);
    setAnnounce("");
  }
  function reset() {
    setRunning(false);
    setRemaining(minutesFor(mode, settings) * 60_000);
  }
  function changeSetting(key: "focus" | "short" | "long" | "longEvery", value: string) {
    const n = Number(value);
    if (!Number.isFinite(n) || value === "") return;
    const next: PomodoroSettings = { ...settings, [key]: key === "longEvery" ? Math.min(10, Math.max(2, Math.round(n))) : clampMinutes(n) };
    setSettings(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    if (!running && key === mode) setRemaining(next[key] * 60_000);
  }

  const total = minutesFor(mode, settings) * 60_000;
  const pct = Math.round(((total - remaining) / total) * 100);

  return (
    <Card className="space-y-6 p-5 sm:p-8">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Timer mode">
        {(Object.keys(labels) as PomodoroMode[]).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => selectMode(m)}
            className={cn("rounded-full border px-4 py-1.5 text-sm", mode === m ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>
            {labels[m]}
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="font-mono text-7xl font-semibold tabular-nums tracking-tight" role="timer" aria-label={`${labels[mode]} time remaining`}>{formatClock(remaining)}</p>
        <div className="mx-auto mt-4 h-2 max-w-md overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Session progress">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Focus sessions completed: {completed}</p>
        <p className="sr-only" role="status" aria-live="polite">{announce}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {running ? (
          <Button size="lg" onClick={pause}><Pause className="h-5 w-5" /> Pause</Button>
        ) : (
          <Button size="lg" onClick={start} disabled={remaining <= 0}><Play className="h-5 w-5" /> {remaining < total ? "Resume" : "Start"}</Button>
        )}
        <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-5 w-5" /> Reset</Button>
        <Button size="lg" variant="ghost" onClick={finish}><SkipForward className="h-5 w-5" /> Skip</Button>
      </div>

      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer text-sm font-medium">Settings</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumberSetting id="pomo-focus" label="Focus (min)" min={1} max={120} value={settings.focus} onCommit={(n) => changeSetting("focus", String(n))} />
          <NumberSetting id="pomo-short" label="Short break (min)" min={1} max={120} value={settings.short} onCommit={(n) => changeSetting("short", String(n))} />
          <NumberSetting id="pomo-long" label="Long break (min)" min={1} max={120} value={settings.long} onCommit={(n) => changeSetting("long", String(n))} />
          <NumberSetting id="pomo-every" label="Long break every" min={2} max={10} value={settings.longEvery} onCommit={(n) => changeSetting("longEvery", String(n))} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          Play a sound when a session ends
        </label>
        <p className="mt-2 text-xs text-muted-foreground">Settings are saved in this browser.</p>
      </details>
    </Card>
  );
}
