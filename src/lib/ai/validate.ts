import {
  AI_LIMITS,
  aiToolConfigs,
  aiToolSlugs,
  chatModeValues,
  type AiToolSlug,
  type ChatMessage,
  type ChatMode,
} from "../../config/ai.ts";

export type Validation<T> = { ok: true; value: T } | { ok: false; message: string };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const strip = (s: string) => s.replace(/\u0000/g, "");

export interface ToolRequest {
  slug: AiToolSlug;
  input: string;
  options: Record<string, string>;
}

export function validateToolRequest(body: unknown): Validation<ToolRequest> {
  if (!isRecord(body)) return { ok: false, message: "Invalid request." };
  const slug = body.tool;
  if (typeof slug !== "string" || !(aiToolSlugs as readonly string[]).includes(slug)) {
    return { ok: false, message: "Unknown tool." };
  }
  const config = aiToolConfigs[slug as AiToolSlug];
  if (typeof body.input !== "string") return { ok: false, message: "Please enter some text." };
  const input = strip(body.input).trim();
  if (!input) return { ok: false, message: "Please enter some text." };
  if (input.length > AI_LIMITS.maxInputChars) {
    return { ok: false, message: `Please keep the text under ${AI_LIMITS.maxInputChars.toLocaleString("en-US")} characters.` };
  }
  const given = isRecord(body.options) ? body.options : {};
  const options: Record<string, string> = {};
  for (const opt of config.options) {
    const raw = given[opt.id] ?? opt.default;
    if (typeof raw !== "string" || !opt.choices.some((c) => c.value === raw)) {
      return { ok: false, message: `Invalid value for ${opt.label}.` };
    }
    options[opt.id] = raw;
  }
  return { ok: true, value: { slug: slug as AiToolSlug, input, options } };
}

export interface ChatRequest {
  mode: ChatMode;
  messages: ChatMessage[];
}

export function validateChatRequest(body: unknown): Validation<ChatRequest> {
  if (!isRecord(body)) return { ok: false, message: "Invalid request." };
  const mode = body.mode ?? "ask";
  if (typeof mode !== "string" || !(chatModeValues as readonly string[]).includes(mode)) {
    return { ok: false, message: "Unknown mode." };
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { ok: false, message: "Please enter a message." };
  if (body.messages.length > AI_LIMITS.chatMaxMessages) {
    return { ok: false, message: "This conversation is too long. Clear it and start again." };
  }
  const messages: ChatMessage[] = [];
  let total = 0;
  for (const m of body.messages) {
    if (!isRecord(m) || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return { ok: false, message: "Invalid message." };
    }
    const content = strip(m.content).trim();
    const cap = m.role === "user" ? AI_LIMITS.chatUserMessageChars : AI_LIMITS.chatAssistantMessageChars;
    if (!content) return { ok: false, message: "Messages cannot be empty." };
    if (content.length > cap) {
      return { ok: false, message: `Please keep each message under ${AI_LIMITS.chatUserMessageChars.toLocaleString("en-US")} characters.` };
    }
    total += content.length;
    messages.push({ role: m.role, content });
  }
  if (total > AI_LIMITS.chatMaxTotalChars) return { ok: false, message: "This conversation is too long. Clear it and start again." };
  if (messages[0].role !== "user" || messages[messages.length - 1].role !== "user") {
    return { ok: false, message: "The conversation must start and end with your message." };
  }
  return { ok: true, value: { mode: mode as ChatMode, messages } };
}
