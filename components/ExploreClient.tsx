"use client";import {useState,useEffect} from "react";import {tools,categories,search} from "@/lib/tools";import ToolCard from "./ToolCard";
export default function ExploreClient({initialCategory,initialQuery}:{initialCategory?:string;initialQuery?:string}){
const[q,setQ]=useState(initialQuery||"");const[cat,setCat]=useState(initialCategory||"All");
const list=search(q).filter(t=>cat==="All"||t.category===cat);
return(<div><input autoFocus={!!initialQuery} className="input" placeholder="What do you want to do today?" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search tools"/>
<div className="mt-3 flex flex-wrap gap-2">{["All",...categories].map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-full border px-3 py-1 text-sm ${cat===c?"bg-neutral-900 text-white dark:bg-white dark:text-neutral-900":"border-neutral-300 dark:border-neutral-700"}`}>{c}</button>)}</div>
{list.length?<div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map(t=><ToolCard key={t.slug} tool={t}/>)}</div>:<p className="mt-10 text-center text-neutral-500">No tools match “{q}”. Try a different word, like “compress” or “loan”.</p>}</div>);}
