import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn("flex h-10 w-full rounded-lg border bg-background px-3 text-sm disabled:opacity-50", className)}
      {...props}
    />
  ),
);
Select.displayName = "Select";
