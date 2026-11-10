"use client";import {useState,useEffect,useRef,type ReactNode} from "react";import Pdf from "./PdfTools";import {toast} from "./Toast";
const copyT=(s:string)=>{navigator.clipboard?.writeText(s);toast("Copied to clipboard")};
const Row=({l,children}:{l:string;children:ReactNode})=><label className="block text-sm"><span className="mb-1 block text-neutral-500">{l}</span>{children}</label>;
const Out=({children}:{children:ReactNode})=><div className="mt-4 rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800" role="status">{children}</div>;
const fmt=(n:number)=>n.toLocaleString(undefined,{maximumFractionDigits:6});
const kb=(n:number)=>n>1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
function useLS<T>(k:string,init:T):[T,(v:T)=>void]{const[v,setV]=useState<T>(init);useEffect(()=>{try{const s=localStorage.getItem(k);if(s)setV(JSON.parse(s))}catch{}},[k]);const set=(x:T)=>{setV(x);try{localStorage.setItem(k,JSON.stringify(x))}catch{}};return[v,set];}
const clearable=(k:string,reset:()=>void)=><button className="mt-3 text-xs text-red-600 underline" onClick={()=>{if(confirm("Delete this saved data from your browser? This can't be undone.")){try{localStorage.removeItem(k)}catch{}reset()}}}>Delete saved data</button>;

