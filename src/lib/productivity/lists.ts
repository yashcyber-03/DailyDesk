export type TaskFilter = "all" | "active" | "done";

export function filterTasks<T extends { done: boolean }>(tasks: T[], filter: TaskFilter): T[] {
  return filter === "all" ? tasks : tasks.filter((t) => (filter === "done" ? t.done : !t.done));
}

/** Entries with a time first (earliest first), then entries without a time, keeping their order. */
export function sortPlanner<T extends { start_time: string | null }>(entries: T[]): T[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      if (a.e.start_time && b.e.start_time) return a.e.start_time < b.e.start_time ? -1 : a.e.start_time > b.e.start_time ? 1 : a.i - b.i;
      if (a.e.start_time) return -1;
      if (b.e.start_time) return 1;
      return a.i - b.i;
    })
    .map((x) => x.e);
}

export function cleanTitle(value: string, max: number): { ok: true; value: string } | { ok: false; error: string } {
  const v = value.replace(/\s+/g, " ").trim();
  if (!v) return { ok: false, error: "Please enter some text." };
  if (v.length > max) return { ok: false, error: `Please keep it under ${max} characters.` };
  return { ok: true, value: v };
}
