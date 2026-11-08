"use client";
import {Star} from "lucide-react";import {toggleFav,useList} from "@/lib/prefs";import {toast} from "./Toast";
export default function FavButton({slug,className=""}:{slug:string;className?:string}){const on=useList("dd-favs").includes(slug);
return(<button aria-pressed={on} aria-label={on?"Remove from favourites":"Add to favourites"} className={`rounded-lg p-1.5 text-neutral-400 hover:text-amber-500 ${on?"text-amber-500":""} ${className}`} onClick={()=>{toggleFav(slug);toast(on?"Removed from favourites":"Added to favourites")}}><Star size={16} fill={on?"currentColor":"none"}/></button>);}
