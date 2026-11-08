import type {Metadata} from "next";import ExploreClient from "@/components/ExploreClient";
export const metadata:Metadata={title:"Explore Tools",description:"Search and browse all DailyDesk tools.",alternates:{canonical:"/tools"}};
export default function Page({searchParams}:{searchParams:{q?:string;category?:string}}){return(<div><h1 className="mb-4 text-2xl font-semibold">Explore Tools</h1><ExploreClient initialQuery={searchParams.q} initialCategory={searchParams.category}/></div>);}
