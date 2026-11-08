import Link from "next/link";import {tools,popular,categories} from "@/lib/tools";import ToolCard from "@/components/ToolCard";
export default function Home(){return(<div className="space-y-14">
<section className="pt-6 text-center"><h1 className="text-4xl font-semibold tracking-tight">Your everyday tools, all in one place.</h1>
<p className="mx-auto mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">Work smarter with free online tools for documents, images, calculations and everyday productivity.</p>
<form action="/tools" className="mx-auto mt-6 flex max-w-xl gap-2"><input name="q" className="input py-3" placeholder="What do you want to do today?" aria-label="Search tools"/><button className="btn">Search</button></form>
<Link href="/tools" className="mt-4 inline-block text-sm text-indigo-600 underline">Explore Tools</Link></section>
<section><h2 className="mb-3 text-lg font-semibold">Popular tools</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{popular.map(s=>tools.find(t=>t.slug===s)!).map(t=><ToolCard key={t.slug} tool={t}/>)}</div></section>
<section><h2 className="mb-3 text-lg font-semibold">Categories</h2><div className="flex flex-wrap gap-2">{categories.map(c=><Link key={c} className="card py-2" href={`/tools?category=${encodeURIComponent(c)}`}>{c}</Link>)}</div></section>
<section className="grid gap-3 sm:grid-cols-3">{[["Free and easy to use","Open a tool and start."],["No account required","No sign-up, ever."],["Privacy-friendly","Processing happens in your browser."]].map(([a,b])=><div key={a} className="card"><h3 className="font-semibold">{a}</h3><p className="text-sm text-neutral-500">{b}</p></div>)}</section></div>);}
