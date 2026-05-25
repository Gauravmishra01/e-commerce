import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-200/80", className)}
      {...props}
    />
  );
}

export { Skeleton };
