import type { InputHTMLAttributes, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ToolPanel({ children }: { children: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="grid gap-8 lg:grid-cols-2">{children}</div>
    </Card>
  );
}

export function Field({
  label, htmlFor, hint, children,
}: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="number" inputMode="decimal" step="any" {...props} />;
}

export function Segmented<T extends string>({
  label, value, onChange, options,
}: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap rounded-lg border bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            o.value === value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ResultPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-5" aria-live="polite">
      {children}
    </div>
  );
}

export function EmptyResult() {
  return <p className="text-sm text-muted-foreground">Enter the values to see your result here.</p>;
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return <p role="alert" className="text-sm font-medium text-destructive">{children}</p>;
}

export function BigResult({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-3xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function ResultRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="mt-5 divide-y text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">{r.label}</dt>
          <dd className="text-right font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
