"use client";

import { Check, Flame, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { SyncBanner } from "@/components/tools/sync-banner";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/hooks/use-collection";
import { bestStreak, currentStreak, lastNDays, toggleDate, toISODate } from "@/lib/productivity/habits";
import { cleanTitle } from "@/lib/productivity/lists";
import type { Habit } from "@/lib/repo/types";
import { cn } from "@/lib/utils";

export default function HabitTracker() {
  const c = useCollection<Habit>("habits");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const today = useMemo(() => toISODate(new Date()), []);
  const days = useMemo(() => lastNDays(7, today), [today]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const t = cleanTitle(name, 100);
    if (!t.ok) return setFormError(t.error);
    setFormError(null);
    if (await c.add({ name: t.value, completed_dates: [] })) setName("");
  }

  async function saveEdit(h: Habit) {
    const t = cleanTitle(draft, 100);
    if (!t.ok) return setFormError(t.error);
    setFormError(null);
    if (await c.update(h.id, { name: t.value })) setEditing(null);
  }

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SyncBanner mode={c.mode} configured={c.configured} localCount={c.localCount} onImport={c.importLocal} />
      <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="habit-name" className="sr-only">New habit</label>
        <Input id="habit-name" placeholder="New habit, for example: Read 20 minutes" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" disabled={c.loading}>Add habit</Button>
      </form>
      {formError && <ErrorMessage>{formError}</ErrorMessage>}
      {c.error && <ErrorMessage>{c.error}</ErrorMessage>}

      {c.loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : c.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No habits yet. Add one above and tick off each day you do it.</p>
      ) : (
        <ul className="space-y-4">
          {c.items.map((h) => (
            <li key={h.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                {editing === h.id ? (
                  <>
                    <Input aria-label="Habit name" autoFocus value={draft} maxLength={100} onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") void saveEdit(h); if (e.key === "Escape") setEditing(null); }} />
                    <Button size="icon" variant="ghost" aria-label="Save" onClick={() => saveEdit(h)}><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <>
                    <h3 className="min-w-0 flex-1 break-words font-medium">{h.name}</h3>
                    <Button size="icon" variant="ghost" aria-label={`Rename "${h.name}"`} onClick={() => { setEditing(h.id); setDraft(h.name); setFormError(null); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete "${h.name}"`} onClick={() => { if (window.confirm(`Delete "${h.name}" and its history?`)) void c.remove(h.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Last 7 days for ${h.name}`}>
                {days.map((d) => {
                  const done = h.completed_dates.includes(d);
                  const date = new Date(`${d}T00:00:00`);
                  return (
                    <button key={d} type="button" aria-pressed={done}
                      aria-label={`${date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}: ${done ? "done" : "not done"}`}
                      onClick={() => c.update(h.id, { completed_dates: toggleDate(h.completed_dates, d) })}
                      className={cn("flex h-14 w-12 flex-col items-center justify-center rounded-lg border text-xs transition-colors",
                        done ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent", d === today && !done && "border-primary")}>
                      <span>{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <span className="text-sm font-medium">{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-primary" aria-hidden="true" /> Current streak: <strong className="text-foreground">{currentStreak(h.completed_dates, today)}</strong></span>
                <span>Best: <strong className="text-foreground">{bestStreak(h.completed_dates)}</strong></span>
                <span>Total days: <strong className="text-foreground">{h.completed_dates.length}</strong></span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
