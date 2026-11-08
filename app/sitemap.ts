import type {MetadataRoute} from "next";import {tools} from "@/lib/tools";
const base=process.env.NEXT_PUBLIC_SITE_URL||"https://dailydesk.vercel.app";
export default function sitemap():MetadataRoute.Sitemap{return[{url:base},{url:`${base}/tools`},...tools.filter(t=>t.live).map(t=>({url:`${base}/tools/${t.slug}`}))];}