const U:Record<string,Record<string,number>>={Length:{m:1,km:1000,cm:0.01,mm:0.001,mi:1609.344,ft:0.3048,in:0.0254},Weight:{kg:1,g:0.001,lb:0.45359237,oz:0.028349523125}};
function Units(){const[cat,setCat]=useState("Length");const[v,setV]=useState("1");const[f,setF]=useState("m");const[t,setT]=useState("ft");
const units=cat==="Temperature"?["°C","°F","K"]:Object.keys(U[cat]);const n=v.trim()===""?NaN:Number(v);
let r=NaN;if(!isNaN(n)){if(cat==="Temperature"){const c=f==="°C"?n:f==="°F"?(n-32)*5/9:n-273.15;r=t==="°C"?c:t==="°F"?c*9/5+32:c+273.15}else r=n*U[cat][f]/U[cat][t];}
const pick=(c:string)=>{setCat(c);const u=c==="Temperature"?["°C","°F","K"]:Object.keys(U[c]);setF(u[0]);setT(u[1])};
return(<div className="space-y-3"><div className="grid gap-3 sm:grid-cols-4"><Row l="Type"><select className="input" value={cat} onChange={e=>pick(e.target.value)}>{["Length","Weight","Temperature"].map(c=><option key={c}>{c}</option>)}</select></Row>
<Row l="Value"><input className="input" type="number" value={v} onChange={e=>setV(e.target.value)}/></Row>
<Row l="From"><select className="input" value={f} onChange={e=>setF(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></Row><Row l="To"><select className="input" value={t} onChange={e=>setT(e.target.value)}>{units.map(u=><option key={u}>{u}</option>)}</select></Row></div>
{isNaN(r)?<p className="text-sm text-red-600">Enter a valid number.</p>:<Out>{fmt(n)} {f} = <b>{fmt(r)} {t}</b></Out>}</div>);}

function Tts(){const[t,setT]=useState("");const ok=typeof window!=="undefined"&&"speechSynthesis" in window;
if(!ok)return<p className="text-sm">Your browser doesn’t support speech synthesis.</p>;
return(<div className="space-y-3"><textarea className="input h-32" value={t} onChange={e=>setT(e.target.value)} placeholder="Text to read aloud…"/><div className="flex gap-2"><button className="btn" disabled={!t.trim()} onClick={()=>{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(t))}}>Speak</button><button className="btn" onClick={()=>speechSynthesis.cancel()}>Stop</button></div></div>);}
function Stt(){const[t,setT]=useState("");const[on,setOn]=useState(false);const[err,setErr]=useState("");const rec=useRef<any>(null);
const W:any=typeof window!=="undefined"?window:{};const R=W.SpeechRecognition||W.webkitSpeechRecognition;
if(!R)return<p className="text-sm">Speech recognition isn’t supported in this browser. Try Chrome or Edge.</p>;
const start=()=>{setErr("");const r=new R();r.continuous=true;r.interimResults=false;r.onresult=(e:any)=>{let s="";for(let i=e.resultIndex;i<e.results.length;i++)s+=e.results[i][0].transcript+" ";setT(p=>p+s)};r.onerror=(e:any)=>{setErr("Error: "+e.error);setOn(false)};r.onend=()=>setOn(false);rec.current=r;r.start();setOn(true)};
return(<div className="space-y-3"><div className="flex gap-2">{on?<button className="btn" onClick={()=>rec.current?.stop()}>Stop</button>:<button className="btn" onClick={start}>Start listening</button>}<button className="btn" onClick={()=>copyT(t)}>Copy</button></div>{err&&<p className="text-sm text-red-600">{err}</p>}<textarea className="input h-40" value={t} onChange={e=>setT(e.target.value)} placeholder="Your transcript appears here. Some browsers send audio to their own speech service."/></div>);}

function Todo(){const[items,set]=useLS<{t:string;d:boolean}[]>("dd-todo",[]);const[x,setX]=useState("");
const add=()=>{if(x.trim()){set([...items,{t:x.trim(),d:false}]);setX("")}};
return(<div><div className="flex gap-2"><input className="input" value={x} onChange={e=>setX(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a task"/><button className="btn" onClick={add}>Add</button></div>
{items.length===0&&<p className="mt-4 text-sm text-neutral-500">No tasks yet.</p>}
<ul className="mt-3 space-y-2">{items.map((i,k)=><li key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={i.d} onChange={()=>set(items.map((o,j)=>j===k?{...o,d:!o.d}:o))}/><span className={i.d?"line-through opacity-50":""}>{i.t}</span><button className="ml-auto text-xs text-neutral-500" onClick={()=>set(items.filter((_,j)=>j!==k))}>Remove</button></li>)}</ul>
<p className="mt-3 text-xs text-neutral-500">Saved only in this browser. Clearing site data or using another device loses it.</p>{clearable("dd-todo",()=>set([]))}</div>);}
function Notes(){const[n,set]=useLS<string>("dd-notes","");return(<div><textarea className="input h-64" value={n} onChange={e=>set(e.target.value)} placeholder="Start typing. Notes save automatically in this browser."/><p className="mt-2 text-xs text-neutral-500">Stored locally; not synced across devices.</p>{clearable("dd-notes",()=>set(""))}</div>);}

const pad=(n:number)=>String(n).padStart(2,"0");
function Timer({presets,custom}:{presets?:[string,number][];custom?:boolean}){const[left,setLeft]=useState(presets?presets[0][1]:300);const[run,setRun]=useState(false);const[m,setM]=useState("5");
useEffect(()=>{if(!run)return;const end=Date.now()+left*1000;const id=setInterval(()=>{const r=Math.max(0,Math.round((end-Date.now())/1000));setLeft(r);if(r===0){setRun(false);try{new Audio().play().catch(()=>{})}catch{}if("Notification" in window&&Notification.permission==="granted")new Notification("DailyDesk: time’s up")}},250);return()=>clearInterval(id)},[run]);
return(<div className="space-y-3 text-center"><div className="text-6xl font-semibold tabular-nums" role="timer">{pad(Math.floor(left/60))}:{pad(left%60)}</div>
{left===0&&<p className="text-sm font-medium">Time’s up!</p>}
<div className="flex flex-wrap justify-center gap-2">{presets?.map(([l,s])=><button key={l} className="rounded-full border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700" onClick={()=>{setRun(false);setLeft(s)}}>{l}</button>)}
{custom&&<><input className="input w-24" type="number" min="1" max="999" value={m} onChange={e=>setM(e.target.value)} aria-label="Minutes"/><button className="btn" onClick={()=>{const v=Number(m);if(v>0&&v<=999){setRun(false);setLeft(Math.round(v*60))}}}>Set minutes</button></>}</div>
<div className="flex justify-center gap-2"><button className="btn" disabled={left===0} onClick={()=>setRun(!run)}>{run?"Pause":"Start"}</button></div></div>);}
function Stopwatch(){const[ms,setMs]=useState(0);const[run,setRun]=useState(false);const base=useRef(0);
useEffect(()=>{if(!run)return;const s=Date.now()-base.current;const id=setInterval(()=>{base.current=Date.now()-s;setMs(Date.now()-s)},50);return()=>clearInterval(id)},[run]);
const t=Math.floor(ms/10);return(<div className="space-y-3 text-center"><div className="text-6xl font-semibold tabular-nums" role="timer">{pad(Math.floor(t/6000))}:{pad(Math.floor(t/100)%60)}.{pad(t%100)}</div><div className="flex justify-center gap-2"><button className="btn" onClick={()=>setRun(!run)}>{run?"Pause":"Start"}</button><button className="btn" onClick={()=>{setRun(false);setMs(0);base.current=0}}>Reset</button></div></div>);}

function Color(){const[h,setH]=useState("#4f46e5");const rgb=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const W:any=typeof window!=="undefined"?window:{};
return(<div className="space-y-3"><div className="flex items-center gap-3"><input type="color" value={h} onChange={e=>setH(e.target.value)} className="h-14 w-20"/>{W.EyeDropper&&<button className="btn" onClick={async()=>{try{const r=await new W.EyeDropper().open();setH(r.sRGBHex)}catch{}}}>Pick from screen</button>}</div>
<Out><p>HEX <b>{h.toUpperCase()}</b> <button className="ml-2 underline" onClick={()=>copyT(h.toUpperCase())}>Copy</button></p><p>RGB <b>rgb({rgb.join(", ")})</b> <button className="ml-2 underline" onClick={()=>copyT(`rgb(${rgb.join(", ")})`)}>Copy</button></p></Out></div>);}

function Qr(){const[t,setT]=useState("");const[url,setUrl]=useState("");const[err,setErr]=useState("");
useEffect(()=>{if(!t.trim()){setUrl("");return}if(t.length>1000){setErr("Text is too long (max 1000 characters).");setUrl("");return}setErr("");import("qrcode").then(m=>m.toDataURL(t,{width:320,margin:2})).then(setUrl).catch(()=>setErr("Couldn’t generate a QR code."))},[t]);
return(<div className="space-y-3"><Row l="Text or link"><input className="input" value={t} onChange={e=>setT(e.target.value)} placeholder="https://example.com"/></Row>{err&&<p className="text-sm text-red-600">{err}</p>}{url&&<div><img src={url} alt="QR code" width={240} height={240} className="rounded border bg-white"/><a className="btn mt-3 inline-block" href={url} onClick={()=>toast("Download started")} download="qr-code.png">Download PNG</a></div>}</div>);}

const MAX=15*1024*1024;
function Img({mode}:{mode:string}){const[file,setFile]=useState<File|null>(null);const[src,setSrc]=useState("");const[out,setOut]=useState<{url:string;size:number;ext:string}|null>(null);const[q,setQ]=useState(0.7);const[w,setW]=useState("");const[fmt,setFmt]=useState("image/webp");const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
const pick=(f?:File)=>{setOut(null);setErr("");if(!f)return;if(!f.type.startsWith("image/")){setErr("Please choose an image file.");return}if(f.size>MAX){setErr("File is larger than 15 MB.");return}setFile(f);setSrc(URL.createObjectURL(f))};
const run=async()=>{if(!file)return;setBusy(true);setErr("");try{const img=new Image();img.src=src;await img.decode();let W=img.naturalWidth,H=img.naturalHeight;
if(mode==="image-resizer"){const n=Number(w);if(!(n>0&&n<=10000))throw new Error("Enter a width between 1 and 10000 px.");H=Math.round(H*n/W);W=Math.round(n)}
const type=mode==="png-to-jpg"||mode==="image-compressor"?"image/jpeg":mode==="jpg-to-png"?"image/png":mode==="image-converter"?fmt:(["image/png","image/jpeg","image/webp"].includes(file.type)?file.type:"image/png");
const c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");if(!g)throw new Error("Canvas is not supported.");if(type==="image/jpeg"){g.fillStyle="#fff";g.fillRect(0,0,W,H)}g.drawImage(img,0,0,W,H);
const blob:Blob|null=await new Promise(r=>c.toBlob(r,type,mode==="image-compressor"||type!=="image/png"?q:undefined));if(!blob||blob.type!==type)throw new Error("This browser can’t export that format.");
setOut({url:URL.createObjectURL(blob),size:blob.size,ext:type.split("/")[1].replace("jpeg","jpg")})}catch(e){setErr(e instanceof Error?e.message:"Couldn’t process this image.")}setBusy(false)};
return(<div className="space-y-3"><input type="file" accept="image/*" onChange={e=>pick(e.target.files?.[0])} className="text-sm"/>
{(mode==="image-compressor"||mode==="image-converter")&&<Row l={`Quality: ${Math.round(q*100)}%`}><input type="range" min={0.1} max={1} step={0.05} value={q} onChange={e=>setQ(+e.target.value)} className="w-full"/></Row>}
{mode==="image-converter"&&<Row l="Output format"><select className="input" value={fmt} onChange={e=>setFmt(e.target.value)}><option value="image/webp">WebP</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select></Row>}
{mode==="image-resizer"&&<Row l="New width (px, height keeps aspect ratio)"><input className="input" type="number" value={w} onChange={e=>setW(e.target.value)}/></Row>}
{err&&<p className="text-sm text-red-600">{err}</p>}
<button className="btn" disabled={!file||busy} onClick={run}>{busy?"Processing…":"Process image"}</button>
{src&&<div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-neutral-500">Original{file&&` · ${kb(file.size)}`}</p><img src={src} alt="Original" className="max-h-60 rounded border"/></div>
{out&&<div><p className="text-xs text-neutral-500">Result · {kb(out.size)}</p><img src={out.url} alt="Processed" className="max-h-60 rounded border"/><a className="btn mt-2 inline-block" href={out.url} onClick={()=>toast("Download started")} download={`dailydesk-image.${out.ext}`}>Download</a></div>}</div>}
<p className="text-xs text-neutral-500">Processed in your browser. Nothing is uploaded. Max 15 MB.</p></div>);}

export default function More({slug}:{slug:string}){
if(["image-compressor","image-resizer","png-to-jpg","jpg-to-png","image-converter"].includes(slug))return<Img mode={slug}/>;
if(["compress-pdf","merge-pdf","pdf-to-images","images-to-pdf","extract-pdf-pages","pdf-info"].includes(slug))return<Pdf mode={slug}/>;
switch(slug){case"unit-converter":return<Units/>;case"text-to-speech":return<Tts/>;case"speech-to-text":return<Stt/>;case"todo-list":return<Todo/>;case"notes":return<Notes/>;
case"pomodoro-timer":return<Timer presets={[["Focus 25m",1500],["Short break 5m",300],["Long break 15m",900]]}/>;case"countdown-timer":return<Timer custom/>;case"stopwatch":return<Stopwatch/>;case"color-picker":return<Color/>;case"qr-generator":return<Qr/>;}
return<p>Coming soon.</p>;}
