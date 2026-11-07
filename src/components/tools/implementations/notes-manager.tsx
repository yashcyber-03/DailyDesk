"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SyncBanner } from "@/components/tools/sync-banner";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCollection } from "@/hooks/use-collection";
import type { Note } from "@/lib/repo/types";
import { cn } from "@/lib/utils";

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;

export default function NotesManager() {
  const c = useCollection<Note>("notes");
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => (q ? c.items.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : c.items),
    [c.items, q],
  );

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");

  function open(note: Note) {
    if (!confirmDiscard()) return;
    setSelected(note.id);
    setTitle(note.title);
    setContent(note.content);
    setDirty(false);
    setStatus(null);
    setLocalError(null);
  }

  function startNew() {
    if (!confirmDiscard()) return;
    setSelected("new");
    setTitle("");
    setContent("");
    setDirty(false);
    setStatus(null);
    setLocalError(null);
  }

  async function save() {
    if (title.length > MAX_TITLE) return setLocalError(`Keep the title under ${MAX_TITLE} characters.`);
    if (content.length > MAX_CONTENT) return setLocalError(`Keep the note under ${MAX_CONTENT.toLocaleString("en-US")} characters.`);
    if (!title.trim() && !content.trim()) return setLocalError("Write something first.");
    setLocalError(null);
    const saved = selected === "new" ? await c.add({ title: title.trim(), content }) : selected ? await c.update(selected, { title: title.trim(), content }) : null;
    if (saved) {
      setSelected(saved.id);
      setDirty(false);
      setStatus("Saved");
    }
  }

  async function del() {
    if (!selected || selected === "new") return;
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    if (await c.remove(selected)) {
      setSelected(null);
      setTitle("");
      setContent("");
      setDirty(false);
      setStatus(null);
    }
  }

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <SyncBanner />
      {c.error && <ErrorMessage>{c.error}</ErrorMessage>}
      <div className="grid gap-5 md:grid-cols-[16rem_1fr]">
        <div className="space-y-3">
          <Button className="w-full" onClick={startNew}><Plus className="h-4 w-4" /> New note</Button>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" aria-label="Search notes" placeholder="Search notes..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {c.loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">{c.items.length === 0 ? "No notes yet." : "No notes match your search."}</p>
          ) : (
            <ul className="max-h-96 divide-y overflow-y-auto rounded-lg border">
              {shown.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => open(n)} aria-current={selected === n.id}
                    className={cn("w-full p-3 text-left text-sm hover:bg-accent", selected === n.id && "bg-accent")}>
                    <span className="block truncate font-medium">{n.title || "Untitled note"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{n.content.slice(0, 60) || "No text"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          {selected === null ? (
            <p className="text-sm text-muted-foreground">Select a note or create a new one.</p>
          ) : (
            <>
              <label htmlFor="note-title" className="sr-only">Title</label>
              <Input id="note-title" placeholder="Title" maxLength={MAX_TITLE} value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); setStatus(null); }} />
              <label htmlFor="note-content" className="sr-only">Note</label>
              <textarea id="note-content" rows={14} placeholder="Write your note..." value={content} maxLength={MAX_CONTENT}
                onChange={(e) => { setContent(e.target.value); setDirty(true); setStatus(null); }}
                className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={save} disabled={!dirty && selected !== "new"}>Save</Button>
                {selected !== "new" && <Button variant="outline" onClick={del}><Trash2 className="h-4 w-4" /> Delete</Button>}
                <span className="text-xs text-muted-foreground" aria-live="polite">
                  {dirty ? "Unsaved changes" : status ?? ""} {content.length.toLocaleString("en-US")} / {MAX_CONTENT.toLocaleString("en-US")}
                </span>
              </div>
              {localError && <ErrorMessage>{localError}</ErrorMessage>}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
