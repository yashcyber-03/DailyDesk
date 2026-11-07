import { LEGAL_UPDATED, type LegalSection } from "@/content/legal";

export function LegalPage({ title, summary, sections }: { title: string; summary: string; sections: LegalSection[] }) {
  return (
    <article className="container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LEGAL_UPDATED}</p>
      <p className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm">{summary}</p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-8" aria-labelledby={s.heading.replace(/\W+/g, "-").toLowerCase()}>
          <h2 id={s.heading.replace(/\W+/g, "-").toLowerCase()} className="text-lg font-semibold tracking-tight">{s.heading}</h2>
          {s.paragraphs?.map((p) => <p key={p} className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>)}
          {s.items && (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {s.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
