"use client";

import { Copy, Mail } from "lucide-react";
import { useState } from "react";
import { Field } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const topics = ["General question", "Bug report", "Feature request", "Privacy or data request", "Business enquiry"];

/** Opens the visitor's own email app with the message filled in. Nothing is sent to or stored on our servers. */
export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function openMail() {
    const body = `${message.trim()}\n\n${name.trim() ? `Name: ${name.trim()}\n` : ""}${from.trim() ? `Reply to: ${from.trim()}\n` : ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`DailyDesk: ${topic}`)}&body=${encodeURIComponent(body)}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name (optional)" htmlFor="contact-name"><Input id="contact-name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Your email (optional)" htmlFor="contact-from"><Input id="contact-from" type="email" maxLength={120} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      </div>
      <Field label="Topic" htmlFor="contact-topic">
        <Select id="contact-topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </Field>
      <Field label="Message" htmlFor="contact-message" hint="This opens your email app with the message ready to send. Nothing is stored on our servers.">
        <textarea id="contact-message" rows={7} maxLength={3000} value={message} onChange={(e) => setMessage(e.target.value)}
          className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground" />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button onClick={openMail} disabled={!message.trim()}><Mail className="h-4 w-4" /> Open in my email app</Button>
        <Button variant="outline" onClick={copy}><Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy email address"}</Button>
      </div>
      <p className="text-sm text-muted-foreground">Or write to us directly at <a className="text-foreground underline" href={`mailto:${email}`}>{email}</a>.</p>
    </div>
  );
}
