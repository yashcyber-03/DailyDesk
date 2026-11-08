"use client";
import Link from "next/link";import {useRouter} from "next/navigation";import {useEffect,useRef,useState} from "react";import {Moon,Sun,Layers,Search,Menu,X} from "lucide-react";import {search} from "@/lib/tools";import {Toaster} from "./Toast";
const links:[string,string][]=[["Home","/"],["Explore Tools","/tools"],["PDF Tools","/tools?category=PDF+%26+Documents"],["Writing","/tools?category=AI+%26+Writing"],["Calculators","/tools?category=Calculators"]];

function Palette({onClose}:{onClose:()=>void}){const router=useRouter();const[q,setQ]=useState("");const[i,setI]=useState(0);const ref=useRef<HTMLInputElement>(null);
const res=search(q).slice(0,8);useEffect(()=>{ref.current?.focus()},[]);useEffect(()=>setI(0),[q]);
const go=(s:string)=>{onClose();router.push(`/tools/${s}`)};
const key=(e:React.KeyboardEvent)=>{if(e.key==="ArrowDown"){e.preventDefault();setI(Math.min(i+1,res.length-1))}else if(e.key==="ArrowUp"){e.preventDefault();setI(Math.max(i-1,0))}else if(e.key==="Enter"&&res[i])go(res[i].slug);else if(e.key==="Escape")onClose()};
return(<div className="fixed inset-0 z-50 bg-black/40 p-4 pt-20" onClick={onClose}><div role="dialog" aria-label="Search tools" className="mx-auto max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" onClick={e=>e.stopPropagation()}>
<input ref={ref} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={key} placeholder="What do you want to do today?" aria-label="Search tools" className="w-full border-b border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none dark:border-neutral-800"/>
<ul className="max-h-80 overflow-auto p-1">{res.length?res.map((r,k)=><li key={r.slug}><button onMouseEnter={()=>setI(k)} onClick={()=>go(r.slug)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${k===i?"bg-neutral-100 dark:bg-neutral-800":""}`}><span><b className="font-medium">{r.name}</b><span className="ml-2 text-neutral-500">{r.category}</span></span>{!r.live&&<span className="text-xs text-amber-700">Soon</span>}</button></li>):<li className="px-3 py-6 text-center text-sm text-neutral-500">No tools match “{q}”.</li>}</ul></div></div>);}

export default function Header(){const[dark,setDark]=useState(false);const[menu,setMenu]=useState(false);const[find,setFind]=useState(false);
useEffect(()=>{try{const d=localStorage.getItem("dd-theme")==="dark";setDark(d);document.documentElement.classList.toggle("dark",d)}catch{}},[]);
useEffect(()=>{const h=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setFind(true)}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[]);
const toggle=()=>{const d=!dark;setDark(d);document.documentElement.classList.toggle("dark",d);try{localStorage.setItem("dd-theme",d?"dark":"light")}catch{}};
const btn="rounded-lg border border-neutral-300 p-2 text-neutral-900 dark:border-neutral-700 dark:text-neutral-100";
return(<header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 text-neutral-900 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 dark:text-neutral-100"><nav className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 text-sm">
<Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white"><Layers size={16}/></span>DailyDesk</Link>
<div className="hidden items-center gap-5 md:flex">{links.map(([l,h])=><Link key={l} href={h} className="hover:text-indigo-600">{l}</Link>)}</div>
<div className="ml-auto flex gap-2"><button aria-label="Search tools (Ctrl+K)" onClick={()=>setFind(true)} className={btn}><Search size={16}/></button><button aria-label="Toggle theme" onClick={toggle} className={btn}>{dark?<Sun size={16}/>:<Moon size={16}/>}</button><button aria-label="Menu" aria-expanded={menu} onClick={()=>setMenu(!menu)} className={`${btn} md:hidden`}>{menu?<X size={16}/>:<Menu size={16}/>}</button></div></nav>
{menu&&<div className="border-t border-neutral-200 px-4 py-2 md:hidden dark:border-neutral-800">{links.map(([l,h])=><Link key={l} href={h} onClick={()=>setMenu(false)} className="block py-2 text-sm">{l}</Link>)}</div>}
{find&&<Palette onClose={()=>setFind(false)}/>}<Toaster/></header>);}
