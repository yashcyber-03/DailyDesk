"use client";
import {useEffect,useState} from "react";
export const toast=(msg:string)=>{if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent("dd-toast",{detail:msg}))};
export function Toaster(){const[items,setItems]=useState<{id:number;msg:string}[]>([]);
useEffect(()=>{let n=0;const h=(e:Event)=>{const id=++n;const msg=String((e as CustomEvent).detail);setItems(p=>[...p.slice(-2),{id,msg}]);setTimeout(()=>setItems(p=>p.filter(x=>x.id!==id)),2500)};window.addEventListener("dd-toast",h);return()=>window.removeEventListener("dd-toast",h)},[]);
return(<div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">{items.map(i=><div key={i.id} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900">{i.msg}</div>)}</div>);}
