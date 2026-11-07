export type AiResponse =
  | { ok: true; text: string; truncated: boolean }
  | { ok: false; code: string; message: string };

export async function postAi(url: string, body: unknown, signal?: AbortSignal): Promise<AiResponse> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    return { ok: false, code: "network", message: "Could not reach the server. Check your connection and try again." };
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // fall through to the generic error below
  }
  const d = data as { text?: unknown; truncated?: unknown; error?: { code?: unknown; message?: unknown } } | null;
  if (res.ok && typeof d?.text === "string") return { ok: true, text: d.text, truncated: d.truncated === true };
  return {
    ok: false,
    code: typeof d?.error?.code === "string" ? d.error.code : "error",
    message: typeof d?.error?.message === "string" ? d.error.message : "Something went wrong. Please try again.",
  };
}
