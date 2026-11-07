"use client";

import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { Field, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { generatePalette, harmonies, hslToHex, normalizeHex, readableTextColor, type Harmony } from "@/lib/color";

export default function ColorPaletteGenerator() {
  const [base, setBase] = useState("#4f46e5");
  const [hexInput, setHexInput] = useState("#4f46e5");
  const [harmony, setHarmony] = useState<Harmony>("analogous");
  const [copied, setCopied] = useState<string | null>(null);

  const palette = useMemo(() => generatePalette(base, harmony), [base, harmony]);
  const invalid = normalizeHex(hexInput) === null;
  const css = palette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n");

  function setColor(value: string) {
    setHexInput(value);
    const n = normalizeHex(value);
    if (n) setBase(n);
  }

  function randomize() {
    const hex = hslToHex(Math.random() * 360, 55 + Math.random() * 30, 42 + Math.random() * 18);
    setHexInput(hex);
    setBase(hex);
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Base colour" htmlFor="pal-hex" hint="Pick a colour or type a hex code such as #4f46e5.">
          <div className="flex gap-3">
            <input type="color" aria-label="Pick base colour" value={base} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 shrink-0 cursor-pointer rounded-md border bg-background p-1" />
            <Input id="pal-hex" value={hexInput} onChange={(e) => setColor(e.target.value)} aria-invalid={invalid} spellCheck={false} />
          </div>
          {invalid && <p role="alert" className="text-xs text-destructive">Enter a valid hex colour. Showing the last valid one.</p>}
        </Field>
        <Field label="Colour scheme" htmlFor="pal-harmony">
          <Select id="pal-harmony" value={harmony} onChange={(e) => setHarmony(e.target.value as Harmony)}>
            {harmonies.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </Select>
        </Field>
        <Button variant="outline" onClick={randomize}><Shuffle className="h-4 w-4" /> Random base colour</Button>
      </div>
      <div className="space-y-4">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Generated palette">
          {palette.map((hex) => (
            <li key={hex}>
              <button
                type="button"
                onClick={() => copy(hex)}
                aria-label={`Copy ${hex}`}
                className="flex h-24 w-full items-end rounded-lg border p-2 text-sm font-medium"
                style={{ backgroundColor: hex, color: readableTextColor(hex) }}
              >
                {copied === hex ? "Copied" : hex}
              </button>
            </li>
          ))}
        </ul>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-medium">CSS variables</p>
            <Button variant="ghost" size="sm" onClick={() => copy(css)}>{copied === css ? "Copied" : "Copy"}</Button>
          </div>
          <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">{css}</pre>
        </div>
      </div>
    </ToolPanel>
  );
}
