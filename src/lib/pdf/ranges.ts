export type RangesResult = { ok: true; groups: number[][] } | { ok: false; error: string };

/**
 * Parses "1-3, 5, 8-10" into groups of 1-based page numbers (one group per comma part).
 */
export function parseRangeGroups(input: string, totalPages: number): RangesResult {
  const text = input.trim();
  if (!text) return { ok: false, error: "Enter the pages, for example 1-3, 5, 8-10." };
  const groups: number[][] = [];
  for (const rawPart of text.split(",")) {
    const part = rawPart.trim();
    if (!part) return { ok: false, error: "Remove the extra comma." };
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) return { ok: false, error: `"${part}" is not a valid page or range.` };
    const start = Number(match[1]);
    const end = match[2] === undefined ? start : Number(match[2]);
    if (start < 1 || end < 1) return { ok: false, error: "Page numbers start at 1." };
    if (start > end) return { ok: false, error: `"${part}" goes backwards. Write it as ${end}-${start}.` };
    if (end > totalPages) return { ok: false, error: `This PDF has only ${totalPages} pages.` };
    const group: number[] = [];
    for (let p = start; p <= end; p++) group.push(p);
    groups.push(group);
  }
  return { ok: true, groups };
}

export type PagesResult = { ok: true; pages: number[] } | { ok: false; error: string };

/** Same syntax, flattened into unique pages in the order they were typed. */
export function parsePageRanges(input: string, totalPages: number): PagesResult {
  const r = parseRangeGroups(input, totalPages);
  if (!r.ok) return r;
  const seen = new Set<number>();
  const pages: number[] = [];
  for (const g of r.groups) {
    for (const p of g) {
      if (!seen.has(p)) {
        seen.add(p);
        pages.push(p);
      }
    }
  }
  return { ok: true, pages };
}
