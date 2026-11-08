"use client";import Link from "next/link";import {useEffect,useState} from "react";import {Moon,Sun,Layers} from "lucide-react";
export default function Header(){const[dark,setDark]=useState(false);
useEffect(()=>{try{const d=localStorage.getItem("dd-theme")==="dark";setDark(d);document.documentElement.classList.toggle("dark",d);}catch{}},[]);
const toggle=()=>{const d=!dark;setDark(d);document.documentElement.classList.toggle("dark",d);try{localStorage.setItem("dd-theme",d?"dark":"light")}catch{}};
return(<header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90"><nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-3 text-sm">
<Link href="/" className="flex items-center gap-2 font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white"><Layers size={16}/></span>DailyDesk</Link>
<Link href="/">Home</Link><Link href="/tools">Explore Tools</Link><Link href="/tools?category=PDF+%26+Documents">PDF Tools</Link><Link href="/tools?category=AI+%26+Writing">Writing</Link><Link href="/tools?category=Calculators">Calculators</Link>
<button aria-label="Toggle theme" onClick={toggle} className="ml-auto rounded-lg border border-neutral-300 p-2 dark:border-neutral-700">{dark?<Sun size={16}/>:<Moon size={16}/>}</button></nav></header>);}
