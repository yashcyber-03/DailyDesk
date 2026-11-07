import { aiHandlers } from "@/lib/ai/default-handlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  return aiHandlers.handleTool(request);
}
