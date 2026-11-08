"use client";import {useState} from "react";
import type {PDFDocument as PDFDoc} from "pdf-lib";
const MAX=50*1024*1024;
const kb=(n:number)=>n>1048576?(n/1048576).toFixed(2)+" MB":(n/1024).toFixed(1)+" KB";
const blobUrl=(b:BlobPart,type:string)=>URL.createObjectURL(new Blob([b],{type}));
const parse=(s:string,n:number)=>{const out:number[]=[];for(const part of s.split(",")){const m=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!m)throw new Error(`Invalid range "${part.trim()}". Use e.g. 1-3,5.`);const a=+m[1],b=m[2]?+m[2]:a;if(a<1||b<a||b>n)throw new Error(`Pages must be between 1 and ${n}.`);for(let i=a;i<=b;i++)out.push(i-1)}return out;};
const BAD="Couldn’t read this file. It may be password-protected or damaged.";
export default function Pdf({mode}:{mode:string}){
const multi=mode==="merge-pdf"||mode==="images-to-pdf";const img=mode==="images-to-pdf";
const[files,setFiles]=useState<File[]>([]);const[range,setRange]=useState("");const[busy,setBusy]=useState(false);const[err,setErr]=useState("");
const[res,setRes]=useState<{url:string;name:string;size:number}|null>(null);const[info,setInfo]=useState<string[]>([]);const[pages,setPages]=useState<{url:string;n:number}[]>([]);
const reset=()=>{setRes(null);setInfo([]);setPages([]);setErr("")};
const pick=(l:FileList|null)=>{reset();if(!l)return;const ok:File[]=[];for(const f of Array.from(l)){const good=img?f.type.startsWith("image/"):f.type==="application/pdf"||f.name.toLowerCase().endsWith(".pdf");if(!good){setErr(`“${f.name}” is not a ${img?"image":"PDF"}.`);continue}if(f.size>MAX){setErr(`“${f.name}” is over 50 MB.`);continue}ok.push(f)}setFiles(multi?[...files,...ok]:ok.slice(0,1))};
const move=(i:number)=>{if(i<1)return;const a=[...files];[a[i-1],a[i]]=[a[i],a[i-1]];setFiles(a)};
const run=async()=>{reset();if(!files.length){setErr("Choose a file first.");return}if(mode==="merge-pdf"&&files.length<2){setErr("Choose at least two PDFs.");return}setBusy(true);
try{const{PDFDocument}=await import("pdf-lib");
const open=async(f:File)=>{try{return await PDFDocument.load(await f.arrayBuffer())}catch{throw new Error(BAD)}};
const finish=async(d:PDFDoc,name:string)=>{const b=await d.save();setRes({url:blobUrl(b as BlobPart,"application/pdf"),name,size:b.length})};
if(mode==="merge-pdf"){const out=await PDFDocument.create();for(const f of files){const d=await open(f);(await out.copyPages(d,d.getPageIndices())).forEach(p=>out.addPage(p))}await finish(out,"merged.pdf")}
else if(mode==="extract-pdf-pages"){const d=await open(files[0]);const idx=parse(range,d.getPageCount());const out=await PDFDocument.create();(await out.copyPages(d,idx)).forEach(p=>out.addPage(p));await finish(out,"extracted.pdf")}
else if(mode==="pdf-info"){const d=await open(files[0]);const p=d.getPage(0);setInfo([`File size: ${kb(files[0].size)}`,`Pages: ${d.getPageCount()}`,`First page size: ${Math.round(p.getWidth())} × ${Math.round(p.getHeight())} pt`,`Title: ${d.getTitle()||"—"}`,`Author: ${d.getAuthor()||"—"}`,`Creator: ${d.getCreator()||"—"}`,`Created: ${d.getCreationDate()?.toLocaleString()||"—"}`])}
else if(mode==="images-to-pdf"){const out=await PDFDocument.create();for(const f of files){let bytes=new Uint8Array(await f.arrayBuffer());let e;try{if(f.type==="image/jpeg")e=await out.embedJpg(bytes);else if(f.type==="image/png")e=await out.embedPng(bytes);else{const bm=await createImageBitmap(f);const c=document.createElement("canvas");c.width=bm.width;c.height=bm.height;c.getContext("2d")!.drawImage(bm,0,0);const bl:Blob|null=await new Promise(r=>c.toBlob(r,"image/png"));if(!bl)throw 0;e=await out.embedPng(new Uint8Array(await bl.arrayBuffer()))}}catch{throw new Error(`Couldn’t read image “${f.name}”.`)}
out.addPage([e.width,e.height]).drawImage(e,{x:0,y:0,width:e.width,height:e.height})}await finish(out,"images.pdf")}
else if(mode==="pdf-to-images"){const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc="/pdf.worker.min.js";let doc;try{doc=await pdfjs.getDocument({data:new Uint8Array(await files[0].arrayBuffer())}).promise}catch{throw new Error(BAD)}
if(doc.numPages>50)throw new Error("Please use a PDF with 50 pages or fewer.");const out:{url:string;n:number}[]=[];
for(let n=1;n<=doc.numPages;n++){const pg=await doc.getPage(n);const vp=pg.getViewport({scale:1.5});const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext("2d")!,viewport:vp}).promise;const bl:Blob|null=await new Promise(r=>c.toBlob(r,"image/png"));if(bl)out.push({url:URL.createObjectURL(bl),n})}setPages(out)}
}catch(e){setErr(e instanceof Error?e.message:"Something went wrong.")}setBusy(false)};
const label:Record<string,string>={"merge-pdf":"Merge PDFs","pdf-to-images":"Convert to images","images-to-pdf":"Create PDF","extract-pdf-pages":"Extract pages","pdf-info":"Show information"};
return(<div className="space-y-3"><input type="file" multiple={multi} accept={img?"image/*":"application/pdf,.pdf"} onChange={e=>{pick(e.target.files);e.target.value=""}} className="text-sm"/>
{files.length>0&&<ul className="space-y-1 text-sm">{files.map((f,i)=><li key={i} className="flex items-center gap-2"><span className="truncate">{f.name}</span><span className="text-neutral-500">{kb(f.size)}</span><span className="ml-auto flex gap-2">{multi&&<button className="text-xs underline" onClick={()=>move(i)}>Up</button>}<button className="text-xs text-red-600 underline" onClick={()=>{reset();setFiles(files.filter((_,j)=>j!==i))}}>Remove</button></span></li>)}</ul>}
{mode==="extract-pdf-pages"&&<label className="block text-sm"><span className="mb-1 block text-neutral-500">Pages to extract (e.g. 1-3,5)</span><input className="input" value={range} onChange={e=>setRange(e.target.value)}/></label>}
{err&&<p className="text-sm text-red-600" role="alert">{err}</p>}
<button className="btn" disabled={busy||!files.length} onClick={run}>{busy?"Working…":label[mode]}</button>
{res&&<div className="rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800">Done · {kb(res.size)} <a className="btn ml-3 inline-block" href={res.url} download={res.name}>Download</a></div>}
{info.length>0&&<ul className="rounded-lg bg-neutral-100 p-3 text-sm dark:bg-neutral-800">{info.map(l=><li key={l}>{l}</li>)}</ul>}
{pages.length>0&&<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{pages.map(p=><div key={p.n}><img src={p.url} alt={`Page ${p.n}`} className="rounded border"/><a className="text-xs underline" href={p.url} download={`page-${p.n}.png`}>Download page {p.n}</a></div>)}</div>}
<p className="text-xs text-neutral-500">Files are processed in your browser and never uploaded. Max 50 MB each. Encrypted PDFs aren’t supported.</p></div>);}
