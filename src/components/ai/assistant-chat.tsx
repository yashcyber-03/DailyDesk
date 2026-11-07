"use client";

import { Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/ai/copy-button";
import { Markdown } from "@/components/ai/markdown";
import { Thinking } from "@/components/ai/thinking";
import { ErrorMessage } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AI_LIMITS, chatModes, type ChatMode } from "@/config/ai";
import { postAi } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

interface Msg {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const starters: Record<ChatMode, string> = {
  ask: "What is the difference between a credit card and a debit card?",
  summarize: "Summarize this text in three bullet points: ",
  rewrite: "Rewrite this to sound more confident: ",
  explain: "Explain how vaccines train the immune system.",
  email: "Write an email asking my teacher for a deadline extension.",
  notes: "Make study notes on the water cycle.",
};

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("ask");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, error]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function request(history: Msg[]) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    const payload = history.slice(-AI_LIMITS.chatMaxMessages).map((m) => ({ role: m.role, content: m.content }));
    while (payload.length > 0 && payload[0].role === "assistant") payload.shift();
    const res = await postAi("/api/ai/chat", { mode, messages: payload }, controller.signal);
    if (controller.signal.aborted) return;
    setLoading(false);
    if (res.ok) {
      const content = res.truncated ? `${res.text}\n\n(The answer was cut off. Ask me to continue.)` : res.text;
      setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", content }]);
    } else {
      setError({ code: res.code, message: res.message });
    }
  }

  function submit() {
    const text = input.trim();
    if (!text || loading || text.length > AI_LIMITS.chatUserMessageChars) return;
    const next = [...messages, { id: nextId.current++, role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    void request(next);
  }

  function clear() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setLoading(false);
  }

  const limit = AI_LIMITS.chatUserMessageChars;
  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <Card className="flex h-[calc(100vh-14rem)] min-h-[28rem] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b p-3" role="group" aria-label="Assistant mode">
        {chatModes.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={mode === m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              mode === m.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
            )}
          >
            {m.label}
          </button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={clear} disabled={messages.length === 0 && !input && !error}>
          <Trash2 className="h-4 w-4" /> Clear conversation
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Conversation">
        {messages.length === 0 && !loading && (
          <div className="mx-auto max-w-md space-y-3 py-6 text-center">
            <p className="font-medium">How can I help today?</p>
            <p className="text-sm text-muted-foreground">Ask a question, or pick a mode above for summaries, rewrites, explanations, emails and notes.</p>
            <Button variant="outline" size="sm" onClick={() => setInput(starters[mode])}>Try an example</Button>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", m.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card")}>
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
              ) : (
                <>
                  <Markdown text={m.content} />
                  <div className="mt-2"><CopyButton text={m.content} /></div>
                </>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="rounded-2xl border bg-card px-4 py-3 w-fit"><Thinking /></div>}
        {error && (
          <div className="space-y-2 rounded-lg border border-destructive/40 p-3">
            {error.code === "not_configured" ? <p className="text-sm">{error.message}</p> : <ErrorMessage>{error.message}</ErrorMessage>}
            {lastIsUser && error.code !== "not_configured" && error.code !== "invalid_request" && error.code !== "quota_exceeded" && (
              <Button variant="outline" size="sm" onClick={() => request(messages)}>Try again</Button>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <label htmlFor="assistant-input" className="sr-only">Message</label>
          <textarea
            id="assistant-input"
            value={input}
            rows={2}
            maxLength={limit}
            placeholder="Type your message. Press Enter to send, Shift+Enter for a new line."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className="flex max-h-40 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
          <Button onClick={submit} disabled={!input.trim() || loading} aria-label="Send message"><Send className="h-4 w-4" /></Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Messages are sent to Google&rsquo;s Gemini API and are not saved by DailyDesk. AI can make mistakes. Please do not share sensitive information.
          {input.length > limit * 0.85 && ` ${input.length}/${limit}`}
        </p>
      </div>
    </Card>
  );
}
