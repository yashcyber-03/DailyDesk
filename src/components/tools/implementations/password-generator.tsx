"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DEFAULT_PASSWORD_OPTIONS, generatePassword, MAX_LENGTH, MIN_LENGTH, strength, validateOptions,
  type PasswordOptions,
} from "@/lib/productivity/password";

const toggles: { key: "lower" | "upper" | "digits" | "symbols" | "avoidAmbiguous"; label: string }[] = [
  { key: "lower", label: "Lowercase (a-z)" },
  { key: "upper", label: "Uppercase (A-Z)" },
  { key: "digits", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#...)" },
  { key: "avoidAmbiguous", label: "Avoid look-alike characters (0 O 1 l I)" },
];

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState("");
  const error = validateOptions(options);

  const generate = useCallback(() => {
    setPassword(validateOptions(options) ? "" : generatePassword(options));
  }, [options]);

  // Created in the browser after the page loads. Nothing is sent or stored anywhere.
  useEffect(() => generate(), [generate]);

  const s = strength(options);

  return (
    <Card className="space-y-6 p-5 sm:p-6">
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="min-h-8 break-all font-mono text-xl" aria-live="polite" data-testid="generated-password">{password || "-"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={password} label="Copy password" />
          <Button variant="outline" size="sm" onClick={generate} disabled={!!error}><RefreshCw className="h-4 w-4" /> Generate another</Button>
          {!error && <span className="ml-auto text-sm text-muted-foreground">{s.label} (about {s.bits} bits)</span>}
        </div>
      </div>

      <Field label={`Length: ${options.length}`} htmlFor="pw-length">
        <input id="pw-length" type="range" min={MIN_LENGTH} max={MAX_LENGTH} value={options.length}
          onChange={(e) => setOptions((o) => ({ ...o, length: Number(e.target.value) }))} className="w-full accent-[hsl(var(--primary))]" />
      </Field>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Character types</legend>
        {toggles.map((t) => (
          <label key={t.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={options[t.key]} onChange={(e) => setOptions((o) => ({ ...o, [t.key]: e.target.checked }))} className="h-4 w-4 accent-[hsl(var(--primary))]" />
            {t.label}
          </label>
        ))}
      </fieldset>
      {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Passwords are generated in your browser with your device&rsquo;s secure random number generator. They are never sent to DailyDesk or saved. Use a different password for every account, ideally with a password manager.</p>
    </Card>
  );
}
