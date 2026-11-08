import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {tools,bySlug} from "@/lib/tools";
import {seo} from "@/lib/seo";
import ToolUI from "@/components/ToolUI";
import ToolCard from "@/components/ToolCard";

export const generateStaticParams = () => tools.map(t => ({slug: t.slug}));

export function generateMetadata({params}: {params: {slug: string}}): Metadata {
  const t = bySlug(params.slug);
  if (!t) return {};
  const s = seo[t.slug];
  const title = s?.title || t.name;
  const description = s?.desc || `${t.desc} Free, no sign-up, runs in your browser.`;
  return {title, description, alternates: {canonical: `/tools/${t.slug}`}, openGraph: {title: `${title} | DailyDesk`, description}};
}

export default function Page({params}: {params: {slug: string}}) {
  const t = bySlug(params.slug);
  if (!t) notFound();
  const s = seo[t.slug];
  const faqs = s?.faqs || [t.faq];
  const steps = s?.steps || ["Open the tool.", "Add your text, numbers or file.", "Copy or download the result."];
  const related = tools.filter(x => x.category === t.category && x.slug !== t.slug).slice(0, 3);
  const ld = JSON.stringify({"@context": "https://schema.org", "@type": "WebApplication", name: t.name, description: s?.desc || t.desc, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", offers: {"@type": "Offer", price: "0", priceCurrency: "USD"}}).replace(/</g, "\\u003c");
  return (
    <article className="mx-auto max-w-3xl">
      {t.live && <script type="application/ld+json" dangerouslySetInnerHTML={{__html: ld}} />}
      <Link href="/tools" className="text-sm text-neutral-500">← All tools</Link>
      <h1 className="mt-2 text-2xl font-semibold">{t.name}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">{s?.intro || t.desc}</p>
      <div className="card mt-5">{t.live ? <ToolUI slug={t.slug} /> : <p className="text-sm">This tool is <b>coming soon</b>. It isn’t available yet.</p>}</div>
      <section className="mt-8"><h2 className="font-semibold">How to use</h2><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{steps.map(x => <li key={x}>{x}</li>)}</ol></section>
      <section className="mt-8"><h2 className="font-semibold">Frequently asked questions</h2><dl className="mt-2 space-y-3 text-sm">{faqs.map(([q, a]) => <div key={q}><dt className="font-medium">{q}</dt><dd className="text-neutral-600 dark:text-neutral-400">{a}</dd></div>)}</dl></section>
      <section className="mt-8"><h2 className="mb-3 font-semibold">Related tools</h2><div className="grid gap-3 sm:grid-cols-3">{related.map(r => <ToolCard key={r.slug} tool={r} />)}</div></section>
    </article>
  );
}
