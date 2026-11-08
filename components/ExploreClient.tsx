"use client";import {useState} from "react";import {tools,categories,search,bySlug} from "@/lib/tools";import {useList} from "@/lib/prefs";import ToolCard from "./ToolCard";
export default function ExploreClient({initialCategory,initialQuery}:{initialCategory?:string;initialQuery?:string}){
const[q,setQ]=useState(initialQuery||"");const[cat,setCat]=useState(initialCategory||"All");
const favs=useList("dd-favs"),recent=useList("dd-recent");
const list=search(q).filter(t=>cat==="All"||t.category===cat);
const pick=(l:string[])=>l.map(bySlug).filter((t):t is NonNullable<typeof t>=>!!t);
const showExtra=!q&&cat==="All";
const Section=({title,items}:{title:string;items:typeof tools})=>items.length?<section className="mt-6"><h2 className="mb-2 text-sm font-semibold text-neutral-500">{title}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(t=><ToolCard key={t.slug} tool={t}/>)}</div></section>:null;
return(<div><input autoFocus={!!initialQuery} className="input" placeholder="What do you want to do today?" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search tools"/>
<div className="mt-3 flex flex-wrap gap-2">{["All",...categories].map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-full border px-3 py-1 text-sm ${cat===c?"bg-neutral-900 text-white dark:bg-white dark:text-neutral-900":"border-neutral-300 dark:border-neutral-700"}`}>{c}</button>)}</div>
{showExtra&&<><Section title="Favourites" items={pick(favs)}/><Section title="Recently used" items={pick(recent)}/></>}
<h2 className="mb-2 mt-6 text-sm font-semibold text-neutral-500">{showExtra?"All tools":"Results"}</h2>
{list.length?<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map(t=><ToolCard key={t.slug} tool={t}/>)}</div>:<p className="mt-10 text-center text-neutral-500">No tools match “{q}”. Try a different word, like “compress” or “loan”.</p>}
{showExtra&&favs.length===0&&recent.length===0&&<p className="mt-6 text-xs text-neutral-500">Tip: tap the star on a tool to save it here. Favourites and recent tools are stored only in this browser.</p>}</div>);}
