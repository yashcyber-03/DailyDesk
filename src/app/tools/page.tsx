import type { Metadata } from "next";
import { ToolsDirectory } from "@/components/tools/tools-directory";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Free Online Tools",
  description: "Browse and search every DailyDesk tool: PDF, image, calculators and productivity.",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-semibold tracking-tight">All tools</h1>
      <p className="mb-8 mt-2 max-w-2xl text-muted-foreground">
        Search or filter everything in DailyDesk. Tools marked &ldquo;Coming soon&rdquo; are still being built.
      </p>
      <ToolsDirectory />
    </div>
  );
}
