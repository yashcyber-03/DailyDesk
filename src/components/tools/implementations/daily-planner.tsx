"use client";

import { Check, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SyncBanner } from "@/components/tools/sync-banner";
import { ErrorMessage, Field } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/hooks/use-collection";
import { addDays, toISODate } from "@/lib/productivity/habits";
import { cleanTitle, sortPlanner } from "@/lib/productivity/lists";
import type { PlannerEntry } from "@/lib/repo/types";
import { cn } from "@/lib/utils";

export default function DailyPlanner() {
  const c = useCollection<PlannerEntry>("planner_entries");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTime, setDraftTime] = useState("");

  useEffect(() => setDate(toISODate(new Date())), []);

  const entries = useMemo(() => sortPlanner(c.items.filter((e) => e.plan_date === date)), [c.items, date]);
  const doneCount = entries.filter((e) => e.done).length;

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const t = cleanTitle(title, 300);
    if (!t.ok) return setFormError(t.error);
    if (!date) return;
    setFormError(null);
    if (await c.add({ plan_date: date, start_time: time || null, title: t.value, done: false })) {
      setTitle("");
      setTime("");
    }
  }

  async function saveEdit(entry: PlannerEntry) {
    const t = cleanTitle(draftTitle, 300);
    if (!t.ok) return setFormError(t.error);
    setFormError(null);
    if (await c.update(entry.id, { title: t.value, start_time: draftTime || null })) setEditing(null);
  }

  const label = date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SyncBanner />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Previous day" disabled={!date} onClick={() => setDate(addDays(date, -1))}><ChevronLeft className="h-4 w-4" /></Button>
        <label htmlFor="plan-date" className="sr-only">Date</label>
        <Input id="plan-date" type="date" className="w-44" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <Button variant="outline" size="icon" aria-label="Next day" disabled={!date} onClick={() => setDate(addDays(date, 1))}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="ghost" size="sm" onClick={() => setDate(toISODate(new Date()))}>Today</Button>
      </div>
      <h2 className="text-lg font-semibold tracking-tight" aria-live="polite">
        {label} {entries.length > 0 && <span className="text-sm font-normal text-muted-foreground">({doneCount} of {entries.length} done)</span>}
      </h2>

      <form onSubmit={onAdd} className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]">
        <Field label="Time (optional)" htmlFor="plan-time"><Input id="plan-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        <Field label="Plan" htmlFor="plan-title"><Input id="plan-title" placeholder="What is planned?" maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <div className="flex items-end"><Button type="submit" disabled={c.loading || !date}>Add</Button></div>
      </form>
      {formError && <ErrorMessage>{formError}</ErrorMessage>}
      {c.error && <ErrorMessage>{c.error}</ErrorMessage>}

      {c.loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing planned for this day yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 p-3">
              <input type="checkbox" checked={entry.done} aria-label={`Mark "${entry.title}" as ${entry.done ? "not done" : "done"}`}
                onChange={() => c.update(entry.id, { done: !entry.done })} className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
              {editing === entry.id ? (
                <>
                  <Input aria-label="Time" type="time" className="w-32" value={draftTime} onChange={(e) => setDraftTime(e.target.value)} />
                  <Input aria-label="Plan" autoFocus value={draftTitle} maxLength={300} onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void saveEdit(entry); if (e.key === "Escape") setEditing(null); }} />
                  <Button size="icon" variant="ghost" aria-label="Save" onClick={() => saveEdit(entry)}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <span className="w-14 shrink-0 text-sm tabular-nums text-muted-foreground">{entry.start_time ?? "Any time"}</span>
                  <p className={cn("min-w-0 flex-1 break-words text-sm", entry.done && "text-muted-foreground line-through")}>{entry.title}</p>
                  <Button size="icon" variant="ghost" aria-label={`Edit "${entry.title}"`} onClick={() => { setEditing(entry.id); setDraftTitle(entry.title); setDraftTime(entry.start_time ?? ""); setFormError(null); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label={`Delete "${entry.title}"`} onClick={() => c.remove(entry.id)}><Trash2 className="h-4 w-4" /></Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
