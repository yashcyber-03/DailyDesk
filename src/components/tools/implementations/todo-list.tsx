"use client";

import { Pencil, Trash2, X, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SyncBanner } from "@/components/tools/sync-banner";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/hooks/use-collection";
import { toISODate } from "@/lib/productivity/habits";
import { cleanTitle, filterTasks, type TaskFilter } from "@/lib/productivity/lists";
import type { Task } from "@/lib/repo/types";
import { cn } from "@/lib/utils";

const filters: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

export default function TodoList() {
  const c = useCollection<Task>("tasks");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const today = toISODate(new Date());
  const visible = filterTasks(c.items, filter);
  const left = c.items.filter((t) => !t.done).length;

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const t = cleanTitle(title, 500);
    if (!t.ok) return setFormError(t.error);
    setFormError(null);
    const created = await c.add({ title: t.value, done: false, due_date: due || null });
    if (created) {
      setTitle("");
      setDue("");
    }
  }

  async function saveEdit(task: Task) {
    const t = cleanTitle(draft, 500);
    if (!t.ok) return setFormError(t.error);
    setFormError(null);
    if (await c.update(task.id, { title: t.value })) setEditing(null);
  }

  async function clearDone() {
    for (const t of c.items.filter((x) => x.done)) await c.remove(t.id);
  }

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SyncBanner mode={c.mode} configured={c.configured} localCount={c.localCount} onImport={c.importLocal} />

      <form onSubmit={onAdd} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="todo-title" className="sr-only">New task</label>
        <Input id="todo-title" placeholder="What needs doing?" maxLength={500} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="todo-due" className="sr-only">Due date (optional)</label>
        <Input id="todo-due" type="date" className="sm:w-44" value={due} onChange={(e) => setDue(e.target.value)} />
        <Button type="submit" disabled={c.loading}>Add</Button>
      </form>
      {formError && <ErrorMessage>{formError}</ErrorMessage>}
      {c.error && <ErrorMessage>{c.error}</ErrorMessage>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Filter tasks">
          {filters.map((f) => (
            <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}
              className={cn("rounded-full border px-3 py-1 text-sm", filter === f.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">{left} {left === 1 ? "task" : "tasks"} left</p>
      </div>

      {c.loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.items.length === 0 ? "No tasks yet. Add your first one above." : "Nothing to show for this filter."}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {visible.map((task) => (
            <li key={task.id} className="flex items-center gap-3 p-3">
              <input type="checkbox" checked={task.done} aria-label={`Mark "${task.title}" as ${task.done ? "not done" : "done"}`}
                onChange={() => c.update(task.id, { done: !task.done })} className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
              {editing === task.id ? (
                <>
                  <Input aria-label="Edit task" autoFocus value={draft} maxLength={500} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void saveEdit(task); if (e.key === "Escape") setEditing(null); }} />
                  <Button size="icon" variant="ghost" aria-label="Save" onClick={() => saveEdit(task)}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className={cn("break-words text-sm", task.done && "text-muted-foreground line-through")}>{task.title}</p>
                    {task.due_date && (
                      <p className={cn("text-xs", !task.done && task.due_date < today ? "font-medium text-destructive" : "text-muted-foreground")}>
                        Due {task.due_date}{!task.done && task.due_date < today ? " (overdue)" : ""}
                      </p>
                    )}
                  </div>
                  <Button size="icon" variant="ghost" aria-label={`Edit "${task.title}"`} onClick={() => { setEditing(task.id); setDraft(task.title); setFormError(null); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label={`Delete "${task.title}"`} onClick={() => c.remove(task.id)}><Trash2 className="h-4 w-4" /></Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {c.items.some((t) => t.done) && <Button variant="outline" size="sm" onClick={clearDone}>Clear completed</Button>}
    </Card>
  );
}
