import type { ReactNode } from "react";
import { parseMarkdown, type Inline } from "@/lib/markdown";

function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((it, i) => {
        switch (it.type) {
          case "bold":
            return <strong key={i}>{it.text}</strong>;
          case "italic":
            return <em key={i}>{it.text}</em>;
          case "code":
            return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{it.text}</code>;
          case "br":
            return <br key={i} />;
          default:
            return <span key={i}>{it.text}</span>;
        }
      })}
    </>
  );
}

/** Renders a safe Markdown subset as React elements (no raw HTML is ever inserted). */
export function Markdown({ text }: { text: string }) {
  const blocks = parseMarkdown(text);
  const nodes: ReactNode[] = blocks.map((b, i) => {
    switch (b.type) {
      case "h":
        return (
          <p key={i} className={b.level === 1 ? "text-lg font-semibold" : "font-semibold"}>
            <Inlines items={b.inlines} />
          </p>
        );
      case "ul":
        return (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.items.map((item, j) => <li key={j}><Inlines items={item} /></li>)}
          </ul>
        );
      case "ol":
        return (
          <ol key={i} className="list-decimal space-y-1 pl-5">
            {b.items.map((item, j) => <li key={j}><Inlines items={item} /></li>)}
          </ol>
        );
      case "code":
        return <pre key={i} className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs"><code>{b.text}</code></pre>;
      default:
        return <p key={i}><Inlines items={b.inlines} /></p>;
    }
  });
  return <div className="space-y-3 break-words text-sm leading-relaxed">{nodes}</div>;
}
