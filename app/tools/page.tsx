import type {Metadata} from "next";
import {Suspense} from "react";
import ExploreFromUrl from "@/components/ExploreFromUrl";

export const metadata: Metadata = {
  title: "Explore Tools",
  description: "Search and browse all DailyDesk tools.",
  alternates: {canonical: "/tools"},
};

export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Explore Tools</h1>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading tools…</p>}>
        <ExploreFromUrl />
      </Suspense>
    </div>
  );
}
