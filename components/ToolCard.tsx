"use client";
import Link from "next/link";import {ArrowUpRight} from "lucide-react";import type {Tool} from "@/lib/tools";import FavButton from "./FavButton";
export default function ToolCard({tool}:{tool:Tool}){return(<div className="relative"><Link href={`/tools/${tool.slug}`} className="card group block h-full !pb-10 transition hover:-translate-y-0.5 hover:border-indigo-400">
<div className="flex items-center justify-between text-xs text-neutral-500"><span>{tool.category}</span>{tool.live?<ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100"/>:<span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">Coming soon</span>}</div>
<h3 className="mt-2 font-semibold">{tool.name}</h3><p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{tool.desc}</p></Link><FavButton slug={tool.slug} className="absolute bottom-2 right-2.5"/></div>);}
