import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isImplemented } from "@/config/implemented";
import type { Tool } from "@/types/tool";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link href={`/tools/${tool.slug}`} className="group block h-full rounded-xl">
      <Card className="h-full p-5 group-hover:border-primary/50 group-hover:shadow-sm">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </span>
          {!isImplemented(tool.slug) ? <Badge>Coming soon</Badge> : tool.isNew ? <Badge>New</Badge> : null}
        </div>
        <h3 className="mt-3 font-medium">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tool.shortDescription}</p>
      </Card>
    </Link>
  );
}

export function ToolGrid({ items }: { items: Tool[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((tool) => (
        <li key={tool.slug}>
          <ToolCard tool={tool} />
        </li>
      ))}
    </ul>
  );
}
