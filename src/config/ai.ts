/** AI limits and tool definitions. Safe to import from both server and client code (no secrets). */

export const AI_LIMITS = {
  perMinute: 8,
  perDay: 60,
  maxInputChars: 8000,
  chatMaxMessages: 20,
  chatUserMessageChars: 4000,
  chatAssistantMessageChars: 20000,
  chatMaxTotalChars: 50000,
  maxBodyBytes: 120_000,
  timeoutMs: 25_000,
  maxOutputTokens: 4096,
} as const;

export const aiToolSlugs = [
  "ai-summarizer",
  "ai-email-writer",
  "ai-grammar-checker",
  "ai-text-rewriter",
  "ai-notes-generator",
  "ai-explainer",
] as const;
export type AiToolSlug = (typeof aiToolSlugs)[number];

export interface AiChoice {
  value: string;
  label: string;
}
export interface AiOption {
  id: string;
  label: string;
  choices: AiChoice[];
  default: string;
}
export interface AiToolConfig {
  slug: AiToolSlug;
  inputLabel: string;
  placeholder: string;
  submitLabel: string;
  resultLabel: string;
  options: AiOption[];
}

export const aiToolConfigs: Record<AiToolSlug, AiToolConfig> = {
  "ai-summarizer": {
    slug: "ai-summarizer",
    inputLabel: "Text to summarize",
    placeholder: "Paste an article, email thread, notes or any long text here...",
    submitLabel: "Summarize",
    resultLabel: "Summary",
    options: [
      { id: "length", label: "Length", default: "medium", choices: [
        { value: "short", label: "Short (1-2 sentences)" },
        { value: "medium", label: "Medium (a paragraph)" },
        { value: "long", label: "Detailed" },
      ] },
      { id: "format", label: "Format", default: "paragraph", choices: [
        { value: "paragraph", label: "Paragraph" },
        { value: "bullets", label: "Bullet points" },
      ] },
    ],
  },
  "ai-email-writer": {
    slug: "ai-email-writer",
    inputLabel: "What should the email say?",
    placeholder: "Example: Ask my manager for Friday off to attend a family event. I will finish my tasks before then.",
    submitLabel: "Write email",
    resultLabel: "Your email",
    options: [
      { id: "tone", label: "Tone", default: "professional", choices: [
        { value: "professional", label: "Professional" },
        { value: "friendly", label: "Friendly" },
        { value: "formal", label: "Formal" },
        { value: "direct", label: "Short and direct" },
      ] },
      { id: "length", label: "Length", default: "medium", choices: [
        { value: "short", label: "Short" },
        { value: "medium", label: "Medium" },
        { value: "long", label: "Detailed" },
      ] },
    ],
  },
  "ai-grammar-checker": {
    slug: "ai-grammar-checker",
    inputLabel: "Text to check",
    placeholder: "Paste the text you want corrected...",
    submitLabel: "Check grammar",
    resultLabel: "Corrected text",
    options: [
      { id: "variant", label: "English", default: "us", choices: [
        { value: "us", label: "American" },
        { value: "uk", label: "British" },
        { value: "in", label: "Indian" },
      ] },
      { id: "changes", label: "List the changes", default: "yes", choices: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No, just the text" },
      ] },
    ],
  },
  "ai-text-rewriter": {
    slug: "ai-text-rewriter",
    inputLabel: "Text to rewrite",
    placeholder: "Paste the text you want reworded...",
    submitLabel: "Rewrite",
    resultLabel: "Rewritten text",
    options: [
      { id: "tone", label: "Tone", default: "professional", choices: [
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "friendly", label: "Friendly" },
        { value: "formal", label: "Formal" },
        { value: "persuasive", label: "Persuasive" },
        { value: "concise", label: "Concise" },
      ] },
      { id: "length", label: "Length", default: "same", choices: [
        { value: "same", label: "About the same" },
        { value: "shorter", label: "Shorter" },
        { value: "longer", label: "Longer" },
      ] },
    ],
  },
  "ai-notes-generator": {
    slug: "ai-notes-generator",
    inputLabel: "Text or topic to make notes from",
    placeholder: "Paste a lecture transcript, chapter text or a topic...",
    submitLabel: "Generate notes",
    resultLabel: "Your notes",
    options: [
      { id: "style", label: "Style", default: "outline", choices: [
        { value: "outline", label: "Outline with headings" },
        { value: "bullets", label: "Bullet points" },
        { value: "qa", label: "Questions and answers" },
        { value: "terms", label: "Summary and key terms" },
      ] },
      { id: "detail", label: "Detail", default: "standard", choices: [
        { value: "brief", label: "Brief" },
        { value: "standard", label: "Standard" },
        { value: "detailed", label: "Detailed" },
      ] },
    ],
  },
  "ai-explainer": {
    slug: "ai-explainer",
    inputLabel: "What should I explain?",
    placeholder: "Type a concept or paste a confusing passage, e.g. How does compound interest work?",
    submitLabel: "Explain",
    resultLabel: "Explanation",
    options: [
      { id: "level", label: "Explain it like I am...", default: "beginner", choices: [
        { value: "child", label: "A 10-year-old" },
        { value: "beginner", label: "A beginner" },
        { value: "intermediate", label: "Comfortable with the basics" },
        { value: "expert", label: "An expert" },
      ] },
      { id: "format", label: "Style", default: "example", choices: [
        { value: "plain", label: "Plain explanation" },
        { value: "example", label: "With an example" },
        { value: "steps", label: "Step by step" },
      ] },
    ],
  },
};

export const chatModes = [
  { value: "ask", label: "Ask" },
  { value: "summarize", label: "Summarize" },
  { value: "rewrite", label: "Rewrite" },
  { value: "explain", label: "Explain" },
  { value: "email", label: "Email" },
  { value: "notes", label: "Notes" },
] as const;
export type ChatMode = (typeof chatModes)[number]["value"];
export const chatModeValues = chatModes.map((m) => m.value) as readonly ChatMode[];

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
