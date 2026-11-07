import type { Metadata } from "next";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Free AI Assistant",
  description: "Chat with the DailyDesk AI Assistant to ask questions, summarize text, rewrite content, explain concepts, write emails and make notes.",
  path: "/ai-assistant",
});

export default function AiAssistantPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold tracking-tight">AI Assistant</h1>
      <p className="mb-6 mt-2 max-w-2xl text-muted-foreground">
        Ask questions, summarize text, rewrite content, get concepts explained, and draft emails or notes. Powered by Google Gemini.
      </p>
      <AssistantChat />
    </div>
  );
}
