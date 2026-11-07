import type { ReactNode } from "react";

export function Section({
  id, title, description, children,
}: { id?: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="container scroll-mt-24 py-12">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
