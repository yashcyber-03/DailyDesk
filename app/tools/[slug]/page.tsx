import type {Metadata} from "next";import Link from "next/link";import {notFound} from "next/navigation";import {tools,bySlug} from "@/lib/tools";import ToolUI from "@/components/ToolUI";import ToolCard from "@/components/ToolCard";
export const generateStaticParams=()=>tools.map(t=>({slug:t.slug}));
export function generateMetadata({params}:{params:{slug:string}}):Metadata{const t=bySlug(params.slug);if(!t)return{};return{title:t.name,description:`${t.desc} Free, no sign-up, runs in your browser.`,alternates:{canonical:`/tools/${t.slug}`},openGraph:{title:`${t.name} | DailyDesk`,description:t.desc}};}
export default function Page({params}:{params:{slug:string}}){const t=bySlug(params.slug);if(!t)notFound();
const related=tools.filter(x=>x.category===t.category&&x.slug!==t.slug).slice(0,3);
return(<article className="mx-auto max-w-3xl"><Link href="/tools" className="text-sm text-neutral-500">← All tools</Link><h1 className="mt-2 text-2xl font-semibold">{t.name}</h1><p className="text-neutral-600 dark:text-neutral-400">{t.desc}</p>
<div className="card mt-5">{t.live?<ToolUI slug={t.slug}/>:<p className="text-sm">This tool is <b>coming soon</b>. It isn’t available yet.</p>}</div>
<section className="mt-8"><h2 className="font-semibold">FAQ</h2><p className="mt-2 text-sm"><b>{t.faq[0]}</b><br/>{t.faq[1]}</p></section>
<section className="mt-8"><h2 className="mb-3 font-semibold">Related tools</h2><div className="grid gap-3 sm:grid-cols-3">{related.map(r=><ToolCard key={r.slug} tool={r}/>)}</div></section></article>);}
