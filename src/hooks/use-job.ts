"use client";

import { useCallback, useState } from "react";
import { UserError } from "@/lib/errors";

export interface JobOutput {
  name: string;
  blob: Blob;
}
export interface JobResult {
  outputs: JobOutput[];
  note?: string;
}
export type JobState =
  | { status: "idle" }
  | { status: "working"; progress: number; label: string }
  | ({ status: "done" } & JobResult)
  | { status: "error"; message: string };

type Report = (progress: number, label?: string) => void;

export function useJob() {
  const [state, setState] = useState<JobState>({ status: "idle" });

  const run = useCallback(async (task: (report: Report) => Promise<JobResult>) => {
    setState({ status: "working", progress: 0, label: "Starting..." });
    try {
      const result = await task((progress, label = "Processing...") =>
        setState({ status: "working", progress: Math.min(1, Math.max(0, progress)), label }),
      );
      setState({ status: "done", ...result });
    } catch (e) {
      setState({
        status: "error",
        message:
          e instanceof UserError
            ? e.message
            : "Something went wrong while processing this file. It may be damaged or in an unsupported format.",
      });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset };
}
