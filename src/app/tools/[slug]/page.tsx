import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { FavoriteButton } from "@/components/tools/favorite-button";
import { AdSlot } from "@/components/ads/ad-slot";
import { JsonLd } from "@/components/json-ld";
import { RecordVisit } from "@/components/tools/recent-tools";
import { ToolGrid } from "@/components/tools/tool-card";
import { ToolRenderer } from "@/components/tools/tool-renderer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isImplemented } from "@/config/implemented";
import { tools } from "@/config/tools";
import { toolContent } from "@/content/tool-content";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, descriptionFrom, faqJsonLd, pageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { getCategory, getTool, getToolsByCategory } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const content = toolContent[tool.slug];
  return pageMetadata({
    title: `${tool.name} - Free Online`,
    description: content ? descriptionFrom(content.about) : tool.shortDescription,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const category = getCategory(tool.category)!;
  const Icon = tool.icon;
  const content = toolContent[tool.slug];
  const related = getToolsByCategory(tool.category).filter((t) => t.slug !== tool.slug).slice(0, 3);

  const path = `/tools/${tool.slug}`;
  const structured = [
    webApplicationJsonLd(siteConfig.url, { name: tool.name, description: content ? descriptionFrom(content.about) : tool.shortDescription, path }),
    breadcrumbJsonLd(siteConfig.url, [
      { name: "Home", path: "/" },
      { name: category.name, path: category.href },
      { name: tool.name, path },
    ]),
    ...(content ? [faqJsonLd(content.faqs)] : []),
  ];

  return (
    <>
    <JsonLd data={structured} />
    <div className="container py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/tools" className="hover:text-foreground">Tools</Link> /{" "}
        <Link href={category.href} className="hover:text-foreground">{category.name}</Link>
      </nav>
      <div className="mt-4 flex items-center gap-3">
        <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
        <h1 className="text-3xl font-semibold tracking-tight">{tool.name}</h1>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">{tool.shortDescription}</p>
      <div className="mb-8 mt-4 min-h-9"><FavoriteButton slug={tool.slug} /></div>

      {isImplemented(tool.slug) ? (
        <>
          <RecordVisit slug={tool.slug} />
          <ToolRenderer slug={tool.slug} />
        </>
      ) : (
        <Card className="flex items-start gap-3 p-5" role="status">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">Not available yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This tool&rsquo;s working interface has not been built yet. It will be added in a later development phase.
            </p>
          </div>
        </Card>
      )}

      {content && (
        <div className="mt-12 max-w-3xl space-y-10">
          <section aria-labelledby="about">
            <h2 id="about" className="text-xl font-semibold tracking-tight">About this tool</h2>
            <p className="mt-2 text-muted-foreground">{content.about}</p>
          </section>
          <section aria-labelledby="how-to">
            <h2 id="how-to" className="text-xl font-semibold tracking-tight">How to use it</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
              {content.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </section>
          <section aria-labelledby="faq">
            <h2 id="faq" className="text-xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-3 divide-y rounded-xl border">
              {content.faqs.map((f) => (
                <details key={f.q} className="p-4">
                  <summary className="cursor-pointer font-medium">{f.q}</summary>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      )}

      {!isImplemented(tool.slug) && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tool.keywords.map((k) => <Badge key={k}>{k}</Badge>)}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related">
          <h2 id="related" className="mb-4 text-xl font-semibold tracking-tight">More {category.name}</h2>
          <ToolGrid items={related} />
        </section>
      )}
    </div>
    <AdSlot id="tool-below" className="pb-8" />
    </>
  );
}
