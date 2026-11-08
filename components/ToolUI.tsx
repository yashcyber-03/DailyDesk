"use client";import {useState,type ReactNode} from "react";import More from "./ToolUI2";
const Row=({l,children}:{l:string;children:ReactNode})=><label className="block text-sm"><span className="mb-1 block text-neutral-500">{l}</span>{children}</label>;
const Out=({children}:{children:ReactNode})=><div className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800" role="status">{children}</div>;
const num=(s:string)=>s.trim()===""?NaN:Number(s);
const fmt=(n:number)=>n.toLocaleString(undefined,{maximumFractionDigits:2});
const copy=(s:string)=>navigator.clipboard?.writeText(s);
function TextTool({mode}:{mode:string}){const[t,setT]=useState("");const[c,setC]=useState(false);
const w=t.trim()?t.trim().split(/\s+/).length:0;
const tf:Record<string,(s:string)=>string>={upper:s=>s.toUpperCase(),lower:s=>s.toLowerCase(),title:s=>s.toLowerCase().replace(/\b\w/g,m=>m.toUpperCase()),sentence:s=>s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\w)/g,(_,a,b)=>a+b.toUpperCase()),spaces:s=>s.replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim(),rev:s=>[...s].reverse().join(""),revw:s=>s.split(/\s+/).reverse().join(" ")};
const btns:Record<string,[string,string][]>={"case-converter":[["upper","UPPER"],["lower","lower"],["title","Title Case"],["sentence","Sentence case"]],"remove-extra-spaces":[["spaces","Clean up"]],"text-reverser":[["rev","Reverse text"],["revw","Reverse words"]]};
const b=btns[mode];
return(<div><textarea className="input h-40" value={t} onChange={e=>setT(e.target.value)} placeholder="Type or paste text…"/>
{b?<div className="mt-3 flex flex-wrap gap-2">{b.map(([k,l])=><button key={k} className="btn" onClick={()=>setT(tf[k](t))}>{l}</button>)}<button className="btn" onClick={()=>{copy(t);setC(true);setTimeout(()=>setC(false),1500)}}>{c?"Copied!":"Copy"}</button></div>
:<Out>Words: <b>{w}</b> · Characters: <b>{t.length}</b> · Without spaces: <b>{t.replace(/\s/g,"").length}</b> · Reading time: <b>{Math.max(w?1:0,Math.ceil(w/200))} min</b></Out>}</div>);}
function Pct(){const[a,setA]=useState("");const[b,setB]=useState("");const x=num(a),y=num(b);const ok=!isNaN(x)&&!isNaN(y);
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Row l="Value A"><input className="input" type="number" value={a} onChange={e=>setA(e.target.value)}/></Row><Row l="Value B"><input className="input" type="number" value={b} onChange={e=>setB(e.target.value)}/></Row></div>
{ok?<Out><p>{fmt(x)}% of {fmt(y)} = <b>{fmt(x*y/100)}</b></p><p>{fmt(x)} is <b>{y===0?"—":fmt(x/y*100)}%</b> of {fmt(y)}</p><p>Change from {fmt(x)} to {fmt(y)}: <b>{x===0?"—":fmt((y-x)/Math.abs(x)*100)}%</b></p></Out>:<p className="text-sm text-neutral-500">Enter both numbers.</p>}</div>);}
function Age(){const[d,setD]=useState("");const today=new Date();const bd=d?new Date(d):null;const bad=!bd||isNaN(+bd)||bd>today;
let y=0,m=0,dd=0;if(!bad&&bd){y=today.getFullYear()-bd.getFullYear();m=today.getMonth()-bd.getMonth();dd=today.getDate()-bd.getDate();if(dd<0){m--;dd+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}if(m<0){y--;m+=12;}}
return(<div><Row l="Date of birth"><input className="input" type="date" max={today.toISOString().slice(0,10)} value={d} onChange={e=>setD(e.target.value)}/></Row>
{d&&bad?<p className="mt-3 text-sm text-red-600">Enter a valid date that is not in the future.</p>:!bad&&<Out>You are <b>{y}</b> years, <b>{m}</b> months, <b>{dd}</b> days old (about {fmt(Math.floor((+today-+bd!)/864e5))} days).</Out>}</div>);}
function Emi(){const[p,setP]=useState("");const[r,setR]=useState("");const[n,setN]=useState("");const P=num(p),R=num(r),N=num(n);const ok=P>0&&R>=0&&N>0;
const i=R/1200;const emi=!ok?0:i===0?P/(N*12):P*i*Math.pow(1+i,N*12)/(Math.pow(1+i,N*12)-1);
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-3"><Row l="Loan amount"><input className="input" type="number" min="0" value={p} onChange={e=>setP(e.target.value)}/></Row><Row l="Annual interest rate (%)"><input className="input" type="number" min="0" value={r} onChange={e=>setR(e.target.value)}/></Row><Row l="Term (years)"><input className="input" type="number" min="0" value={n} onChange={e=>setN(e.target.value)}/></Row></div>
{ok?<Out>Monthly EMI: <b>{fmt(emi)}</b> · Total payment: <b>{fmt(emi*N*12)}</b> · Total interest: <b>{fmt(emi*N*12-P)}</b></Out>:<p className="text-sm text-neutral-500">Enter amount, rate and term (all positive).</p>}</div>);}
function Gst(){const[a,setA]=useState("");const[r,setR]=useState("18");const[m,setM]=useState("add");const A=num(a),R=num(r);const ok=A>=0&&R>=0;
const net=m==="add"?A:A/(1+R/100);const tax=m==="add"?A*R/100:A-net;
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-3"><Row l="Amount"><input className="input" type="number" min="0" value={a} onChange={e=>setA(e.target.value)}/></Row><Row l="GST rate (%)"><input className="input" type="number" min="0" value={r} onChange={e=>setR(e.target.value)}/></Row><Row l="Mode"><select className="input" value={m} onChange={e=>setM(e.target.value)}><option value="add">Add GST</option><option value="remove">Remove GST (amount includes GST)</option></select></Row></div>
{ok?<Out>Net: <b>{fmt(net)}</b> · GST: <b>{fmt(tax)}</b> · Total: <b>{fmt(net+tax)}</b></Out>:<p className="text-sm text-neutral-500">Enter an amount.</p>}</div>);}
function Disc(){const[a,setA]=useState("");const[d,setD]=useState("");const A=num(a),D=num(d);const ok=A>=0&&D>=0&&D<=100;
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Row l="Original price"><input className="input" type="number" min="0" value={a} onChange={e=>setA(e.target.value)}/></Row><Row l="Discount (%)"><input className="input" type="number" min="0" max="100" value={d} onChange={e=>setD(e.target.value)}/></Row></div>
{ok?<Out>You save <b>{fmt(A*D/100)}</b>. Final price: <b>{fmt(A-A*D/100)}</b></Out>:<p className="text-sm text-neutral-500">Enter a price and a discount between 0 and 100.</p>}</div>);}
function Bmi(){const[h,setH]=useState("");const[w,setW]=useState("");const H=num(h)/100,W=num(w);const ok=H>0&&W>0;const v=W/(H*H);
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Row l="Height (cm)"><input className="input" type="number" min="0" value={h} onChange={e=>setH(e.target.value)}/></Row><Row l="Weight (kg)"><input className="input" type="number" min="0" value={w} onChange={e=>setW(e.target.value)}/></Row></div>
{ok?<Out>BMI = weight ÷ height² = <b>{v.toFixed(1)}</b><p className="mt-1 text-neutral-500">WHO adult ranges: under 18.5, 18.5–24.9, 25–29.9, 30 and above. BMI is a general screening number, not a medical diagnosis. Talk to a healthcare professional about your health.</p></Out>:<p className="text-sm text-neutral-500">Enter height and weight.</p>}</div>);}
function Pw(){const[len,setLen]=useState(16);const[pw,setPw]=useState("");const[sym,setSym]=useState(true);
const gen=()=>{const set="abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"+(sym?"!@#$%^&*-_=+?":"");const a=new Uint32Array(len);crypto.getRandomValues(a);setPw([...a].map(n=>set[n%set.length]).join(""));};
return(<div className="space-y-3"><Row l={`Length: ${len}`}><input type="range" min={8} max={64} value={len} onChange={e=>setLen(+e.target.value)} className="w-full"/></Row><label className="flex gap-2 text-sm"><input type="checkbox" checked={sym} onChange={e=>setSym(e.target.checked)}/>Include symbols</label>
<div className="flex gap-2"><button className="btn" onClick={gen}>Generate</button>{pw&&<button className="btn" onClick={()=>copy(pw)}>Copy</button>}</div>{pw&&<Out><code className="break-all">{pw}</code></Out>}<p className="text-xs text-neutral-500">Generated locally with your browser’s secure random source.</p></div>);}
export default function ToolUI({slug}:{slug:string}){
if(["word-counter","character-counter","case-converter","remove-extra-spaces","text-reverser"].includes(slug))return<TextTool mode={slug}/>;
const m:Record<string,()=>JSX.Element>={"percentage-calculator":Pct,"age-calculator":Age,"emi-calculator":Emi,"gst-calculator":Gst,"discount-calculator":Disc,"bmi-calculator":Bmi,"password-generator":Pw};
const C=m[slug];return C?<C/>:<More slug={slug}/>;}
