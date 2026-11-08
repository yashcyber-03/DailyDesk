"use client";
import {useEffect,useState} from "react";
export const read=(k:string):string[]=>{try{const v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
const write=(k:string,v:string[])=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}window.dispatchEvent(new Event("dd-prefs"))};
export const toggleFav=(s:string)=>{const l=read("dd-favs");write("dd-favs",l.includes(s)?l.filter(x=>x!==s):[s,...l])};
export const pushRecent=(s:string)=>write("dd-recent",[s,...read("dd-recent").filter(x=>x!==s)].slice(0,6));
export function useList(k:string){const[l,setL]=useState<string[]>([]);useEffect(()=>{const f=()=>setL(read(k));f();window.addEventListener("dd-prefs",f);window.addEventListener("storage",f);return()=>{window.removeEventListener("dd-prefs",f);window.removeEventListener("storage",f)}},[k]);return l;}
