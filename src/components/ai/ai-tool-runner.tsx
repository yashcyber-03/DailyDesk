"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ai/copy-button";
import { Markdown } from "@/components/ai/markdown";
import { Thinking } from "@/components/ai/thinking";
import { ErrorMessage, Field, ResultPanel, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { AI_LIMITS, aiToolConfigs, type AiToolSlug } from "@/config/ai";
import { postAi } from "@/lib/ai/client";

type Status = "idle" | "loading" | "done" | "error";

export function AiToolRunner({ slug }: { slug: AiToolSlug }) {
  const config = aiToolConfigs[slug];
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.options.map((o) => [o.id, o.default])),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ text: string; truncated: boolean } | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function run() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");
    setError(null);
    const res = await postAi("/api/ai/tool", { tool: slug, input, options }, controller.signal);
    if (controller.signal.aborted) return;
    if (res.ok) {
      setResult({ text: res.text, truncated: res.truncated });
      setStatus("done");
    } else {
      setError({ code: res.code, message: res.message });
      setStatus("error");
    }
  }

  function clear() {
    abortRef.current?.abort();
    setInput("");
    setResult(null);
    setError(null);
    setStatus("idle");
  }

  const max = AI_LIMITS.maxInputChars;
  const tooLong = input.length > max;
  const canRun = input.trim().length > 0 && !tooLong && status !== "loading";

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label={config.inputLabel} htmlFor={`ai-input-${slug}`}>
          <textarea
            id={`ai-input-${slug}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            maxLength={max}
            placeholder={config.placeholder}
            className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
          <p className={`text-right text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>
            {input.length.toLocaleString("en-US")} / {max.toLocaleString("en-US")}
          </p>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {config.options.map((o) => (
            <Field key={o.id} label={o.label} htmlFor={`ai-${slug}-${o.id}`}>
              <Select id={`ai-${slug}-${o.id}`} value={options[o.id]} onChange={(e) => setOptions((p) => ({ ...p, [o.id]: e.target.value }))}>
                {o.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!canRun} onClick={run}>{status === "loading" ? "Working..." : config.submitLabel}</Button>
          <Button variant="ghost" onClick={clear} disabled={!input && !result && !error}>Clear</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          The text you enter is sent to Google&rsquo;s Gemini API to create the result. Please do not paste passwords or other sensitive information.
        </p>
      </div>

      <ResultPanel>
        <h2 className="mb-3 text-sm font-medium">{config.resultLabel}</h2>
        {status === "idle" && <p className="text-sm text-muted-foreground">Your result will appear here.</p>}
        {status === "loading" && <Thinking label="Generating" />}
        {status === "error" && error && (
          error.code === "not_configured" ? (
            <div className="flex items-start gap-2 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p>{error.message}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <ErrorMessage>{error.message}</ErrorMessage>
              {error.code !== "invalid_request" && error.code !== "quota_exceeded" && <Button variant="outline" size="sm" onClick={run} disabled={!canRun && input.trim().length === 0}>Try again</Button>}
            </div>
          )
        )}
        {status === "done" && result && (
          <div className="space-y-4">
            <Markdown text={result.text} />
            {result.truncated && <p className="text-xs text-muted-foreground">The result was cut off because it reached the length limit. Try shorter input.</p>}
            <div className="flex flex-wrap gap-2">
              <CopyButton text={result.text} label="Copy result" />
            </div>
            <p className="text-xs text-muted-foreground">AI can make mistakes. Please check important details.</p>
          </div>
        )}
      </ResultPanel>
    </ToolPanel>
  );
}
