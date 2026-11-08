"use client";
import {useSearchParams} from "next/navigation";import ExploreClient from "./ExploreClient";
export default function ExploreFromUrl(){const p=useSearchParams();const q=p.get("q")||"";const c=p.get("category")||"";
return<ExploreClient key={`${q}-${c}`} initialQuery={q||undefined} initialCategory={c||undefined}/>;}
