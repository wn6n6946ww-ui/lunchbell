"use client";

import { getCongestionLevel } from "@/lib/waitTime";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  count: number;
  className?: string;
}

export function StatusBadge({ count, className }: StatusBadgeProps) {
  const info = getCongestionLevel(count);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        info.bgColor,
        info.color,
        info.borderColor,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            info.level === "free" && "bg-emerald-500",
            info.level === "normal" && "bg-yellow-500",
            info.level === "busy" && "bg-orange-500",
            info.level === "very-busy" && "bg-red-500"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            info.level === "free" && "bg-emerald-500",
            info.level === "normal" && "bg-yellow-500",
            info.level === "busy" && "bg-orange-500",
            info.level === "very-busy" && "bg-red-500"
          )}
        />
      </span>
      {info.label}
    </span>
  );
}
